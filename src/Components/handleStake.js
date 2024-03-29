import { Keypair, PublicKey, Authorized, LAMPORTS_PER_SOL, StakeProgram, Transaction, ComputeBudgetProgram } from '@solana/web3.js';
import { toast } from 'react-toastify';

async function handleStake(solanaConnection, wallet, stakeAmountSOL, stakeAuthority, withdrawAuthority, onSuccessfulTransaction) {
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
    const PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 });
    // Convert SOL to lamports
    // Create a new stake account
    const newStakeAccount = Keypair.generate();
    const { blockhash } = await solanaConnection.getRecentBlockhash();
    // Create stake account transaction instruction
    // const createStakeAccountInstruction = SystemProgram.createAccount({
    //     fromPubkey: wallet.publicKey,
    //     newAccountPubkey: newStakeAccount.publicKey,
    //     lamports: stakeAmountLamports,
    //     space: StakeProgram.space,
    //     programId: StakeProgram.programId,
    // });
    let createStakeAccountInstruction = StakeProgram.createAccount({
        fromPubkey: wallet.publicKey,
        stakePubkey: newStakeAccount.publicKey,
        authorized: new Authorized(wallet.publicKey, wallet.publicKey),
        lamports: LAMPORTS_PER_SOL * stakeAmountSOL,
    });
    // // Initialize the stake account (this step is necessary if the stake account is new)
    // const initializeStakeAccountInstruction = StakeProgram.initialize({
    //     stakePubkey: newStakeAccount.publicKey,
    //     authorized: {
    //         staker: stakeAuthority,
    //         withdrawer: withdrawAuthority,
    //     },
    // });
    // console.log('stakeAuthority', stakeAuthority.toBase58());
    // console.log('newStakeAccount.publicKey', newStakeAccount.publicKey.toBase58());
    // console.log('withdrawAuthority', withdrawAuthority.toBase58());
    // console.log('wallet.publicKey', wallet.publicKey.toBase58());
    // Create delegate stake instruction
    const delegateStakeInstruction = StakeProgram.delegate({
        stakePubkey: newStakeAccount.publicKey,
        authorizedPubkey: stakeAuthority,
        votePubkey: new PublicKey('juicQdAnksqZ5Yb8NQwCLjLWhykvXGktxnQCDvMe6Nx'), // Replace with actual vote account pubkey
    });
    // Create a transaction and add instructions
    const transaction = new Transaction() // Use the latest supported version or choose appropriately
        .add(createStakeAccountInstruction)
        .add(delegateStakeInstruction)
        .add(PRIORITY_FEE_IX);
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;
    transaction.partialSign(newStakeAccount);
    // Also, set the transaction's fee payer

    // Sign transaction with the payer and the new stake account
    if (!wallet.connected || !wallet.signTransaction) {
        console.error("Wallet not connected or signTransaction method not available.");
        return;
    }

    try {
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await solanaConnection.sendRawTransaction(signedTransaction.serialize());
        toast.info('Confirming Txn', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        //await solanaConnection.confirmTransaction(signature, 'confirmed');
        await checkTransactionStatus(solanaConnection, signature);
    } catch (error) {
        console.error('Error during stake transaction:', error);
    }
}



export default handleStake;