import React from 'react';
import './navbar.css'; // We will create this CSS file next for styling
import { useNavigate } from 'react-router-dom';
function NavBar() {
    let navigate = useNavigate();
    return (
        <nav className="navbar">
            <button onClick={() => navigate('/tools')}>Tools</button>
            <button onClick={() => window.open('https://discord.gg/kCzSPaYJ5A', '_blank')}>Discord</button>
            <button onClick={() => document.getElementById('networks-section').scrollIntoView({ behavior: 'smooth' })}>Networks</button>
        </nav>
    );
}

export default NavBar;
