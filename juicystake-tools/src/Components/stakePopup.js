import React, { useState } from 'react';
import './stakePopup.css';

function StakePopup({ onClose, onSubmit }) {
    const [amount, setAmount] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(parseFloat(amount));
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2 className="popup-title">Stake SOL</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form className="popup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="amount">Amount (SOL)</label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.1"
                            min="0.1"
                            required
                        />
                    </div>
                    <div className="popup-actions">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Stake</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StakePopup; 