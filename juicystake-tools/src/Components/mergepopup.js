import React, { useState } from 'react';
import './mergePopup.css';

function MergePopup({ stakeAccounts, onClose, onMergeSelected, selectedAccountId, status }) {
    const [selectedMergeAccount, setSelectedMergeAccount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onMergeSelected(selectedMergeAccount);
    };

    // Filter out the currently selected account and inactive accounts
    const availableAccounts = stakeAccounts.filter(account =>
        account.id !== selectedAccountId &&
        account.activationStatus === 'Activated'
    );

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2 className="popup-title">Merge Stake Accounts</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form className="popup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Select Account to Merge With</label>
                        <select
                            value={selectedMergeAccount}
                            onChange={(e) => setSelectedMergeAccount(e.target.value)}
                            required
                        >
                            <option value="">Select an account</option>
                            {availableAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.validatorName} - {account.balance}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="popup-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Merge</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default MergePopup; 