// Import necessary modules from @solana/web3.js
import { Connection, PublicKey, StakeProgram, Transaction, StakeAuthorizationLayout, ComputeBudgetProgram } from '@solana/web3.js';
import { toast } from 'react-toastify';

/**
 * Authorizes a new wallet address as the stake account authority.
 * @param {Connection} connection - The Solana connection object.
 * @param {Object} wallet - The wallet object from @solana/wallet-adapter-react.
 * @param {string} stakeAccountPubkeyStr - The public key of the stake account as a string.
 * @param {string} targetAddressStr - The target wallet address as a string.
 * @param {Function} onSuccessfulTransaction - Callback function to execute on successful transaction.
 */
async function authorizeNewStakeAuthority(connection, wallet, stakeAccountPubkeyStr, targetAddressStr, onSuccessfulTransaction) {
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

    const stakeAccountPubkey = new PublicKey(stakeAccountPubkeyStr);
    const targetAddress = new PublicKey(targetAddressStr);

    let transaction = new Transaction();
    const PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 });
    const stakeAuthorizationType = {
        index: 0 // Assuming we are setting a new Staker; adjust the index as needed
    };

    const authorizeStakerInstruction = StakeProgram.authorize({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: wallet.publicKey, // The current authority's public key
        newAuthorizedPubkey: targetAddress, // The new authority's public key
        stakeAuthorizationType: stakeAuthorizationType, // Use the defined authorization type
    });

    transaction.add(authorizeStakerInstruction);
    const authorizeWithdrawerInstruction = StakeProgram.authorize({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: wallet.publicKey, // The current authority's public key
        newAuthorizedPubkey: targetAddress, // The new authority's public key
        stakeAuthorizationType: { index: 1 }, // Use the defined authorization type
    });
    transaction.add(authorizeWithdrawerInstruction);
    transaction.add(PRIORITY_FEE_IX);
    try {
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        const signedTransaction = await wallet.signTransaction(transaction);
        const transactionId = await connection.sendRawTransaction(signedTransaction.serialize());
        toast.info('Confirming Txn', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        checkTransactionStatus(connection, transactionId);
    } catch (error) {
        console.error("Error authorizing new stake authority:", error);
        throw error;
    }
}

export default authorizeNewStakeAuthority;
