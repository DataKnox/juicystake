import React, { useState, useEffect } from 'react';
import './instantUnstakePopup.css';
function InstantUnstakePopup({ stakeAccount, onClose, onSubmit }) {
    const [quote, setQuote] = useState(null);

    useEffect(() => {
        async function fetchQuote() {
            console.log('balance', stakeAccount.balance);
            console.log(stakeAccount.balance.replace(' SOL', '') * 1e9)
            // Convert the stake account information and other parameters into a query string
            const queryParams = new URLSearchParams({
                stake: stakeAccount.id, // Assuming stakeAccount.id is the base58-encoded public key
                lamports: stakeAccount.balance.replace(' SOL', '') * 1e9, // Convert SOL to lamports
                slippageBps: 10,
            });

            const url = `https://api.unstake.it/v1/quote?${queryParams.toString()}`;
            console.log('Fetching quote from', url);
            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch quote');
                }

                const data = await response.json();
                console.log('Quote', data);
                setQuote(data[0]); // Adjusted based on the updated response structure
            } catch (error) {
                console.error(error);
                // Handle the error appropriately in your UI
            }
        }

        if (stakeAccount) {
            fetchQuote();
        }
    }, [stakeAccount]);

    if (!quote) {
        return <div>Loading quote...</div>;
    }

    // Calculate the unstake amount + rent returned and fee
    // Assuming quote now includes the entire object and stakeAccInput is a property of this object
    const unstakeAmountPlusRent = (parseInt(quote.stakeAccInput.outAmount) + parseInt(quote.stakeAccInput.additionalRentLamports)) / 1e9;
    const feeAmount = (parseInt(quote.jup.marketInfos[0].lpFee.amount) + parseInt(quote.jup.marketInfos[0].platformFee.amount)) / 1e9;

    return (
        <div className="instant-unstake-popup">
            <div className="popup-content">
                <button onClick={onClose}>Close</button>
                <h2>Instant Unstake Quote</h2>
                <table>
                    <tbody>
                        <tr>
                            <td>Unstake Amount + Rent Returned</td>
                            <td>{unstakeAmountPlusRent.toFixed(9)} SOL</td>
                        </tr>
                        <tr>
                            <td>Fee Amount</td>
                            <td>{feeAmount.toFixed(9)} SOL</td>
                        </tr>
                    </tbody>
                </table>
                <button onClick={() => onSubmit(stakeAccount.id, quote)}>Submit Unstake</button>
            </div>
        </div>
    );
}

export default InstantUnstakePopup;
