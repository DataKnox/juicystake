// mergeStakeAccounts.js
import { PublicKey, StakeProgram, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

const mergeStakeAccounts = async (connection, wallet, sourceStakeAccountId, destinationStakeAccountId, onSuccessfulTransaction) => {
    if (!wallet.connected || !wallet.signTransaction) {
        console.error("Wallet not connected or signTransaction method not available.");
        return;
    }

    const sourceStakeAccountPubkey = new PublicKey(sourceStakeAccountId);
    const destinationStakeAccountPubkey = new PublicKey(destinationStakeAccountId);

    try {
        console.log('Merging stake accounts:', sourceStakeAccountId, destinationStakeAccountId);

        const mergeInstruction = StakeProgram.merge({
            stakePubkey: destinationStakeAccountPubkey,
            sourceStakePubkey: sourceStakeAccountPubkey,
            authorizedPubkey: wallet.publicKey,
        });

        const transaction = new Transaction().add(mergeInstruction);
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet.publicKey;

        console.log('Signing and sending merge transaction');
        if (!wallet.connected || !wallet.signTransaction) {
            console.error("Wallet not connected or signTransaction method not available.");
            return;
        }
        //console.log(transaction, wallet.publicKey, sourceStakeAccountPubkey, destinationStakeAccountPubkey);

        const signedTransaction = await wallet.signTransaction(transaction);
        await sendAndConfirmTransaction(connection, signedTransaction, [wallet], {
            commitment: 'confirmed',
            preflightCommitment: 'confirmed',
        });

        console.log('Merge successful');
        if (onSuccessfulTransaction) {
            onSuccessfulTransaction();
        }
    } catch (error) {
        console.error('Error during stake account merge:', error);
    }
};

export default mergeStakeAccounts;
