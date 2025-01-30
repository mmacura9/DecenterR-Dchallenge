import React, { useState, useRef } from 'react';
import './home.css';
import { CdpInfo, fetchAllCdpInfo, getCdpInfo } from '../contractComunication/maker';
import { bytesToString } from '../utils/bytesToString';

const Home: React.FC = () => {
  const [selectedCollateral, setSelectedCollateral] = useState<string>('ETH-A');
  const [roughCdpId, setRoughCdpId] = useState<number | null>(null);
  const [cdpResults, setCdpResults] = useState<CdpInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const roughCdpIdInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCdpResults([]);
    setLoading(true);

    const enteredCdpId = roughCdpIdInputRef.current ? parseInt(roughCdpIdInputRef.current.value, 10) : null;
    setRoughCdpId(enteredCdpId);

    if (enteredCdpId === null || isNaN(enteredCdpId)) {
      setLoading(false);
      return;
    }

    try {
      let number = 0;

      const info = await getCdpInfo(enteredCdpId);
      if (info && bytesToString(info.ilk) === selectedCollateral) {
        setCdpResults([info]); // Show immediately
        number++;
      }

      let iteration = 1;
      while (number < 20) {
        await new Promise((resolve) => setTimeout(resolve, 300)); // Prevent API throttling
        const results = await fetchAllCdpInfo(enteredCdpId, iteration);

        if (results.length === 0) break; // Stop fetching if no more results

        results.forEach((result) => {
          if (number >= 20) 
            return;
          if (result && bytesToString(result.ilk) === selectedCollateral) {
            setCdpResults((prev) => [...prev, result]); // Append new results immediately
            number++;
          }
        });

        iteration++;
        console.log(number);
        if (number >= 20) break; // Stop if we have enough results
      }
    } catch (error) {
      console.error("Error fetching CDP info:", error);
    }

    setLoading(false);
  };

  return (
    <div className="home-container">
      <h1 className="title">Collateral Selector</h1>
      <form onSubmit={handleSubmit} className="form-container">
        <label className="label">Choose Collateral Type:</label>
        <select
          value={selectedCollateral}
          onChange={(e) => setSelectedCollateral(e.target.value)}
          className="select-input"
        >
          <option value="ETH-A">ETH-A</option>
          <option value="WBTC-A">WBTC-A</option>
          <option value="WSTETH-A">WSTETH-A</option>
        </select>

        <label className="label">Enter Rough CDP ID:</label>
        <input
          type="number"
          ref={roughCdpIdInputRef}
          className="number-input"
          placeholder="0"
          min="0"
        />

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>

      {roughCdpId !== null && <p className="submitted-roughCdpId">Submitted Rough CDP ID: {roughCdpId}</p>}

      <div className="results-container">
        {cdpResults.length > 0 ? (
          cdpResults.map((cdp, index) => (
            <div key={index} className="cdp-card">
              <p><strong>CDP ID: </strong> {cdp.id}</p>
              <p><strong>Owner: </strong> {cdp.owner}</p>
              <p><strong>Collateral: </strong> {cdp.collateral}</p>
              <p><strong>Debt: </strong> {cdp.debt}</p>
            </div>
          ))
        ) : (
          !loading && <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default Home;
