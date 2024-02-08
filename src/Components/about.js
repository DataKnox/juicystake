import React from 'react';
import './about.css'; // Import your CSS file
import guacImage from '../Assets/guac.jpg'; // Import guac image

function AboutComponent() {
    return (
        <div className="about-container with-background">
            <div className="left-side">
                <img src={guacImage} alt="Guac Image" className="guac-image" />
            </div>
            <div className="right-side">
                <h2>Your friendly neighborhood VALIDATOR</h2>
                <p>
                    Juicy Stake was founded by Knox Trades, a Systems, Networking, and Cloud Architect but even moreso, a blockchain maxi.
                    ‍
                    The goal for Juicy Stake is to provide validator staking and services to consumers who want to stake their crypto on Proof of Stake Blockchains.
                </p>
            </div>
        </div>
    );
}

export default AboutComponent;
