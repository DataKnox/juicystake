import { StakeProgram, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

async function authorizeNewStakeAuthority(connection, wallet, stakeAccountId, newAuthorityAddress, onSuccess) {
    try {
        const stakeAccountPubkey = new PublicKey(stakeAccountId);
        const newAuthorityPubkey = new PublicKey(newAuthorityAddress);

        const authorizeIx = StakeProgram.authorize({
            stakePubkey: stakeAccountPubkey,
            authorizedPubkey: wallet.publicKey,
            newAuthorizedPubkey: newAuthorityPubkey,
            stakeAuthorizationType: { type: 'Staker' },
        });

        const transaction = new Transaction().add(authorizeIx);
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet],
            { commitment: 'confirmed' }
        );

        console.log('Stake authority transferred:', signature);
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error transferring stake authority:', error);
        throw error;
    }
}

export default authorizeNewStakeAuthority; 