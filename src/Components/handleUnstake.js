import { PublicKey, StakeProgram, Transaction } from '@solana/web3.js';
import { toast } from 'react-toastify';



const handleDeactivateStakeAccount = async (stakeAccountId, wallet, connection, onSuccessfulTransaction) => {
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
    if (!wallet.connected) {
        console.log("Wallet is not connected");
        return;
    }

    try {
        console.log('Deactivating stake account:', stakeAccountId);
        const stakeAccountPubkey = new PublicKey(stakeAccountId);
        const transaction = new Transaction();

        const deactivateStakeInstruction = StakeProgram.deactivate({
            stakePubkey: stakeAccountPubkey,
            authorizedPubkey: wallet.publicKey, // Assuming the wallet is the staker authority
        });
        const blockhashDetails = await connection.getRecentBlockhash();
        transaction.add(deactivateStakeInstruction);
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = blockhashDetails.blockhash;

        // Sign and send the transaction
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

        console.log('Stake account deactivated:', signature);

    } catch (error) {
        console.error('Error during stake account deactivation:', error);
    }
};

export default handleDeactivateStakeAccount;