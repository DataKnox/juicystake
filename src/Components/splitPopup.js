import React, { useState } from 'react';

function SplitPopup({ onClose, onSubmit, balance }) {
    const [amount, setAmount] = useState('');

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        const amountNumber = parseFloat(amount);
        if (!isNaN(amountNumber) && amountNumber > 0 && amountNumber <= parseFloat(balance)) {
            onSubmit(amountNumber);
        } else {
            alert("Invalid amount");
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Split Stake Account</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="amount">Amount (SOL)</label>
                    <input
                        type="text"
                        id="amount"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter the amount to split"
                        required
                    />
                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default SplitPopup;
