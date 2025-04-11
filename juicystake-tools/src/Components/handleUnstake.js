import { StakeProgram, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

async function handleDeactivateStakeAccount(stakeAccountId, wallet, connection, onSuccess) {
    try {
        const stakeAccountPubkey = new PublicKey(stakeAccountId);
        const deactivateIx = StakeProgram.deactivate({
            stakePubkey: stakeAccountPubkey,
            authorizedPubkey: wallet.publicKey,
        });

        const transaction = new Transaction().add(deactivateIx);
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet],
            { commitment: 'confirmed' }
        );

        console.log('Stake account deactivated:', signature);
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error deactivating stake account:', error);
        throw error;
    }
}

export default handleDeactivateStakeAccount; 