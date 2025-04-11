import React from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import ToolsPage from './Components/tools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import './styles/brand.css';

function App() {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = process.env.REACT_APP_SOLANA_RPC_ENDPOINT || clusterApiUrl(network);

    // Initialize wallets with proper configuration
    const wallets = React.useMemo(
        () => [
            new PhantomWalletAdapter({
                network,
                endpoint: window.location.origin
            })
        ],
        [network]
    );

    // Ensure wallet context is available
    const WalletWrapper = ({ children }) => {
        return (
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        {children}
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        );
    };

    return (
        <WalletWrapper>
            <div className="App">
                <ToolsPage />
                <ToastContainer position="top-right" />
            </div>
        </WalletWrapper>
    );
}

export default App; 