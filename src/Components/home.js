import React from 'react';
import Header from './header';
import NavBar from './navbar';
import YieldsTechSection from './yieldstechsection';
import CryptoStakingService from './crypstakingservice';
import NetworksComponent from './networks';
import VideoComponent from './yt';
import AboutComponent from './about';
import FooterComponent from './footer';
import './home.css'; // Make sure to create this CSS file
function HomeComponent() {
    return (
        <div className="home-container">
            <Header />
            <NavBar />
            <YieldsTechSection />
            <CryptoStakingService />
            <NetworksComponent />
            <VideoComponent />
            <AboutComponent />
            <FooterComponent />
        </div>
    );
}

export default HomeComponent;
