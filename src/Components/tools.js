import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, StakeProgram, VersionedTransaction } from '@solana/web3.js';
import './tools.css'; // Your CSS file for styling
import StakePopup from './stakePopup';
import handleStake from './handleStake';
import handleDeactivateStakeAccount from './handleUnstake';
import MergePopup from './mergepopup';
import mergeStakeAccounts from './handleMerge';
import TransferPopup from './sendPopup';
import authorizeNewStakeAuthority from './handleSend';
import SplitPopup from './splitPopup';
import handleSplitStakeAccount from './handleSplit';
import InstantUnstakePopup from './instantUnstakePopup';
import LiquidStakePopup from './liquidStakePopup';
import handleLiquidStake from './handleLiquidStake';
import handleLiquidStakeTransfer from './handleLiquidStakeTxfr';
import jslogo from '../Assets/jslogo.png';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import handleJucySolQuote from './handleJucySolQuote';
function ToolsPage() {
    const { publicKey, connected, signTransaction, sendTransaction } = useWallet();
    const [stakeAccounts, setStakeAccounts] = useState([]);
    const [isStakePopupVisible, setIsStakePopupVisible] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [isMergePopupVisible, setIsMergePopupVisible] = useState(false);
    const [selectedAccountIdForMerge, setSelectedAccountIdForMerge] = useState(null);
    const [isTransferPopupVisible, setIsTransferPopupVisible] = useState(false);
    const [selectedStakeAccountForTransfer, setSelectedStakeAccountForTransfer] = useState(null);
    const [isSplitPopupVisible, setIsSplitPopupVisible] = useState(false);
    const [selectedStakeAccountForSplit, setSelectedStakeAccountForSplit] = useState(null);
    const [isInstantUnstakePopupVisible, setIsInstantUnstakePopupVisible] = useState(false); // State for Instant Unstake Popup visibility
    const [selectedStakeAccountForInstantUnstake, setSelectedStakeAccountForInstantUnstake] = useState(null); // State for selected stake account
    // const [isLiquidStakeVisible, setIsLiquidStakeVisible] = useState(false); // State for Liquid Stake Popup visibility
    // const [selectedAccountforLiquidTransfer, setAccountForLiquidTransfer] = useState(null); // State for selected stake account
    const walletContext = useWallet();
    const connection = new Connection('https://juicystake.io:8899', 'confirmed');
    const connection1 = new Connection('https://juicystake.io:4040', 'confirmed');
    let navigate = useNavigate();
    function base64ToUint8Array(base64) {
        const raw = atob(base64);
        const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
        for (let i = 0; i < raw.length; i++) {
            uint8Array[i] = raw.charCodeAt(i);
        }
        return uint8Array;
    }

    const handleLiquidStakeTransferSubmission = async (stakeAccountId) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        await handleLiquidStakeTransfer(walletContext, stakeAccountId, connection, () => {
            setRefreshData(prev => !prev); // Toggle refreshData state to trigger re-fetch
        });
    };

    const handleSignAndSendTransaction = async (base64EncodedTransaction) => {

        if (!publicKey || !signTransaction || !sendTransaction) {
            console.error("Wallet is not connected");
            return;
        }

        try {
            const uint8Array = base64ToUint8Array(base64EncodedTransaction);
            const decodedTransaction = VersionedTransaction.deserialize(uint8Array);


            const signedTransaction = await signTransaction(decodedTransaction);
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
            const startTime = Date.now();
            let timeout = 60000;
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

                    setRefreshData(prev => !prev);
                    return
                }
                await new Promise(resolve => setTimeout(resolve, 2000)); // Poll every 2 seconds
            }
        } catch (error) {
            console.error("Error signing or sending transaction:", error);
        }
    };


    const handleInstantUnstakeSubmission = async (stakeAccountId, quote) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }
        console.log("quote in handler", quote);
        const bestRoute = quote; // If quote is already the best route, use it directly

        const postData = {
            route: {
                stakeAccInput: bestRoute.stakeAccInput,
                jup: bestRoute.jup
            },
            stakeAccountPubkey: stakeAccountId,
            user: walletContext.publicKey.toBase58(), // The user's public key as a string
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
            const serializedTxn = data.unstakeTransaction
            handleSignAndSendTransaction(serializedTxn);
            setIsInstantUnstakePopupVisible(false); // Assuming this closes the instant unstake popup
        } catch (error) {
            console.error('Error submitting unstake request:', error);
        }
    };

    const handleSplitSubmission = async (amountSOL) => {
        await handleSplitStakeAccount(
            connection,
            walletContext,
            selectedStakeAccountForSplit, // The public key of the stake account to split
            amountSOL, // Amount to move to the new stake account
            () => {
                setRefreshData(prev => !prev); // Assuming you want to refresh data after split
                setIsSplitPopupVisible(false); // Close the popup
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
                selectedStakeAccountForTransfer, // The public key of the stake account to transfer
                targetAddress,
                () => {
                    setRefreshData(prev => !prev); // Assuming you want to refresh data after transfer
                    setIsTransferPopupVisible(false);  // The target wallet address provided from the popup
                });
            console.log('Transferring stake account to', targetAddress);
        } catch (error) {
            console.error('Error transferring stake account:', error);
        }
    };


    const handleMergeSubmission = async (mergeWithAccountId) => {
        await mergeStakeAccounts(
            connection,
            walletContext, // Make sure you pass the correct wallet object
            selectedAccountIdForMerge,
            mergeWithAccountId,
            () => {
                setRefreshData(prev => !prev); // Trigger re-fetch
                setIsMergePopupVisible(false); // Close the popup
            }
        );
    };

    const handleUnstakeSubmission = async (stakeAccountId) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        await handleDeactivateStakeAccount(stakeAccountId, walletContext, connection, () => {
            setRefreshData(prev => !prev); // Toggle refreshData state to trigger re-fetch
        });
    };

    const handleLiquidStakeSubmission = async (amountSOL) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        console.log("Submitting liquid stake request for", amountSOL, "SOL");
        await handleLiquidStake(amountSOL, walletContext, connection, () => {
            setRefreshData(prev => !prev); // Toggle refreshData state to trigger re-fetch
        }
        );

    };

    const handleStakeSubmission = async (amountSOL) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        const stakeAuthority = publicKey;
        const withdrawAuthority = publicKey;

        await handleStake(connection, walletContext, amountSOL, stakeAuthority, withdrawAuthority, () => {
            setRefreshData(prev => !prev); // Toggle refreshData state to trigger re-fetch
        });
    };



    useEffect(() => {
        if (!publicKey) return;

        async function fetchValidatorFriendlyName(voteAccount) {
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
                // Check if the status is "Success" and ensure the friendlyName exists
                if (data.status === "Success" && data.result && data.result.data && data.result.data.friendlyName) {
                    return data.result.data.friendlyName; // This will be the validator's friendly name
                } else {
                    throw new Error('Validator friendly name not found in the response');
                }
            } catch (error) {
                console.error("Failed to fetch validator friendly name:", error);
                return null; // Or handle the error as appropriate for your app
            }
        }

        const fetchStakeAccounts = async () => {
            try {
                const connection = new Connection('https://juicystake.io:8899', 'confirmed');
                const accounts = await connection.getParsedProgramAccounts(
                    StakeProgram.programId, {
                    filters: [{ dataSize: 200 }, { memcmp: { offset: 12, bytes: publicKey.toBase58() } }],
                }
                );

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
                    const validatorName = await fetchValidatorFriendlyName(voter); // Await the promise to resolve
                    return {
                        balance: account.account.lamports / 1e9 + ' SOL',
                        validatorName: validatorName || 'Unknown', // Fallback to 'Unknown' if null is returned
                        id: account.pubkey.toString(), // Truncate the pubkey for display
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
    }, [publicKey, connected, refreshData]); // Re-run when publicKey or connected status changes

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

                {/* <button onClick={() => setIsLiquidStakeVisible(true)} className="stake-button">Liquid Stake 4 bSOL</button>
                {isLiquidStakeVisible && (
                    <LiquidStakePopup
                        onClose={() => setIsLiquidStakeVisible(false)}
                        onSubmit={handleLiquidStakeSubmission}
                    />
                )} */}
                <button onClick={() => setIsStakePopupVisible(true)} className="stake-button">
                    👉Click 2 Stake SOL with Juicy Stake👈
                </button>
                {isStakePopupVisible && (
                    <StakePopup
                        onClose={() => setIsStakePopupVisible(false)}
                        onSubmit={handleStakeSubmission}
                    />
                )}
                <a className="stake-button" href='https://app.sanctum.so/swap' target="_blank">👉If you want jucySOL click here👈</a>

            </div>
            <table>
                <thead>
                    <tr>
                        <th>Balance</th>
                        <th>Validator Name</th>
                        <th>Stake Account ID</th>
                        <th>Activation Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {stakeAccounts.map((account, index) => (
                        <tr key={index}>
                            <td>{account.balance}</td>
                            <td>{account.validatorName}</td>
                            <td>{`${account.id.substring(0, 4)}...${account.id.substring(account.id.length - 4)}`}</td>
                            <td>{account.activationStatus}</td>
                            <td>
                                {/* Placeholders for actions */}
                                <button onClick={() => {
                                    setSelectedStakeAccountForInstantUnstake(account);
                                    setIsInstantUnstakePopupVisible(true);
                                }}>Instant Unstake</button>
                                {isInstantUnstakePopupVisible && (
                                    <InstantUnstakePopup
                                        stakeAccount={selectedStakeAccountForInstantUnstake}
                                        onClose={() => setIsInstantUnstakePopupVisible(false)}
                                        onSubmit={(stakeAccountId, quote) => handleInstantUnstakeSubmission(stakeAccountId, quote)}
                                    />
                                )}
                                <button onClick={() => handleUnstakeSubmission(account.id)}>Deactivate</button>
                                <button onClick={() => {
                                    setSelectedAccountIdForMerge(account.id);
                                    setIsMergePopupVisible(true);
                                }}>Merge</button>
                                {isMergePopupVisible && (
                                    <MergePopup
                                        stakeAccounts={stakeAccounts}
                                        onClose={() => setIsMergePopupVisible(false)}
                                        onMergeSelected={handleMergeSubmission}
                                        selectedAccountId={selectedAccountIdForMerge}
                                        status={stakeAccounts.find(account => account.id === selectedAccountIdForMerge)?.activationStatus}
                                    />
                                )}
                                <button onClick={() => {
                                    setSelectedStakeAccountForSplit(account.id);
                                    setIsSplitPopupVisible(true);
                                }}>Split</button>
                                {isSplitPopupVisible && (
                                    <SplitPopup
                                        onClose={() => setIsSplitPopupVisible(false)}
                                        onSubmit={handleSplitSubmission}
                                        balance={stakeAccounts.find(account => account.id === selectedStakeAccountForSplit)?.balance.replace(' SOL', '')}
                                    />
                                )}
                                <button onClick={() => {
                                    setSelectedStakeAccountForTransfer(account.id);
                                    setIsTransferPopupVisible(true);
                                }}>Send</button>
                                {isTransferPopupVisible && (
                                    <TransferPopup
                                        onClose={() => setIsTransferPopupVisible(false)}
                                        onSubmit={handleTransferSubmission}
                                    />
                                )}
                                <button onClick={() => handleLiquidStakeTransferSubmission(account.id)}>Liquid Stake $bSOL</button>
                                <button onClick={() => {
                                    handleJucySolQuote(walletContext, account.id, connection, () => {
                                        setRefreshData(prev => !prev);
                                    })
                                }}>Liquid Stake jucySOL</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
}

export default ToolsPage;
