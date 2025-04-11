import React, { useState } from 'react';
import './sendPopup.css';

function TransferPopup({ onClose, onSubmit }) {
    const [targetAddress, setTargetAddress] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(targetAddress);
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2 className="popup-title">Transfer Stake Account</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form className="popup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="targetAddress">Target Wallet Address</label>
                        <input
                            type="text"
                            id="targetAddress"
                            value={targetAddress}
                            onChange={(e) => setTargetAddress(e.target.value)}
                            placeholder="Enter Solana wallet address"
                            required
                        />
                    </div>
                    <div className="popup-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Transfer</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TransferPopup; 