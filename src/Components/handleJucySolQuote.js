import * as solanaWeb3 from '@solana/web3.js';
import { toast } from 'react-toastify';
import { VersionedTransaction } from "@solana/web3.js";

const { Transaction, SystemProgram, PublicKey } = solanaWeb3;


async function handleJucySolQuote(walletContext, stakeAccountId, connection, onSuccessfulTransaction) {
    async function checkTransactionStatus(connection, signature, timeout = 60000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const status = await connection.getSignatureStatus(signature);
            if (status && status.value && status.value.confirmationStatus === 'confirmed') {
                toast.success('Confirmed Txn!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });

                console.log('Transaction confirmed:', signature);
                if (onSuccessfulTransaction) {
                    onSuccessfulTransaction();
                }
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
        }
        console.log('Transaction status unknown after timeout:', signature);
    }

    //QUOTE
    const stakeAccount = new PublicKey(stakeAccountId);
    const stakeAccountData = await connection.getParsedAccountInfo(stakeAccount);
    const stakeAmount = stakeAccountData.value.data.parsed.info.stake.delegation.stake
    const quoteUrl = `https://api.sanctum.so/v1/swap/quote?input=juicQdAnksqZ5Yb8NQwCLjLWhykvXGktxnQCDvMe6Nx&outputLstMint=jucy5XJ76pHVvtPZb5TKRcGQExkwit2P5s4vY8UzmpC&amount=${stakeAmount}&mode=ExactIn`
    const response = await fetch(quoteUrl);
    const data = await response.json();
    console.log(data)

    //SWAP TO GET IXN
    const payload = {
        "input": "juicQdAnksqZ5Yb8NQwCLjLWhykvXGktxnQCDvMe6Nx", // voter pubkey of the stake account
        "outputLstMint": "jucy5XJ76pHVvtPZb5TKRcGQExkwit2P5s4vY8UzmpC", // jucySOL mint pubkey
        "signer": walletContext.publicKey, // signer of the transaction (wallet pubkey)
        "swapSrc": data.swapSrc, // `.swapSrc` returned from `/v1/swap/quote`
        "srcAcc": stakeAccountId, // stake account pubkey

    }
    const swapUrl = 'https://api.sanctum.so/v1/swap'
    const swapResponse = await fetch(swapUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const swapData = await swapResponse.json();
    console.log(swapData)

    //TRANSACTION
    function deserializeVersionedTx(tx) {
        const txBuf = Buffer.from(tx, "base64");
        const versionedTx = VersionedTransaction.deserialize(txBuf);
        return versionedTx;
    }

    let tx = deserializeVersionedTx(swapData.tx); // `res.tx` is TX you get from POSTing to `/v1/swap`
    tx = await walletContext.signTransaction(tx);
    tx.serialize();

    const sig = await connection.sendTransaction(tx, {
        skipPreflight: true,
    });
    checkTransactionStatus(connection, sig);
}

export default handleJucySolQuote;