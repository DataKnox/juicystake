import * as solanaWeb3 from '@solana/web3.js';
import * as solanaStakePool from '@solana/spl-stake-pool';
import fetch from 'node-fetch';

const { Connection, Transaction, Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL, sendAndConfirmRawTransaction, TransactionInstruction } = solanaWeb3;
const { getStakePoolAccount, updateStakePool, depositSol, depositStake, withdrawSol, withdrawStake, stakePoolInfo } = solanaStakePool;

async function handleLiquidStakeTransfer(walletContext, stakeAccountId, connection, onSuccessfulTransaction) {
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
    const BLAZESTAKE_POOL = new PublicKey("stk9ApL5HeVAwPLr3TLhDXdZS8ptVu7zp6ov8HFDuMi");
    const SOLPAY_API_ACTIVATION = new PublicKey("7f18MLpvAp48ifA1B8q8FBdrGQhyt9u5Lku2VBYejzJL");
    let stakeAccount = new PublicKey(stakeAccountId);
    let stakeAccountData = await connection.getParsedAccountInfo(stakeAccount);
    let stakeAccountValidator = new PublicKey(
        stakeAccountData.value.data.parsed.info.stake.delegation.voter
    );
    console.log('Depositing stake to BlazeStake pool');

    let depositTx = await depositStake(
        connection,
        BLAZESTAKE_POOL,
        walletContext.publicKey,
        stakeAccountValidator,
        stakeAccount
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

    // INSERT YOUR CODE HERE TO SIGN A TRANSACTION WITH A WALLET
    transaction = await walletContext.signTransaction(transaction)

    let signers = depositTx.signers;
    if (signers.length > 0) {
        transaction.partialSign(...signers);
    }
    console.log(transaction.recentBlockhash)
    const signature = await connection.sendRawTransaction(transaction.serialize());
    //await solanaConnection.confirmTransaction(signature, 'confirmed');
    await checkTransactionStatus(connection, signature);

}

export default handleLiquidStakeTransfer;