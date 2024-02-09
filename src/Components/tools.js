import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, clusterApiUrl, StakeProgram } from '@solana/web3.js';
import './tools.css'; // Your CSS file for styling
import StakePopup from './stakePopup';
import handleStake from './handleStake';
import handleDeactivateStakeAccount from './handleUnstake';
import MergePopup from './mergepopup';
import mergeStakeAccounts from './handleMerge';
function ToolsPage() {
    const { publicKey, connected, sendTransaction } = useWallet();
    const [stakeAccounts, setStakeAccounts] = useState([]);
    const [isStakePopupVisible, setIsStakePopupVisible] = useState(false);
    const [refreshData, setRefreshData] = useState(false);
    const [isMergePopupVisible, setIsMergePopupVisible] = useState(false);
    const [selectedAccountIdForMerge, setSelectedAccountIdForMerge] = useState(null);

    const walletContext = useWallet();
    const connection = new Connection('http://202.8.8.177:8899', 'confirmed');

    const handleMergeSubmission = async (mergeWithAccountId) => {
        // Your existing logic here to call mergeStakeAccounts
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

    const handleStakeSubmission = async (amountSOL) => {
        if (!publicKey || !walletContext.connected) {
            console.log("Wallet is not connected");
            return;
        }

        // Assuming the payer, stakeAuthority, and withdrawAuthority are all the user's wallet
        const stakeAuthority = publicKey;
        const withdrawAuthority = publicKey;

        // Convert amountSOL to lamports within handleStake if needed or here
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
                const connection = new Connection('http://202.8.8.177:8899', 'confirmed');
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

                // Wait for all promises to resolve
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
            <button onClick={() => setIsStakePopupVisible(true)}>Stake with Juicy Stake</button>
            {isStakePopupVisible && (
                <StakePopup
                    onClose={() => setIsStakePopupVisible(false)}
                    onSubmit={handleStakeSubmission}
                />
            )}
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
                            <td>{account.id}</td>
                            <td>{account.activationStatus}</td>
                            <td>
                                {/* Placeholders for actions */}
                                <button>Instant Unstake</button>
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
                                <button>Split</button>
                                <button>Send</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    );
}

export default ToolsPage;
