import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomeComponent from './Components/home';
import ToolsPage from './Components/tools';
import './App.css';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden by your app's styles
require('@solana/wallet-adapter-react-ui/styles.css');

function App() {
  const network = WalletAdapterNetwork.Devnet; // Change to 'Mainnet' in production
  const wallets = [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
  ];

  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Routes>
            <Route path="/" element={<HomeComponent />} />
            <Route path="/tools" element={<ToolsPage />} />
          </Routes>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
