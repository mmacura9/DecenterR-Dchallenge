import React, { useState, useRef, useEffect } from 'react';
import './home.css';
import { calculateDebt, CdpInfo, fetchAllCdpInfo, getCdpInfo } from '../contractComunication/maker';
import { bytesToString, stringToBytes } from '../utils/bytesToString';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { getIlkInfo } from '../contractComunication/ilks';
import { Queue } from '@datastructures-js/queue';

// Register required chart elements
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Home: React.FC = () => {
  const [selectedCollateral, setSelectedCollateral] = useState<string>('ETH-A');
  const [roughCdpId, setRoughCdpId] = useState<number | null>(null);
  const [cdpResults, setCdpResults] = useState<CdpInfo[]>([]);
  const [checkedCdpIds, setCheckedCdpIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const roughCdpIdInputRef = useRef<HTMLInputElement>(null);
  const [debouncedCdpId, setDebouncedCdpId] = useState<number | null>(null);


  const fetchControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCdpId(roughCdpId);
    }, 300);

    return () => clearTimeout(handler);
  }, [roughCdpId]);

  useEffect(() => {
    if (debouncedCdpId !== null) {
      fetchCdpInfo(debouncedCdpId);
    }
  }, [debouncedCdpId]);

  const fetchCdpInfo = async (enteredCdpId: number) => {
    setCdpResults([]);
    setCheckedCdpIds([]);
    setLoading(true);

    if (isNaN(enteredCdpId)) {
      setLoading(false);
      return;
    }

    if (fetchControllerRef.current) {
      fetchControllerRef.current.abort();
    }
  
    // Create a new AbortController
    const controller = new AbortController();
    fetchControllerRef.current = controller;

    console.log('Entered CDP ID:', enteredCdpId);
    console.log('Selected Collateral:', selectedCollateral);
    setRoughCdpId(enteredCdpId);
    const ilkBytes32 = stringToBytes(selectedCollateral);

    const ilkInfo = await getIlkInfo(ilkBytes32);
    const rate = Number(ilkInfo.rate) / 10 ** 27;

    if (enteredCdpId === null || isNaN(enteredCdpId)) {
      setLoading(false);
      return;
    }

    try {
      const queue = new Queue<number>();
      let number = 0;

      let next_lower = enteredCdpId;
      let next_higher = enteredCdpId + 1;
      while (number < 20) {
        if (controller.signal.aborted) return;
        if (next_higher - enteredCdpId === enteredCdpId - next_lower) {
          for (let i = 0; i < 3; i++) {
            queue.enqueue(next_higher++);
            if (i < 2) queue.enqueue(next_lower--);
          }
        } else {
          for (let i = 0; i < 3; i++) {
            queue.enqueue(next_lower--);
            if (i < 2) queue.enqueue(next_higher++);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 300)); // Prevent API throttling
        const results = await fetchAllCdpInfo(enteredCdpId, queue, rate);

        if (results.length === 0) {
          console.log('No more results found.');
          continue;
        }

        results.forEach((result) => {
          if (number >= 20) 
            return;
          setCheckedCdpIds((prev) => [...prev, number]);
          
          if (result && bytesToString(result.ilk) === selectedCollateral) {
            number++;
            setCdpResults((prev) => [...prev, result]);
          }
        });
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
        min: 0,
        max: 20,
      },
    ],
  };

  return (
    <div className="home-container">
      <h1 className="title">Collateral Selector</h1>
      <form className="form-container">
        <label className="label">Choose Collateral Type:</label>
        <select
          value={selectedCollateral}
          onChange={(e) => setSelectedCollateral(e.target.value)}
          className="select-input"
        >
          <option value="ETH-A">ETH-A</option>
          <option value="ETH-B">ETH-B</option>
          <option value="ETH-C">ETH-C</option>
          <option value="BAT-A">BAT-A</option>
          <option value="USDC-A">USDC-A</option>
          <option value="USDC-B">USDC-B</option>
          <option value="WBTC-A">WBTC-A</option>
          <option value="TUSD-A">TUSD-A</option>
          <option value="ZRX-A">ZRX-A</option>
          <option value="KNC-A">KNC-A</option>
          <option value="UNIV2USDCETH-A">UNIV2USDCETH-A</option>
          <option value="UNIV2DAIUSDC-A">UNIV2DAIUSDC-A</option>
          <option value="UNIV2ETHUSDT-A">UNIV2ETHUSDT-A</option>
          <option value="UNIV2LINKETH-A">UNIV2LINKETH-A</option>
          <option value="UNIV2UNIETH-A">UNIV2UNIETH-A</option>
          <option value="MANA-A">MANA-A</option>
          <option value="USDT-A">USDT-A</option>
          <option value="PAXUSD-A">PAXUSD-A</option>
          <option value="COMP-A">COMP-A</option>
          <option value="LRC-A">LRC-A</option>
          <option value="LINK-A">LINK-A</option>
          <option value="BAL-A">BAL-A</option>
          <option value="YFI-A">YFI-A</option>
          <option value="GUSD-A">GUSD-A</option>
          <option value="UNI-A">UNI-A</option>
          <option value="RENBTC-A">RENBTC-A</option>
          <option value="AAVE-A">AAVE-A</option>
          <option value="UNIV2DAITH-A">UNIV2DAIETH-A</option>
          <option value="UNIV2WBTCETH-A">UNIV2WBTCETH-A</option>
          <option value="UNIV2WBTCDAI-A">UNIV2WBTCDAI-A</option>
          <option value="UNIV2AAVEETH-A">UNIV2AAVEETH-A</option>
          <option value="UNIV2DAIUSDT-A">UNIV2DAIUSDT-A</option>
          <option value="MATIC-A">MATIC-A</option>
          <option value="GUNIV3DAIUSDC1-A">GUNIV3DAIUSDC1-A</option>
          <option value="WBTC-B">WBTC-B</option>
          <option value="CRVV1ETHSTETH-A">CRVV1ETHSTETH-A</option>
          <option value="RETH-A">RETH-A</option>
          <option value="GNO-A">GNO-A</option>
          <option value="LSE-MKR-A">LSE-MKR-A</option>
          <option value="ALLOCATOR-SPARK-A">ALLOCATOR-SPARK-A</option>
          <option value="WSTETH-A">WSTETH-A</option>
          <option value="WBTC-C">WBTCCA</option>
          <option value="GUNIV3DAIUSDC2-A">GUNIV3DAIUSDC2-A</option>
          <option value="WSTETH-B">WSTETH-B</option>
        </select>

        <label className="label">Enter Rough CDP ID:</label>
        <input
          type="number"
          ref={roughCdpIdInputRef}
          className="number-input"
          placeholder="0"
          min="0"
          onChange={(e) => setRoughCdpId(parseInt(e.target.value, 10) || null)}
        />
      </form>

      {roughCdpId !== null && <p className="submitted-roughCdpId">Submitted Rough CDP ID: {roughCdpId}</p>}

      <div className="results-container">
        {cdpResults.length > 0 ? (
          cdpResults.map((cdp, index) => (
            <a href={`/cdp/${cdp.id}`}>
              <div key={index} className="cdp-card">
                <p><strong>CDP ID: </strong> {cdp.id}</p>
                <p><strong>Owner: </strong> {cdp.owner}</p>
                <p><strong>Collateral: </strong> {cdp.collateral.toLocaleString('en-us', {minimumFractionDigits: 2})} {selectedCollateral}</p>
                <p><strong>Debt: </strong> {cdp.debt.toLocaleString('en-us', {minimumFractionDigits: 2})} DAI</p>
              </div>
            </a>
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