import React, { useState } from 'react';
import './mergePopup.css'; // Ensure you have imported the CSS for styling

function MergePopup({ stakeAccounts, onClose, onMergeSelected, selectedAccountId, status }) {
    const [selectedMergeAccountId, setSelectedMergeAccountId] = useState(null);
    const eligibleAccounts = stakeAccounts.filter(account =>
        account.id !== selectedAccountId && account.activationStatus === status);

    const handleSubmit = () => {
        if (selectedMergeAccountId) {
            onMergeSelected(selectedMergeAccountId);
        }
    };

    return (
        <div className="popup">
            <div className="popup_inner">
                <h1>Select an Account to Merge With:</h1>
                <ul>
                    {eligibleAccounts.map(account => (
                        <li key={account.id} onClick={() => setSelectedMergeAccountId(account.id)} className={selectedMergeAccountId === account.id ? 'selected' : ''}>
                            {account.id} - {account.balance} SOL
                        </li>
                    ))}
                </ul>
                <button onClick={handleSubmit} disabled={!selectedMergeAccountId}>Submit</button>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default MergePopup;
