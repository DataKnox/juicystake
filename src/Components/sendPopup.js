// TransferPopup.js
import React, { useState } from 'react';
import './sendPopup.css';
function TransferPopup({ onClose, onSubmit }) {
    const [targetAddress, setTargetAddress] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(targetAddress);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <form onSubmit={handleSubmit}>
                    <label>
                        Enter the target wallet address:
                        <input
                            type="text"
                            value={targetAddress}
                            onChange={(e) => setTargetAddress(e.target.value)}
                            required
                        />
                    </label>
                    <button type="submit" className="submit-btn">Submit</button>
                </form>
            </div>
        </div>
    );
}

export default TransferPopup;
