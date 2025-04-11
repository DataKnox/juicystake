import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, StakeProgram, VersionedTransaction } from '@solana/web3.js';
import './tools.css';
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
    const [isInstantUnstakePopupVisible, setIsInstantUnstakePopupVisible] = useState(false);
    const [selectedStakeAccountForInstantUnstake, setSelectedStakeAccountForInstantUnstake] = useState(null);
    const connection = new Connection(process.env.REACT_APP_SOLANA_RPC_ENDPOINT || 'https://cherise-ldxzh0-fast-mainnet.helius-rpc.com', 'confirmed');

    function base64ToUint8Array(base64) {
        const raw = atob(base64);
        const uint8Array = new Uint8Array(new ArrayBuffer(raw.length));
        for (let i = 0; i < raw.length; i++) {
            uint8Array[i] = raw.charCodeAt(i);
        }
        return uint8Array;
    }

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
                    return;
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.error("Error signing or sending transaction:", error);
        }
    };

    const handleInstantUnstakeSubmission = async (stakeAccountId, quote) => {
        if (!publicKey || !connected) {
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
            user: publicKey.toBase58(),
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
            handleSignAndSendTransaction(serializedTxn);
            setIsInstantUnstakePopupVisible(false);
        } catch (error) {
            console.error('Error submitting unstake request:', error);
        }
    };

    const handleSplitSubmission = async (amountSOL) => {
        await handleSplitStakeAccount(
            connection,
            { publicKey, connected, signTransaction, sendTransaction },
            selectedStakeAccountForSplit,
            amountSOL,
            () => {
                setRefreshData(prev => !prev);
                setIsSplitPopupVisible(false);
            }
        );
    };

    const handleTransferSubmission = async (targetAddress) => {
        if (!publicKey || !connected) {
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
                { publicKey, connected, signTransaction, sendTransaction },
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
            { publicKey, connected, signTransaction, sendTransaction },
            selectedAccountIdForMerge,
            mergeWithAccountId,
            () => {
                setRefreshData(prev => !prev);
                setIsMergePopupVisible(false);
            }
        );
    };

    const handleUnstakeSubmission = async (stakeAccountId) => {
        if (!publicKey || !connected) {
            console.log("Wallet is not connected");
            return;
        }

        await handleDeactivateStakeAccount(stakeAccountId, { publicKey, connected, signTransaction, sendTransaction }, connection, () => {
            setRefreshData(prev => !prev);
        });
    };

    const handleStakeSubmission = async (amountSOL) => {
        if (!publicKey || !connected) {
            console.log("Wallet is not connected");
            return;
        }

        const stakeAuthority = publicKey;
        const withdrawAuthority = publicKey;

        await handleStake(connection, { publicKey, connected, signTransaction, sendTransaction }, amountSOL, stakeAuthority, withdrawAuthority, () => {
            setRefreshData(prev => !prev);
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
                if (data.status === "Success" && data.result && data.result.data && data.result.data.friendlyName) {
                    return data.result.data.friendlyName;
                } else {
                    throw new Error('Validator friendly name not found in the response');
                }
            } catch (error) {
                console.error("Failed to fetch validator friendly name:", error);
                return null;
            }
        }

        const fetchStakeAccounts = async () => {
            try {
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
                <button onClick={() => setIsStakePopupVisible(true)} className="stake-button">
                    👉Click 2 Stake SOL with ProStaking👈
                </button>
                {isStakePopupVisible && (
                    <StakePopup
                        onClose={() => setIsStakePopupVisible(false)}
                        onSubmit={handleStakeSubmission}
                    />
                )}
                <a className="stake-button" href='https://app.sanctum.so/trade' target="_blank" rel="noopener noreferrer">👉If you want jucySOL click here👈</a>
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
                                <button onClick={() => {
                                    handleJucySolQuote({ publicKey, connected, signTransaction, sendTransaction }, account.id, connection, () => {
                                        setRefreshData(prev => !prev);
                                    })
                                }}>Liquid Stake jucySOL</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ToolsPage; 