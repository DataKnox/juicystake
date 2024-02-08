import React from 'react';
import './footer.css'; // Import your CSS file
import logoImage from '../Assets/jslogo.png'; // Import company logo image

function FooterComponent() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <footer className="footer-container">
            <button className="back-to-top-button" onClick={scrollToTop}>Back to Top</button>
            <img src={logoImage} alt="Company Logo" className="logo-image" />
        </footer>
    );
}

export default FooterComponent;
