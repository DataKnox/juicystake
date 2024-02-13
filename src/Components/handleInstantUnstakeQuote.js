import { Connection } from "@solana/web3.js";
import { UnstakeAg, legacyTxAmmsToExclude } from "@unstake-it/sol-ag";
import { PublicKey } from "@solana/web3.js";
import { getStakeAccount } from "@soceanfi/solana-stake-sdk";
import { outLamports, minOutLamports, totalRentLamports } from "@unstake-it/sol-ag";
import { prepareSetupTx, prepareUnstakeTx, prepareCleanupTx } from "@unstake-it/sol-ag";
import { toast } from 'react-toastify';


const fetchUnstakeDetails = async (connection, stakeAccountId, onSuccessfulTransaction) => {
    const unstake = await UnstakeAg.load({
        cluster: "mainnet-beta",
        connection,
        // if you're using only legacy transactions (no lookup tables),
        // you should set ammsToExclude to legacyTxAmmsToExclude() to
        // avoid running into transaction size limits
        ammsToExclude: legacyTxAmmsToExclude(),
    });

    const stakeAccountPubkey = new PublicKey(stakeAccountId);
    const stakeAccount = await getStakeAccount(connection, stakeAccountPubkey);
    const routes = await unstake.computeRoutes({
        stakeAccount,
        amountLamports: BigInt(stakeAccount.lamports),
        slippageBps: 10,
        // you can optionally collect a fee on top
        // of any jup swaps, just as you can in jup sdk
        jupFeeBps: 3,
    });
    const bestRoute = routes[0];
    const {
        stakeAccInput: {
            stakePool,
            inAmount,
            outAmount,
        },
        // optional jup-ag `RouteInfo` for any additional swaps
        // via jup required to convert stake pool tokens into SOL
        jup,
    } = bestRoute;

    console.log(
        "Route will give me",
        outLamports(bestRoute),
        "lamports, and at least",
        minOutLamports(bestRoute),
        "lamports at max slippage.",
        "I need to spend an additional",
        totalRentLamports(bestRoute),
        "lamports to pay for rent",
    );
    console.log(bestRoute)
    // returned transactions do not have `recentBlockhash` or `feePayer` set
    // and are not signed
    // const exchangeReturn =
    //     await unstake.exchange({
    //         route: bestRoute,
    //         stakeAccount,
    //         stakeAccountPubkey,
    //         user: walletContext.publicKey,
    //         // You can optionally provide a mapping of StakePool output tokens / wrapped SOL
    //         // to your token account of the same type to collect stake pool referral fees / jup swap fees
    //         feeAccounts: {
    //             "So11111111111111111111111111111111111111112": MY_WRAPPED_SOL_ACCOUNT,
    //             "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm": MY_SCNSOL_ACCOUNT,
    //         },
    //     });

    // const {
    //     setupTransaction,
    //     unstakeTransaction: { tx, signers },
    //     cleanupTransaction,
    // } = exchangeReturn;

    // const { blockhash, lastValidBlockHeight } = await unstake.connection.getLatestBlockhash();
    // const feePayer = walletContext.publicKey;

    // const setupTx = prepareSetupTx(exchangeReturn, blockhash, feePayer);
    // if (setupTx) {
    //     setupTx.partialSign(walletContext);
    //     const signature = await unstake.connection.sendRawTransaction(
    //         setupTx.serialize(),
    //     );
    //     await unstake.connection.confirmTransaction(
    //         {
    //             signature,
    //             blockhash,
    //             lastValidBlockHeight,
    //         }
    //     );
    // }

    // const unstakeTx = prepareUnstakeTx(exchangeReturn, blockhash, feePayer);
    // unstakeTx.partialSign(walletContext);
    // const signature = await unstake.connection.sendRawTransaction(
    //     unstakeTx.serialize(),
    // );
    // await unstake.connection.confirmTransaction(
    //     {
    //         signature,
    //         blockhash,
    //         lastValidBlockHeight,
    //     }
    // );

    // const cleanupTx = prepareCleanupTx(exchangeReturn, blockhash, feePayer);
    // if (cleanupTx) {
    //     cleanupTx.partialSign(walletContext);
    //     const signature = await unstake.connection.sendRawTransaction(
    //         cleanupTx.serialize(),
    //     );
    //     await unstake.connection.confirmTransaction(
    //         {
    //             signature,
    //             blockhash,
    //             lastValidBlockHeight,
    //         }
    //     );
    // }


}
export default fetchUnstakeDetails;
// This loads the required accounts for all stake pools
// and jup-ag from on-chain.
// The arg type is `JupiterLoadParams` from jup-ag
