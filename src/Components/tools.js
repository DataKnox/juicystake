import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, StakeProgram } from '@solana/web3.js';
import './tools.css'; // Your CSS file for styling
import StakePopup from './stakePopup';
import MergePopup from './mergepopup';
import TransferPopup from './sendPopup';
import SplitPopup from './splitPopup';
import InstantUnstakePopup from './instantUnstakePopup';
import LiquidStakePopup from './liquidStakePopup';
import jslogo from '../Assets/jslogo.png';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// Import all handlers from a new utility file
import {
    handleStake,
    handleDeactivateStakeAccount,
    mergeStakeAccounts,
    authorizeNewStakeAuthority,
    handleSplitStakeAccount,
    handleLiquidStake,
    handleLiquidStakeTransfer,
    handleJucySolQuote,
    handleSignAndSendTransaction,
    base64ToUint8Array
} from '../utils/stakeHandlers';
import StakeAccountTable from './StakeAccountTable';

function ToolsPage() {
    const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
    const walletContext = useWallet();
    const connection = new Connection('https://cherise-ldxzh0-fast-mainnet.helius-rpc.com', 'confirmed');
    const navigate = useNavigate();

    // State management
    const [stakeAccounts, setStakeAccounts] = useState([]);
    const [refreshData, setRefreshData] = useState(false);

    // Popup visibility states
    const [isStakePopupVisible, setIsStakePopupVisible] = useState(false);
    const [isMergePopupVisible, setIsMergePopupVisible] = useState(false);
    const [isTransferPopupVisible, setIsTransferPopupVisible] = useState(false);
    const [isSplitPopupVisible, setIsSplitPopupVisible] = useState(false);
    const [isInstantUnstakePopupVisible, setIsInstantUnstakePopupVisible] = useState(false);

    // Selected account states
    const [selectedAccountIdForMerge, setSelectedAccountIdForMerge] = useState(null);
    const [selectedStakeAccountForTransfer, setSelectedStakeAccountForTransfer] = useState(null);
    const [selectedStakeAccountForSplit, setSelectedStakeAccountForSplit] = useState(null);
    const [selectedStakeAccountForInstantUnstake, setSelectedStakeAccountForInstantUnstake] = useState(null);

    // Handler functions
    const handleLiquidStakeTransferSubmission = async (stakeAccountId) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        await handleLiquidStakeTransfer(walletContext, stakeAccountId, connection, () => {
            setRefreshData(prev => !prev);
        });
    };

    const handleInstantUnstakeSubmission = async (stakeAccountId, quote) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        console.log("quote in handler", quote);
        const bestRoute = quote;

        const postData = {
            route: {
                stakeAccInput: bestRoute.stakeAccInput,
                jup: bestRoute.jup
            },
            stakeAccountPubkey: stakeAccountId,
            user: walletContext.publicKey.toBase58(),
            feeAccounts: {
                "So11111111111111111111111111111111111111112": "3MZHKUipHod8Gz9wt5pCB378SateAS84nTKr8yU3xFre"
            },
            asLegacyTransaction: false
        };

        console.log('Submitting unstake request:', postData);
        try {
            const response = await fetch('https://api.unstake.it/v1/unstake', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error(`Failed to submit unstake request: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Unstake submission response:', data);
            const serializedTxn = data.unstakeTransaction;
            await handleSignAndSendTransaction(
                serializedTxn,
                connection,
                signTransaction,
                sendTransaction,
                publicKey,
                () => setRefreshData(prev => !prev)
            );
            setIsInstantUnstakePopupVisible(false);
        } catch (error) {
            console.error('Error submitting unstake request:', error);
        }
    };

    const handleSplitSubmission = async (amountSOL) => {
        await handleSplitStakeAccount(
            connection,
            walletContext,
            selectedStakeAccountForSplit,
            amountSOL,
            () => {
                setRefreshData(prev => !prev);
                setIsSplitPopupVisible(false);
            }
        );
    };

    const handleTransferSubmission = async (targetAddress) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        if (!selectedStakeAccountForTransfer) {
            console.log("No stake account selected for transfer");
            return;
        }

        try {
            await authorizeNewStakeAuthority(
                connection,
                walletContext,
                selectedStakeAccountForTransfer,
                targetAddress,
                () => {
                    setRefreshData(prev => !prev);
                    setIsTransferPopupVisible(false);
                });
            console.log('Transferring stake account to', targetAddress);
        } catch (error) {
            console.error('Error transferring stake account:', error);
        }
    };

    const handleMergeSubmission = async (mergeWithAccountId) => {
        await mergeStakeAccounts(
            connection,
            walletContext,
            selectedAccountIdForMerge,
            mergeWithAccountId,
            () => {
                setRefreshData(prev => !prev);
                setIsMergePopupVisible(false);
            }
        );
    };

    const handleUnstakeSubmission = async (stakeAccountId, quote) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        // If quote is provided, it's an instant unstake
        if (quote) {
            const bestRoute = quote;
            const postData = {
                route: {
                    stakeAccInput: bestRoute.stakeAccInput,
                    jup: bestRoute.jup
                },
                stakeAccountPubkey: stakeAccountId,
                user: walletContext.publicKey.toBase58(),
                feeAccounts: {
                    "So11111111111111111111111111111111111111112": "3MZHKUipHod8Gz9wt5pCB378SateAS84nTKr8yU3xFre"
                },
                asLegacyTransaction: false
            };

            console.log('Submitting unstake request:', postData);
            try {
                const response = await fetch('https://api.unstake.it/v1/unstake', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postData),
                });

                if (!response.ok) {
                    throw new Error(`Failed to submit unstake request: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('Unstake submission response:', data);
                const serializedTxn = data.unstakeTransaction;
                await handleSignAndSendTransaction(
                    serializedTxn,
                    connection,
                    signTransaction,
                    sendTransaction,
                    publicKey,
                    () => setRefreshData(prev => !prev)
                );
            } catch (error) {
                console.error('Error submitting unstake request:', error);
            }
        } else {
            // Regular deactivation
            await handleDeactivateStakeAccount(stakeAccountId, walletContext, connection, () => {
                setRefreshData(prev => !prev);
            });
        }
    };

    const handleLiquidStakeSubmission = async (amountSOL) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        console.log("Submitting liquid stake request for", amountSOL, "SOL");
        await handleLiquidStake(amountSOL, walletContext, connection, () => {
            setRefreshData(prev => !prev);
        });
    };

    const handleStakeSubmission = async (amountSOL) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        const stakeAuthority = publicKey;
        const withdrawAuthority = publicKey;

        await handleStake(connection, walletContext, amountSOL, stakeAuthority, withdrawAuthority, () => {
            setRefreshData(prev => !prev);
        });
    };

    const handleJucySolQuoteSubmission = async (stakeAccountId) => {
        await handleJucySolQuote(walletContext, stakeAccountId, connection, () => {
            setRefreshData(prev => !prev);
        });
    };

    // Fetch validator friendly name
    const fetchValidatorFriendlyName = async (voteAccount) => {
        const url = `https://api.solana.fm/v0/accounts/${voteAccount}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.status === "Success" && data.result && data.result.data && data.result.data.friendlyName) {
                return data.result.data.friendlyName;
            } else {
                throw new Error('Validator friendly name not found in the response');
            }
        } catch (error) {
            console.error("Failed to fetch validator friendly name:", error);
            return null;
        }
    };

    // Fetch stake accounts
    useEffect(() => {
        if (!publicKey) return;

        const fetchStakeAccounts = async () => {
            try {
                const accounts = await connection.getParsedProgramAccounts(
                    StakeProgram.programId, {
                    filters: [{ dataSize: 200 }, { memcmp: { offset: 12, bytes: publicKey.toBase58() } }],
                });

                const currentEpochInfo = await connection.getEpochInfo();

                const stakeAccountsPromises = accounts.map(async (account) => {
                    const { activationEpoch, deactivationEpoch } = account.account.data.parsed.info.stake.delegation;
                    console.log('activationEpoch', activationEpoch);
                    console.log('deactivationEpoch', deactivationEpoch);
                    let status = "Deactivated";

                    if (activationEpoch < currentEpochInfo.epoch && (deactivationEpoch === 'undefined' || deactivationEpoch > currentEpochInfo.epoch)) {
                        status = "Activated";
                    } else if (activationEpoch >= currentEpochInfo.epoch && (deactivationEpoch === 'undefined' || deactivationEpoch > currentEpochInfo.epoch)) {
                        status = "Activating";
                    }

                    const voter = account.account.data.parsed.info.stake.delegation.voter;
                    const validatorName = await fetchValidatorFriendlyName(voter);
                    return {
                        balance: account.account.lamports / 1e9 + ' SOL',
                        validatorName: validatorName || 'Unknown',
                        id: account.pubkey.toString(),
                        activationStatus: status,
                    };
                });

                const resolvedStakeAccounts = await Promise.all(stakeAccountsPromises);
                setStakeAccounts(resolvedStakeAccounts);
            } catch (error) {
                console.error('Error fetching stake accounts:', error);
            }
        };

        fetchStakeAccounts();
    }, [publicKey, connected, refreshData]);

    if (!connected) {
        return (
            <div className="wallet-connect-container">
                <WalletMultiButton />
            </div>
        );
    }

    return (
        <div className="stake-accounts-container">
            <p className="jucy">‼️This page is for managing native stake accounts‼️</p>
            <div className="wallet-actions">
                <WalletMultiButton />
            </div>
            <div className="header">
                <img src={jslogo} alt="Logo" className="logo-img" onClick={() => navigate('/')} />

                <button onClick={() => setIsStakePopupVisible(true)} className="stake-button">
                    👉Click 2 Stake SOL with Juicy Stake👈
                </button>
                {isStakePopupVisible && (
                    <StakePopup
                        onClose={() => setIsStakePopupVisible(false)}
                        onSubmit={handleStakeSubmission}
                    />
                )}
                <a className="stake-button" href='https://app.sanctum.so/trade' target="_blank" rel="noopener noreferrer">
                    👉If you want jucySOL click here👈
                </a>
            </div>

            <StakeAccountTable
                stakeAccounts={stakeAccounts}
                onUnstake={handleUnstakeSubmission}
                onMerge={handleMergeSubmission}
                onSplit={handleSplitSubmission}
                onTransfer={handleTransferSubmission}
                onLiquidStake={handleLiquidStakeTransferSubmission}
                onJucySolQuote={handleJucySolQuoteSubmission}
            />
        </div>
    );
}

export default ToolsPage;
