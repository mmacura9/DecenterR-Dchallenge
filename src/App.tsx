import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Home from './home/home';
import CdpDetails from './cdpDetails/cdpDetail';

function App() {
  return (
    <Router>

        <div className="app">

          {/* Routes for Sender and Receiver components */}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cdp/:cdpId" element={<CdpDetails />} />
          </Routes>
        </div>
    </Router>
  );
}

export default App;
