import React, { useState, useRef } from 'react';
import './home.css';
import { CdpInfo, fetchAllCdpInfo, getCdpInfo } from '../contractComunication/maker';
import { bytesToString } from '../utils/bytesToString';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register required chart elements
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home: React.FC = () => {
  const [selectedCollateral, setSelectedCollateral] = useState<string>('ETH-A');
  const [roughCdpId, setRoughCdpId] = useState<number | null>(null);
  const [cdpResults, setCdpResults] = useState<CdpInfo[]>([]);
  const [checkedCdpIds, setCheckedCdpIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const roughCdpIdInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setCdpResults([]);
    setCheckedCdpIds([]);
    setLoading(true);

    const enteredCdpId = roughCdpIdInputRef.current ? parseInt(roughCdpIdInputRef.current.value, 10) : null;
    console.log('Entered CDP ID:', enteredCdpId);
    console.log('Selected Collateral:', selectedCollateral);
    setRoughCdpId(enteredCdpId);

    if (enteredCdpId === null || isNaN(enteredCdpId)) {
      setLoading(false);
      return;
    }

    try {
      const info = await getCdpInfo(enteredCdpId);
      let number = 0;

      if (info && bytesToString(info.ilk) === selectedCollateral) {
        setCdpResults([info]);
        number++;
        setCheckedCdpIds([number]);
      } else {
        setCheckedCdpIds([number]);
      }

      let iteration = 1;
      while (number < 20) {
        await new Promise((resolve) => setTimeout(resolve, 300)); // Prevent API throttling
        const results = await fetchAllCdpInfo(enteredCdpId, iteration);

        if (results.length === 0) 
          continue;

        results.forEach((result) => {
          if (number >= 20) 
            return;

          if (result && bytesToString(result.ilk) === selectedCollateral) {
            number++;
            setCheckedCdpIds((prev) => [...prev, number]);

            setCdpResults((prev) => [...prev, result]);
          } else {
            setCheckedCdpIds((prev) => [...prev, number]);
          }
          console.log("Number: ", number);
        });

        iteration++;
        if (cdpResults.length >= 20) break; // Stop if we have enough results
      }
    } catch (error) {
      console.error("Error fetching CDP info:", error);
    }

    setLoading(false);
  };

  // Graph data for checked CDP IDs
  const graphData = {
    labels: checkedCdpIds, // X-axis: CDP IDs checked
    datasets: [
      {
        label: 'Checked CDP IDs',
        data: checkedCdpIds.map((num, index) => num), // Y-axis: order of checking
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
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

      {/* Graph Visualization */}
      <div className="graph-container">
        <h2>Checked CDP Progress</h2>
        <Line data={graphData} />
      </div>
    </div>
  );
};

export default Home;
