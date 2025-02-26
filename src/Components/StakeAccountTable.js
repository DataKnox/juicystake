import React, { useState } from 'react';
import StakePopup from './stakePopup';
import MergePopup from './mergepopup';
import TransferPopup from './sendPopup';
import SplitPopup from './splitPopup';
import InstantUnstakePopup from './instantUnstakePopup';

/**
 * Component for displaying stake accounts in a table with action buttons
 */
function StakeAccountTable({
    stakeAccounts,
    onUnstake,
    onMerge,
    onSplit,
    onTransfer,
    onLiquidStake,
    onJucySolQuote
}) {
    // Popup visibility states
    const [isMergePopupVisible, setIsMergePopupVisible] = useState(false);
    const [isTransferPopupVisible, setIsTransferPopupVisible] = useState(false);
    const [isSplitPopupVisible, setIsSplitPopupVisible] = useState(false);
    const [isInstantUnstakePopupVisible, setIsInstantUnstakePopupVisible] = useState(false);

    // Selected account states
    const [selectedAccountIdForMerge, setSelectedAccountIdForMerge] = useState(null);
    const [selectedStakeAccountForTransfer, setSelectedStakeAccountForTransfer] = useState(null);
    const [selectedStakeAccountForSplit, setSelectedStakeAccountForSplit] = useState(null);
    const [selectedStakeAccountForInstantUnstake, setSelectedStakeAccountForInstantUnstake] = useState(null);

    return (
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
                            {isInstantUnstakePopupVisible && selectedStakeAccountForInstantUnstake && selectedStakeAccountForInstantUnstake.id === account.id && (
                                <InstantUnstakePopup
                                    stakeAccount={selectedStakeAccountForInstantUnstake}
                                    onClose={() => setIsInstantUnstakePopupVisible(false)}
                                    onSubmit={(stakeAccountId, quote) => {
                                        onUnstake(stakeAccountId, quote);
                                        setIsInstantUnstakePopupVisible(false);
                                    }}
                                />
                            )}
                            <button onClick={() => onUnstake(account.id)}>Deactivate</button>
                            <button onClick={() => {
                                setSelectedAccountIdForMerge(account.id);
                                setIsMergePopupVisible(true);
                            }}>Merge</button>
                            {isMergePopupVisible && selectedAccountIdForMerge === account.id && (
                                <MergePopup
                                    stakeAccounts={stakeAccounts}
                                    onClose={() => setIsMergePopupVisible(false)}
                                    onMergeSelected={(mergeWithAccountId) => {
                                        onMerge(selectedAccountIdForMerge, mergeWithAccountId);
                                        setIsMergePopupVisible(false);
                                    }}
                                    selectedAccountId={selectedAccountIdForMerge}
                                    status={stakeAccounts.find(acc => acc.id === selectedAccountIdForMerge)?.activationStatus}
                                />
                            )}
                            <button onClick={() => {
                                setSelectedStakeAccountForSplit(account.id);
                                setIsSplitPopupVisible(true);
                            }}>Split</button>
                            {isSplitPopupVisible && selectedStakeAccountForSplit === account.id && (
                                <SplitPopup
                                    onClose={() => setIsSplitPopupVisible(false)}
                                    onSubmit={(amountSOL) => {
                                        onSplit(selectedStakeAccountForSplit, amountSOL);
                                        setIsSplitPopupVisible(false);
                                    }}
                                    balance={stakeAccounts.find(acc => acc.id === selectedStakeAccountForSplit)?.balance.replace(' SOL', '')}
                                />
                            )}
                            <button onClick={() => {
                                setSelectedStakeAccountForTransfer(account.id);
                                setIsTransferPopupVisible(true);
                            }}>Send</button>
                            {isTransferPopupVisible && selectedStakeAccountForTransfer === account.id && (
                                <TransferPopup
                                    onClose={() => setIsTransferPopupVisible(false)}
                                    onSubmit={(targetAddress) => {
                                        onTransfer(selectedStakeAccountForTransfer, targetAddress);
                                        setIsTransferPopupVisible(false);
                                    }}
                                />
                            )}
                            <button onClick={() => onLiquidStake(account.id)}>Liquid Stake $bSOL</button>
                            <button onClick={() => onJucySolQuote(account.id)}>Liquid Stake jucySOL</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default StakeAccountTable; 