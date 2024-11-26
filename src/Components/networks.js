import React from 'react';
import './networks.css'; // Import your CSS file
import solanaIcon from '../Assets/solanaflat.png'; // Import Solana icon image
import suiIcon from '../Assets/suiblue.png'; // Import Sui icon image
import cubeIcon from '../Assets/cube.jpeg'; // Import ASK icon image
import aptosIcon from '../Assets/aptos-apt-logo.svg'; // Import Aptos icon image
import ethIcon from '../Assets/ethereum.svg'; // Import Ethereum icon image
import archIcon from '../Assets/Arch Logo Black.svg'; // Import Arch icon image
import walrusIcon from '../Assets/Logo_Walrus.svg'; // Import Walrus icon image
import questionMark from '../Assets/Icon-round-Question_mark.svg'; // Import question mark icon image
import stacksIcon from '../Assets/stacks.png'; // Import Stacks icon image
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
                    <a href="https://metrics.sui.io/public-dashboards/4ceb11cc210d4025b122294586961169?orgId=1&refresh=1m&from=now-5m&to=now" target="_blank" rel="noreferrer">Node Health</a><br />
                    <a href="https://aftermath.finance/stake?validator=juicy-stake" target="_blank" rel="noreferrer">afSUI LST</a>
                </div>
            </div>
            <div className="network-row">
                <div className="network">
                    <img src={aptosIcon} alt="Aptos" className="network-icon" />
                    <p className="network-text">Aptos</p>
                    <a href="https://explorer.aptoslabs.com/validator/0x66fcc9a1275170c140988e8fdc5104fef09568bdd07930f44a290bf55a5550ee?network=mainnet" target="_blank" rel="noreferrer">Stake via Explorer</a>
                </div>
                <div className="network">
                    <img src={cubeIcon} alt="Cube" className="network-icon" />
                    <p className="network-text">Cube Exchange</p>
                    <a href="https://www.cube.exchange/" target="_blank" rel="noreferrer">Cube Exchange</a><br />
                </div>
            </div>
            <div className="network-row">
                <div className="network">
                    <img src={ethIcon} alt="Ethereum" className="network-icon" />
                    <p className="network-text">Ethereum</p>
                    <a href="https://beaconcha.in/validator/0xa20656584fa1fe728a20a859955909bd96afe1e868be8d8ba32a310659b7a1b30e8055a584118a8af6a0131025a6818c#deposits" target="_blank" rel="noreferrer">Beaconchain</a>
                </div>
                <div className="network">
                    <img src={archIcon} alt="ArchNetwork" className="network-icon" />
                    <p className="network-text">Arch - Soon</p>
                    <a href="https://www.arch.network/" target="_blank" rel="noreferrer">Arch Site</a><br />
                </div>
            </div>
            <div className="network-row">
                <div className="network">
                    <img src={walrusIcon} alt="Walrus" className="network-icon" />
                    <p className="network-text">Walrus Testnet</p>
                    <a href="https://walruscan.com/testnet/operator/0x70bc82baec578437bf2f61ce024c2b6da46038ddbcb95dbfc72a2151103a8097" target="_blank" rel="noreferrer">WalrusScan</a>
                </div>
                <div className="network">
                    <img src={stacksIcon} alt="Stacks" className="network-icon" />
                    <p className="network-text">Stacks Network</p>
                    <a href="https://explorer.hiro.so/address/SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.stacking-pool-signer-juicy-stake-v1?chain=mainnet" target="_blank" rel="noreferrer">Stacks Explorer</a>
                </div>
            </div>
        </div>
    );
}

export default NetworksComponent;
