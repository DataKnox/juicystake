import { PublicKey, StakeProgram, Transaction, sendAndConfirmTransaction, ComputeBudgetProgram } from '@solana/web3.js';
import { toast } from 'react-toastify';

const mergeStakeAccounts = async (connection, wallet, sourceStakeAccountId, destinationStakeAccountId, onSuccessfulTransaction) => {
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
        }).instructions[0];
        const blockhashDetails = await connection.getRecentBlockhash();
        const PRIORITY_FEE_IX = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 10000 });

        const transaction = new Transaction().add(mergeInstruction).add(PRIORITY_FEE_IX);
        transaction.recentBlockhash = blockhashDetails.blockhash;
        transaction.lastValidBlockHeight = blockhashDetails.lastValidBlockHeight;
        transaction.feePayer = wallet.publicKey;
        transaction.instructions[0].keys[1].pubkey = sourceStakeAccountPubkey;
        console.log('Signing and sending merge transaction');
        if (!wallet.connected || !wallet.signTransaction) {
            console.error("Wallet not connected or signTransaction method not available.");
            return;
        }

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        toast.info('Confirming Txn', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        await checkTransactionStatus(connection, signature);
    } catch (error) {
        console.error('Error during stake account merge:', error);
    }
};

export default mergeStakeAccounts;
