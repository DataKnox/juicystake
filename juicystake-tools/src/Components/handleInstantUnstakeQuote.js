async function handleInstantUnstakeQuote(stakeAccountId) {
    try {
        const response = await fetch('https://api.unstake.it/v1/quote', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                stakeAccountPubkey: stakeAccountId,
                slippage: 1, // 1% slippage
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch quote: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            amountOut: data.amountOut,
            fee: data.fee,
            stakeAccInput: data.stakeAccInput,
            jup: data.jup,
        };
    } catch (error) {
        console.error('Error fetching instant unstake quote:', error);
        throw error;
    }
}

export default handleInstantUnstakeQuote; 