import { VersionedTransaction } from '@solana/web3.js';
import { toast } from 'react-toastify';

/**
 * Converts a base64 string to a Uint8Array
 * @param {string} base64 - The base64 string to convert
 * @returns {Uint8Array} - The resulting Uint8Array
 */
export function base64ToUint8Array(base64) {
    const raw = atob(base64);
    const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
    for (let i = 0; i < raw.length; i++) {
        uint8Array[i] = raw.charCodeAt(i);
    }
    return uint8Array;
}

/**
 * Signs and sends a transaction
 * @param {string} base64EncodedTransaction - The transaction encoded as base64
 * @param {Connection} connection - The Solana connection object
 * @param {Function} signTransaction - The wallet's signTransaction function
 * @param {Function} sendTransaction - The wallet's sendTransaction function
 * @param {PublicKey} publicKey - The user's public key
 * @param {Function} onSuccess - Callback function to execute on success
 */
export const handleSignAndSendTransaction = async (
    base64EncodedTransaction,
    connection,
    signTransaction,
    sendTransaction,
    publicKey,
    onSuccess
) => {
    if (!publicKey || !signTransaction || !sendTransaction) {
        console.error("Wallet is not connected");
        return;
    }

    try {
        const uint8Array = base64ToUint8Array(base64EncodedTransaction);
        const decodedTransaction = VersionedTransaction.deserialize(uint8Array);

        const signedTransaction = await signTransaction(decodedTransaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        toast.info('Confirming Transaction', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });

        const startTime = Date.now();
        let timeout = 60000;
        while (Date.now() - startTime < timeout) {
            const status = await connection.getSignatureStatus(signature);
            if (status && status.value && status.value.confirmationStatus === 'confirmed') {
                toast.success('Transaction Confirmed!', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });

                console.log('Transaction confirmed:', signature);

                if (onSuccess) {
                    onSuccess();
                }
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
        }
    } catch (error) {
        console.error("Error signing or sending transaction:", error);
        toast.error('Transaction Failed', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }
};

// Import the handlers from their respective files
// We're re-exporting them here to provide a single import point
export { default as handleStake } from '../Components/handleStake';
export { default as handleDeactivateStakeAccount } from '../Components/handleUnstake';
export { default as mergeStakeAccounts } from '../Components/handleMerge';
export { default as authorizeNewStakeAuthority } from '../Components/handleSend';
export { default as handleSplitStakeAccount } from '../Components/handleSplit';
export { default as handleLiquidStake } from '../Components/handleLiquidStake';
export { default as handleLiquidStakeTransfer } from '../Components/handleLiquidStakeTxfr';
export { default as handleJucySolQuote } from '../Components/handleJucySolQuote'; 