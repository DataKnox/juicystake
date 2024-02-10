// Import necessary modules from @solana/web3.js
import { Connection, PublicKey, StakeProgram, Transaction, StakeAuthorizationLayout } from '@solana/web3.js';

/**
 * Authorizes a new wallet address as the stake account authority.
 * @param {Connection} connection - The Solana connection object.
 * @param {Object} wallet - The wallet object from @solana/wallet-adapter-react.
 * @param {string} stakeAccountPubkeyStr - The public key of the stake account as a string.
 * @param {string} targetAddressStr - The target wallet address as a string.
 * @param {Function} onSuccessfulTransaction - Callback function to execute on successful transaction.
 */
async function authorizeNewStakeAuthority(connection, wallet, stakeAccountPubkeyStr, targetAddressStr, onSuccessfulTransaction) {
    // Utility function to check transaction status
    async function checkTransactionStatus(connection, signature, timeout = 60000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const status = await connection.getSignatureStatus(signature);
            if (status && status.value && status.value.confirmationStatus === 'confirmed') {
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

    // Create a transaction
    let transaction = new Transaction();

    // Define StakeAuthorizationType for Staker or Withdrawer
    // For example, to authorize a new Staker, the index might be 0.
    // Ensure to use the correct index as per your requirement (e.g., 0 for Staker, 1 for Withdrawer)
    const stakeAuthorizationType = {
        index: 0 // Assuming we are setting a new Staker; adjust the index as needed
    };

    // Create a StakeProgram.authorize instruction
    const authorizeInstruction = StakeProgram.authorize({
        stakePubkey: stakeAccountPubkey,
        authorizedPubkey: wallet.publicKey, // The current authority's public key
        newAuthorizedPubkey: targetAddress, // The new authority's public key
        stakeAuthorizationType: stakeAuthorizationType, // Use the defined authorization type
    });

    // Add the instruction to the transaction
    transaction.add(authorizeInstruction);

    // Sign and send the transaction
    try {
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        const signedTransaction = await wallet.signTransaction(transaction);
        const transactionId = await connection.sendRawTransaction(signedTransaction.serialize());

        // Check the status of the transaction
        checkTransactionStatus(connection, transactionId);
    } catch (error) {
        console.error("Error authorizing new stake authority:", error);
        throw error;
    }
}

export default authorizeNewStakeAuthority;
