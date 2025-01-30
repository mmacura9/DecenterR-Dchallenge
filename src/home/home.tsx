import React, { useState, useRef } from 'react';
import './home.css';
import { getCdpInfo } from '../contractComunication/maker';
import { bytesToString } from '../utils/bytesToString';


const Home: React.FC = () => {
  const [selectedCollateral, setSelectedCollateral] = useState<string>('ETH-A');
  const [roughCdpId, setRoughCdpId] = useState<number | null>(null);
  const roughCdpIdInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const enteredCdpId = roughCdpIdInputRef.current ? parseInt(roughCdpIdInputRef.current.value, 10) : null;
    setRoughCdpId(enteredCdpId);

    console.log('Selected Collateral:', selectedCollateral);
    console.log('Rough CDP ID:', enteredCdpId);

    if (enteredCdpId === null) {
      console.log('Invalid CDP ID');
      return;
    }

    const info = await getCdpInfo(enteredCdpId);
    if (!info) {
      console.log('Invalid CDP Info');
      return;
    }
    console.log('CDP Info:', info);

    const ilk = bytesToString(info.ilk);
    console.log('ILK:', ilk);
    let number = 1;
    let it = 1;
    while (number<20) {
        // sleep(100);
        const new_info = await getCdpInfo(enteredCdpId + it);
        if (new_info && bytesToString(new_info.ilk) === ilk) {
            console.log('CDP Info:', new_info);
            console.log('CDP ID:', enteredCdpId + it);
            number++;
        }
        const new_info2 = await getCdpInfo(enteredCdpId - it);
        if (new_info2 && bytesToString(new_info2.ilk) === ilk) {
            console.log('CDP Info:', new_info2);
            console.log('CDP ID:', enteredCdpId + it);
            number++;
        }
        it++;
    }
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

        <label htmlFor="roughCdpId-input" className="label">
          Enter Rough CDP ID:
        </label>
        <input
          id="roughCdpId-input"
          type="number"
          ref={roughCdpIdInputRef}
          className="number-input"
          placeholder="0"
          min="0"
        />

        <button type="submit" className="submit-button">
          Submit
        </button>

        {roughCdpId !== null && (
          <p className="submitted-roughCdpId">Submitted Rough CDP ID: {roughCdpId}</p>
        )}
      </form>
    </div>
  );
};

export default Home;

// function sleep(num: number) {
//     return new Promise(resolve => setTimeout(resolve, num));
// }
