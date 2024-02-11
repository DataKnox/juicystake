// Import the necessary modules from React and React DOM
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'; // We will create this CSS file next for styling
// Import your App component and any other pages/components you have
import App from './App';
import ToolsPage from './Components/tools'; // Make sure you have this component created
import HomePage from './Components/home'; // Make sure you have this component created
import { Buffer } from 'buffer';
window.Buffer = Buffer;
// Find the root div in your HTML
const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="tools" element={<ToolsPage />} />
          {/* Add more routes as needed */}
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
