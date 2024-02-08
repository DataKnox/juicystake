import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
function ToolsPage() {
    const { publicKey } = useWallet();

    return (
        <div>
            <WalletMultiButton /> {/* Button to connect/disconnect wallet */}
            {publicKey && <div>Connected with address: {publicKey.toBase58()}</div>}
        </div>
    );
}

export default ToolsPage;