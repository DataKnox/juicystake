import './stakePopup.css';
import { useState } from 'react';
function StakePopup({ onClose, onSubmit }) {
    const [amount, setAmount] = useState('');

    const handleSubmit = () => {
        onSubmit(amount); // Call the callback function passed as a prop
        onClose(); // Close the popup
    };

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <h2>Stake with Juicy Stake</h2>
                <input
                    type="number"
                    placeholder="Amount in SOL"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                />
                <div className="popup-actions">
                    <button onClick={handleSubmit}>Submit</button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default StakePopup;