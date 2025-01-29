import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Home from './home/home';

function App() {
  return (
    <Router>

        <div className="app">

          {/* Routes for Sender and Receiver components */}
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
    </Router>
  );
}

export default App;
