import React, { useState } from 'react';
import './home.css'; // Import the CSS file

const Home: React.FC = () => {
  const [selectedCollateral, setSelectedCollateral] = useState<string>('ETH-A');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Selected Collateral:', selectedCollateral);
    // You can add further logic here, like sending the data to an API
  };

  return (
    <div className="home-container">
      <h1 className="title">Collateral Selector</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <label htmlFor="collateral-select" className="label">
          Choose Collateral Type:
        </label>
        <select
          id="collateral-select"
          value={selectedCollateral}
          onChange={(e) => setSelectedCollateral(e.target.value)}
          className="select-input"
        >
          <option value="ETH-A">ETH-A</option>
          <option value="WBTC-A">WBTC-A</option>
          <option value="WSTETH-A">WSTETH-A</option>
        </select>
        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Home;