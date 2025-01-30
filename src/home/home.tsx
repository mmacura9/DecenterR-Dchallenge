import React, { useState, useRef } from 'react';
import './home.css';
import { CdpInfo, getCdpInfo } from '../contractComunication/maker';
import { bytesToString } from '../utils/bytesToString';
import { Buffer } from 'Buffer';
import pLimit from 'p-limit';

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

    if (enteredCdpId === null) {
      setLoading(false);
      return;
    }

    const output: CdpInfo[] = [];
    const info = await getCdpInfo(enteredCdpId);
    if (info && bytesToString(info.ilk) === selectedCollateral) {
      output.push(info);
    }

    let number = 1;
    let it = 1;
    const limit = pLimit(5);
    const requests = [];

    while (number < 20) {
      requests.push(limit(() => getCdpInfo(enteredCdpId + it)));
      requests.push(limit(() => getCdpInfo(enteredCdpId - it)));

      const results = await Promise.all(requests);

      for (const result of results) {
        if (result && bytesToString(result.ilk) === selectedCollateral) {
          output.push(result);
          number++;
        }
      }

      it += 2;
    }

    setCdpResults(output);
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
        {cdpResults.map((cdp, index) => (
          <div key={index} className="cdp-card">
            <p><strong>CDP ID: </strong> {cdp.id}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Home;
