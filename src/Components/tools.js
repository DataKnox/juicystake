// ToolsPage.js
import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import './tools.css'; // Import your CSS file
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection } from '@solana/wallet-adapter-react';

const ToolsPage = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    return (
        <div>
            <WalletMultiButton />
        </div>
    )
}



export default ToolsPage;
