import React from 'react';
import './yieldstechsection.css'; // CSS file for styling
import mexicanFoodImage from '../Assets/tacotable.jpg'; // Adjust the path as necessary

function YieldsTechSection() {
    return (
        <div className="yields-tech-container">
            <div className="image-section" style={{ backgroundImage: `url(${mexicanFoodImage})` }}></div>
            <div className="text-section">
                <h2 className="come-on-in">Come on in for Yields + Tech and good times</h2>
                <div className="open-24-7">
                    <span>Open 24/7</span>
                </div>
            </div>
        </div>
    );
}

export default YieldsTechSection;