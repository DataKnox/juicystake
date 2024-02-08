import React from 'react';
import './crypstakingservice.css'; // CSS file for styling
import drinksImage from '../Assets/drinks.jpeg'; // Adjust the path as necessary
function CrypStakingService() {
    return (
        <div className="staking-services-section">
            <div className="scrolling-services">·Crypto·Staking·Services·Crypto·Staking·Services·Crypto·Staking·Services·Crypto·Staking·Services·Crypto·Staking·Services·</div>
            <div className="section-wrapper">
                <div className="node-section">
                    <h2>Come get on the node <span role="img" aria-label="cocktail">🍹</span><br /> and earn some yield<span role="img" aria-label="steak">🥩</span><br /> with your friends <span role="img" aria-label="peace">✌🏽</span></h2>
                </div>
                <div className="image-section">
                    <img src={drinksImage} alt="Drinks" className="drinks-image" />
                </div>
            </div>
        </div>
    );
}

export default CrypStakingService;