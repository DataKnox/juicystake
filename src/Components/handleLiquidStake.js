import * as solanaWeb3 from '@solana/web3.js';
import * as solanaStakePool from '@solana/spl-stake-pool';
import fetch from 'node-fetch';

const { Connection, Transaction, Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL, sendAndConfirmRawTransaction, TransactionInstruction } = solanaWeb3;
const { getStakePoolAccount, updateStakePool, depositSol, depositStake, withdrawSol, withdrawStake, stakePoolInfo } = solanaStakePool;

const BLAZESTAKE_POOL = new PublicKey("stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi");
const SOLPAY_API_ACTIVATION = new PublicKey("7f18MLpvAp48ifA1B8q8FBdrGQhyt9u5Lku2VBYejzJL");



async function handleLiquidStake(amount, walletContext, connection, onSuccessfulTransaction) {
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

    let lamports = amount * LAMPORTS_PER_SOL;
    console.log('Depositing', lamports, 'lamports to BlazeStake pool');


    let depositTx = await depositSol(
        connection,
        BLAZESTAKE_POOL,
        walletContext.publicKey,
        lamports,
        undefined,
        walletContext.publicKey
    );

    let transaction = new Transaction();
    transaction.add(SystemProgram.transfer({
        fromPubkey: walletContext.publicKey,
        toPubkey: SOLPAY_API_ACTIVATION,
        lamports: 5000
    }));

    transaction.add(...depositTx.instructions);

    const blockhashDetails = await connection.getRecentBlockhash();
    transaction.recentBlockhash = blockhashDetails.blockhash;
    transaction.feePayer = walletContext.publicKey;
    console.log(transaction)
    transaction = await walletContext.signTransaction(transaction)

    let signers = depositTx.signers;
    if (signers.length > 0) {
        transaction.partialSign(...signers);
    }

    const signature = await connection.sendRawTransaction(transaction.serialize());
    await checkTransactionStatus(connection, signature);
}

export default handleLiquidStake;