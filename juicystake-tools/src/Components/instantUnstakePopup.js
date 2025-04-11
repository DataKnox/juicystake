import React, { useState, useEffect } from 'react';
import './instantUnstakePopup.css';
import handleInstantUnstakeQuote from './handleInstantUnstakeQuote';

function InstantUnstakePopup({ stakeAccount, onClose, onSubmit }) {
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchQuote() {
            try {
                const response = await handleInstantUnstakeQuote(stakeAccount.id);
                setQuote(response);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch quote');
                setLoading(false);
            }
        }

        if (stakeAccount) {
            fetchQuote();
        }
    }, [stakeAccount]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(stakeAccount.id, quote);
    };

    if (loading) {
        return (
            <div className="popup-overlay">
                <div className="popup-content">
                    <div className="loading">Loading quote...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="popup-overlay">
                <div className="popup-content">
                    <div className="error">{error}</div>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <div className="popup-header">
                    <h2 className="popup-title">Instant Unstake</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <div className="quote-details">
                    <p>Stake Account: {stakeAccount.id.substring(0, 4)}...{stakeAccount.id.substring(stakeAccount.id.length - 4)}</p>
                    <p>Balance: {stakeAccount.balance}</p>
                    {quote && (
                        <>
                            <p>You will receive: {quote.amountOut} SOL</p>
                            <p>Fee: {quote.fee} SOL</p>
                        </>
                    )}
                </div>
                <div className="popup-actions">
                    <button type="button" onClick={onClose}>Cancel</button>
                    <button onClick={handleSubmit}>Confirm Unstake</button>
                </div>
            </div>
        </div>
    );
}

export default InstantUnstakePopup; 