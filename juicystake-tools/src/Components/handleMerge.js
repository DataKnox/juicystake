import { StakeProgram, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

async function mergeStakeAccounts(connection, wallet, sourceStakeAccountId, destinationStakeAccountId, onSuccess) {
    try {
        const sourceStakeAccountPubkey = new PublicKey(sourceStakeAccountId);
        const destinationStakeAccountPubkey = new PublicKey(destinationStakeAccountId);

        const mergeIx = StakeProgram.merge({
            stakePubkey: destinationStakeAccountPubkey,
            sourceStakePubkey: sourceStakeAccountPubkey,
            authorizedPubkey: wallet.publicKey,
        });

        const transaction = new Transaction().add(mergeIx);
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet],
            { commitment: 'confirmed' }
        );

        console.log('Stake accounts merged:', signature);
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error merging stake accounts:', error);
        throw error;
    }
}

export default mergeStakeAccounts; 