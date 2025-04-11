import { SystemProgram, StakeProgram, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

async function handleStake(connection, wallet, amountSOL, stakeAuthority, withdrawAuthority, onSuccess) {
    try {
        const fromPubkey = wallet.publicKey;
        const lamports = amountSOL * 1e9; // Convert SOL to lamports

        // Create a new stake account
        const stakeAccount = new PublicKey();
        const createStakeAccountIx = SystemProgram.createAccount({
            fromPubkey,
            newAccountPubkey: stakeAccount,
            lamports,
            space: 200,
            programId: StakeProgram.programId,
        });

        // Initialize the stake account
        const initializeStakeAccountIx = StakeProgram.initialize({
            stakePubkey: stakeAccount,
            authorized: {
                staker: stakeAuthority,
                withdrawer: withdrawAuthority,
            },
        });

        // Create and send the transaction
        const transaction = new Transaction()
            .add(createStakeAccountIx)
            .add(initializeStakeAccountIx);

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet],
            { commitment: 'confirmed' }
        );

        console.log('Stake account created:', signature);
        if (onSuccess) onSuccess();
    } catch (error) {
        console.error('Error creating stake account:', error);
        throw error;
    }
}

export default handleStake; 