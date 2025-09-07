/**
 * @fileoverview Application entry point for VendingMachine V1 DApp
 * @description Bootstrap file that renders the React application to the DOM
 * @author Felicien ASTIER - Alchemy Ethereum Bootcamp Project
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

/**
 * Application Bootstrap
 * @description Entry point that mounts the React application
 * @notice Uses React 18+ createRoot API for improved performance
 */

// Create root element and render the application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 
      React.StrictMode helps identify problems during development:
      - Detects components with unsafe lifecycles
      - Warns about legacy string ref API usage
      - Warns about deprecated findDOMNode usage
      - Detects unexpected side effects
      - Detects legacy context API
      - Ensures reusable state
    */}
    <App />
  </React.StrictMode>,
)