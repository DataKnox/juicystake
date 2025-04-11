import { SystemProgram, StakeProgram, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

async function handleSplitStakeAccount(connection, wallet, sourceStakeAccountId, amountSOL, onSuccess) {
    try {
        const sourceStakeAccountPubkey = new PublicKey(sourceStakeAccountId);
        const lamports = amountSOL * 1e9; // Convert SOL to lamports

        // Create a new stake account
        const newStakeAccount = new PublicKey();
        const createStakeAccountIx = SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: newStakeAccount,
            lamports,
            space: 200,
            programId: StakeProgram.programId,
        });

        // Initialize the new stake account
        const initializeStakeAccountIx = StakeProgram.initialize({
            stakePubkey: newStakeAccount,
            authorized: {
                staker: wallet.publicKey,
                withdrawer: wallet.publicKey,
            },
        });

        // Split the stake
        const splitIx = StakeProgram.split({
            stakePubkey: sourceStakeAccountPubkey,
            authorizedPubkey: wallet.publicKey,
            splitStakePubkey: newStakeAccount,
            lamports,
        });

        // Create and send the transaction
        const transaction = new Transaction()
            .add(createStakeAccountIx)
            .add(initializeStakeAccountIx)
            .add(splitIx);

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet],
            { commitment: 'confirmed' }
        );

        console.log('Stake account split:', signature);
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error splitting stake account:', error);
        throw error;
    }
}

export default handleSplitStakeAccount; 