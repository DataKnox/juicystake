import React, { useState } from 'react';
import './splitPopup.css';

function SplitPopup({ onClose, onSubmit, balance }) {
    const [amount, setAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(parseFloat(amount));
    };

    const maxAmount = parseFloat(balance);

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2 className="popup-title">Split Stake Account</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form className="popup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="amount">Amount to Split (SOL)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.1"
                            min="0.1"
                            max={maxAmount}
                            required
                        />
                        <small>Maximum: {maxAmount} SOL</small>
                    </div>
                    <div className="popup-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Split</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SplitPopup; 