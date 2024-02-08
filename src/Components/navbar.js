import React from 'react';
import './navbar.css'; // We will create this CSS file next for styling
import { Link } from 'react-router-dom';
function NavBar() {
    return (
        <nav className="navbar">
            <Link to="/tools"><button>Tools</button></Link>
            <button onClick={() => window.open('https://discord.gg/kCzSPaYJ5A', '_blank')}>Discord</button>
            <button onClick={() => document.getElementById('networks-section').scrollIntoView({ behavior: 'smooth' })}>Networks</button>
        </nav>
    );
}

export default NavBar;
