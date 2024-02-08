import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, clusterApiUrl, StakeProgram } from '@solana/web3.js';
import './tools.css'; // Your CSS file for styling

function ToolsPage() {
    const { publicKey, connected } = useWallet();
    const [stakeAccounts, setStakeAccounts] = useState([]);

    useEffect(() => {
        if (!publicKey) return;

        const fetchStakeAccounts = async () => {
            try {
                const connection = new Connection('http://202.8.8.177:8899', 'confirmed');
                const accounts = await connection.getParsedProgramAccounts(
                    StakeProgram.programId, // This is the public key for the Stake Program
                    {
                        filters: [{ dataSize: 200 }, { memcmp: { offset: 12, bytes: publicKey.toBase58() } }],
                    }
                );

                const stakeAccountsInfo = accounts.map(account => {
                    const accountInfo = account.account.data.parsed.info;
                    return {
                        balance: account.account.lamports / 1e9 + ' SOL', // Converting lamports to SOL
                        validatorName: 'Validator Name Placeholder', // You might need another service or method to map validator pubkey to name
                        id: account.pubkey.toString(),
                        activationStatus: accountInfo.stake.delegation.activationEpoch,
                    };
                });

                setStakeAccounts(stakeAccountsInfo);
            } catch (error) {
                console.error('Error fetching stake accounts:', error);
            }
        };

        fetchStakeAccounts();
    }, [publicKey, connected]); // Re-run when publicKey or connected status changes

    if (!connected) {
        return (
            <div className="wallet-connect-container">
                <WalletMultiButton />
            </div>
        );
    }

    return (
        <div className="stake-accounts-container">
            <table>
                <thead>
                    <tr>
                        <th>Balance</th>
                        <th>Validator Name</th>
                        <th>Stake Account ID</th>
                        <th>Activation Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {stakeAccounts.map((account, index) => (
                        <tr key={index}>
                            <td>{account.balance}</td>
                            <td>{account.validatorName}</td>
                            <td>{account.id}</td>
                            <td>{account.activationStatus}</td>
                            <td>
                                {/* Placeholders for actions */}
                                <button>Instant Unstake</button>
                                <button>Deactivate</button>
                                <button>Merge</button>
                                <button>Split</button>
                                <button>Send</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ToolsPage;
