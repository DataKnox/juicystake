import { PublicKey, StakeProgram, Transaction } from '@solana/web3.js';


const handleDeactivateStakeAccount = async (stakeAccountId, wallet, connection, onSuccessfulTransaction) => {
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

        transaction.add(deactivateStakeInstruction);
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;

        // Sign and send the transaction
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await checkTransactionStatus(connection, signature);

        console.log('Stake account deactivated:', signature);

    } catch (error) {
        console.error('Error during stake account deactivation:', error);
    }
};

export default handleDeactivateStakeAccount;