import * as solanaWeb3 from '@solana/web3.js';
import { toast } from 'react-toastify';

const { PublicKey, VersionedTransaction, ComputeBudgetProgram, Connection } = solanaWeb3;


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
    const connection1 = new Connection('https://juicystake.io:4040', 'confirmed');
    const PRIORITY_RATE = 100; // MICRO_LAMPORTS 
    const PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: PRIORITY_RATE });
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
    const swapTxn = swapData.tx;
    console.log(swapData)

    // //TRANSACTION
    // function base64ToUint8Array(base64) {
    //     const raw = atob(base64);
    //     const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
    //     for (let i = 0; i < raw.length; i++) {
    //         uint8Array[i] = raw.charCodeAt(i);
    //     }
    //     return uint8Array;
    // }
    // function deserializeVersionedTx(tx) {
    //     //console.log(tx)
    //     const uint8Array = base64ToUint8Array(tx);
    //     const decodedTransaction = VersionedTransaction.deserialize(uint8Array);
    //     console.log(decodedTransaction)
    //     return decodedTransaction;
    // }

    function deserializeVersionedTx(tx) {
        const txBuf = Buffer.from(tx, "base64");
        const versionedTx = VersionedTransaction.deserialize(txBuf);
        console.log(versionedTx)
        return versionedTx;
    }


    //let tx = deserializeVersionedTx(swapTxn); // `res.tx` is TX you get from POSTing to `/v1/swap`
    let tx = deserializeVersionedTx(swapTxn);
    // tx = tx.message.compiledInstructions.push(PRIORITY_FEE_IX);
    tx = await walletContext.signTransaction(tx);
    tx.serialize();

    const sig = await connection1.sendTransaction(tx, {
        skipPreflight: true,
    });
    toast.info('Confirming Txn', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
    checkTransactionStatus(connection, sig);
}

export default handleJucySolQuote;