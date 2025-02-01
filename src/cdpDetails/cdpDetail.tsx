import React, { useEffect, useState } from 'react';
import '../home/home.css';
import { getIlkInfo } from '../contractComunication/ilks';
import { useParams } from 'react-router-dom';
import { calculateDebt, getCdpInfo } from '../contractComunication/maker';
import { bytesToString } from '../utils/bytesToString';
import { web3 } from '../utils/web3';


const CdpDetails: React.FC = () => {
    const { cdpId } = useParams<{ cdpId: string }>();
    const [collateral, setCollateral] = useState<number>(0);
    const [debt, setDebt] = useState<number>(0);
    const [collaterizationRatio, setCollaterizationRatio] = useState<number>(0);
    const [liquidationRatio, setLiquidationRatio] = useState<number>(0);
    const [maxCollateral, setMaxCollateral] = useState<number>(0);
    const [maxDebt, setMaxDebt] = useState<number>(0);
    const [selectedCollateral, setSelectedCollateral] = useState<string>('ETH-A');
    const [signature, setSignature] = useState<string>('');
    const [account, setAccount] = useState<string>('');

    useEffect(() => {
        const requestAccount = async () => {
            if (window.ethereum) {
                try {
                    await window.ethereum.request({ method: 'eth_requestAccounts' });
                    
                    const accounts = await web3.eth.getAccounts();
                    setAccount(accounts[0]);
                } catch (error) {
                    console.error("Failed to connect MetaMask", error);
                }
            }
        };
        requestAccount();
    }, []);
    const ETH_to_DAI = 3352.29;
    const WBTC_to_DAI = 101895.46;
    const USDC_to_DAI = 1.0;

    const LIQ_ETH = 1.45;
    const LIQ_WBTC = 1.45;
    const LIQ_USDC = 1.01;
    
    const calculateCdpData = async () => {
        if (!cdpId) {
            return <div className="home-container">Invalid CDP ID</div>;
        }
        try{
            const cdpInfo = await getCdpInfo(parseInt(cdpId));
            const ilkInfo = await getIlkInfo(cdpInfo.ilk);
            const rate = Number(ilkInfo.rate) / 10 ** 27;
            console.log(rate);
            cdpInfo.debt = await calculateDebt(Number(cdpInfo.debt), rate);
            cdpInfo.collateral = Number(cdpInfo.collateral) / 10 ** 18;
            setCollateral(cdpInfo.collateral);
            setDebt(cdpInfo.debt);
            let ratio = cdpInfo.collateral / cdpInfo.debt;
            if (bytesToString(cdpInfo.ilk) == "ETH-A"){
                ratio = ETH_to_DAI * ratio;
                setLiquidationRatio(LIQ_ETH);
                setMaxCollateral(cdpInfo.collateral - cdpInfo.debt*LIQ_ETH/ETH_to_DAI);
                setMaxDebt(cdpInfo.collateral/LIQ_ETH*ETH_to_DAI);
            } 
            if (bytesToString(cdpInfo.ilk) == "WBTC-A"){
                ratio = WBTC_to_DAI * ratio;
                setLiquidationRatio(LIQ_WBTC);
                setMaxCollateral(cdpInfo.collateral - cdpInfo.debt*LIQ_WBTC/WBTC_to_DAI);
                setMaxDebt(cdpInfo.collateral/LIQ_WBTC*WBTC_to_DAI);
            }
            if (bytesToString(cdpInfo.ilk) == "USDC-A"){
                ratio = USDC_to_DAI * ratio;
                setLiquidationRatio(LIQ_USDC);
                setMaxCollateral(cdpInfo.collateral - cdpInfo.debt*LIQ_USDC/USDC_to_DAI);
                setMaxDebt(cdpInfo.collateral/LIQ_USDC*USDC_to_DAI);
            }
            setSelectedCollateral(bytesToString(cdpInfo.ilk));
            setCollaterizationRatio(ratio);

            
        } catch (error) {
            console.error('Error:', error);
            return <div className="home-container">Invalid CDP ID</div>;
        }
    };

    const signMessage = async () => {
        if (!web3 || !account) return;
        try {
            const message = "Ovo je moj CDP";
            const signedMessage = await web3.eth.personal.sign(message, account, '');
            setSignature(signedMessage);
        } catch (error) {
            console.error("Error signing message", error);
        }
    };

    useEffect(() => {
        calculateCdpData();
        signMessage();
    }, [cdpId]);

    return (
        <div className="home-container">
            <h1>CDP Details for ID: {cdpId}</h1>
            <p>Collateral: {collateral.toLocaleString('en-us', {minimumFractionDigits: 2})} {selectedCollateral}</p>
            <p>Debt: {debt.toLocaleString('en-us', {minimumFractionDigits: 2})} DAI</p>
            <p>Collaterization Ratio: {(collaterizationRatio*100).toFixed(2)}%</p>
            <p>Liquidation Ratio: {(liquidationRatio*100).toFixed(2)}%</p>
            <p>Max Collateral: {maxCollateral.toLocaleString('en-us', {minimumFractionDigits: 2})} {selectedCollateral}</p>
            <p>Max Debt: {maxDebt.toLocaleString('en-us', {minimumFractionDigits: 2})} DAI</p>
            <p>Signature: {signature}</p>
        </div>
    );
};

export default CdpDetails;
