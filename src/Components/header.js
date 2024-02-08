import React from 'react';
import './header.css'; // Make sure to create this CSS file
import logo from '../Assets/jslogo.png'; // Make sure to create this image file
function Header() {
    return (
        <header className="header">
            <img src={logo} alt="Logo" className="logo" /> {/* Replace with your logo path */}
            <div className="welcome-box">
                <p>Welcome to Juicy Stake - the most delicious place to stake crypto on Earth</p>
            </div>
        </header>
    );
}

export default Header;
