// Import necessary utilities from Solana web3.js
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL, Transaction, Keypair } from '@solana/web3.js';
import { StakeProgram } from '@solana/web3.js';
import { toast } from 'react-toastify';

/**
 * Split a stake account.
 * @param {Connection} connection - The Solana connection object.
 * @param {Object} walletContext - The wallet context from @solana/wallet-adapter-react.
 * @param {string} stakeAccountToSplit - The public key (as a string) of the stake account to split.
 * @param {number} amountSOL - The amount of SOL to split into the new stake account.
 * @param {Function} callback - A callback function to execute after the transaction is confirmed.
 */
const handleSplitStakeAccount = async (connection, walletContext, stakeAccountToSplit, amountSOL, onSuccessfulTransaction) => {
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

    const newStakeAccount = Keypair.generate();
    const accountInfo = await connection.getAccountInfo(newStakeAccount.publicKey);
    if (accountInfo !== null) {
        throw new Error("An account with the generated public key already exists.");
    }


    const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);

    const lamportsToSplit = amountSOL * LAMPORTS_PER_SOL;

    if (lamportsToSplit <= rentExemptBalance) {
        console.error("Amount to split must be greater than the rent-exempt minimum");
        return;
    }

    let transaction = new Transaction();

    transaction.add(StakeProgram.split({
        stakePubkey: new PublicKey(stakeAccountToSplit),
        authorizedPubkey: walletContext.publicKey,
        splitStakePubkey: newStakeAccount.publicKey,
        lamports: lamportsToSplit
    }));

    let { blockhash } = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = walletContext.publicKey;
    console.log(transaction)
    let signedTransaction = await walletContext.signTransaction(transaction);

    signedTransaction.partialSign(newStakeAccount);

    let txid = await connection.sendRawTransaction(signedTransaction.serialize());
    toast.info('Confirming Txn', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
    // Confirm the transaction
    checkTransactionStatus(connection, txid);
};

export default handleSplitStakeAccount;