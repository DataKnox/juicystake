import React from 'react';
import './networks.css'; // Import your CSS file
import solanaIcon from '../Assets/solanaflat.png'; // Import Solana icon image
import suiIcon from '../Assets/suiblue.png'; // Import Sui icon image
import askIcon from '../Assets/ask.png'; // Import ASK icon image
import aptosIcon from '../Assets/aptos-apt-logo.svg'; // Import Aptos icon image
function NetworksComponent() {
    return (
        <div id="networks-section" className="networks-container with-background">
            <div className="network-row">
                <div className="network">
                    <img src={solanaIcon} alt="Solana" className="network-icon" />
                    <p className="network-text">Solana</p>
                    <a href="https://stakewiz.com/validator/juicQdAnksqZ5Yb8NQwCLjLWhykvXGktxnQCDvMe6Nx" target="_blank" rel="noreferrer">StakeWiz Scorecard</a><br />
                    <a href="https://metrics.stakeconomy.com/d/f2b2HcaGz/solana-community-validator-dashboard?orgId=1&refresh=1m&var-pubkey=juigBT2qetpYpf1iwgjaiWTjryKkY3uUTVAnRFKkqY6&var-server=juicystake&var-inter=1m&var-netif=All&chunkNotFound" target="_blank" rel="noreferrer">Node Health</a>
                </div>
                <div className="network">
                    <img src={suiIcon} alt="Sui" className="network-icon" />
                    <p className="network-text">Sui</p>
                    <a href="https://suiscan.xyz/mainnet/validator/0xb7847468db546ba85acb9dcdc0c5190b3ca6427d713ff52a4f8183c81f8a39e1/info" target="_blank" rel="noreferrer">SuiScan</a><br />
                    <a href="https://metrics.sui.io/public-dashboards/4ceb11cc210d4025b122294586961169?orgId=1&refresh=1m&from=now-5m&to=now" target="_blank" rel="noreferrer">Node Health</a>
                </div>
            </div>
            <div className="network-row">
                <div className="network">
                    <img src={aptosIcon} alt="Aptos" className="network-icon" />
                    <p className="network-text">Aptos</p>
                    <a href="https://testnet.tracemove.io/account/0xba08cec00a8cfa1deff6c9212dda8d198c8fa6ee1992f3ada76d645f99e3402b" target="_blank" rel="noreferrer">Explorer</a>
                </div>
                <div className="network">
                    <img src={askIcon} alt="Soon" className="network-icon" />
                    <p className="network-text">More Soon</p>
                </div>
            </div>
        </div>
    );
}

export default NetworksComponent;
