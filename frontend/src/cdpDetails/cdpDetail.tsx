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
                    console.log(accounts);
                    setAccount(accounts[0]);
                    signMessage(accounts[0]);
                } catch (error) {
                    console.error("Failed to connect MetaMask", error);
                }
            }
        };
        requestAccount();
    }, []);
    const convert_to_dai = new Map<string, number>([
        ["ETH-A", 3352.29],
        ["WBTC-A", 101895.46],
        ["USDC-A", 1.0]
    ]);
    
    const liq_ratio = new Map<string, number>([
        ["ETH-A", 1.45],
        ["WBTC-A", 1.45],
        ["USDC-A", 1.01]
    ]);
    
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
            const ilk = bytesToString(cdpInfo.ilk);
            const daiConversionRate = convert_to_dai.get(ilk) ?? 1;
            const liquidationRatio = liq_ratio.get(ilk) ?? 1;

            const ratio = cdpInfo.debt > 0
                ? (cdpInfo.collateral * daiConversionRate) / cdpInfo.debt
                : 0;
            setLiquidationRatio(liquidationRatio);

            const maxCollateral = cdpInfo.collateral - (cdpInfo.debt * liquidationRatio) / daiConversionRate;
            setMaxCollateral(Math.max(0, maxCollateral));

            const maxDebt = (cdpInfo.collateral / liquidationRatio) * daiConversionRate;
            setMaxDebt(Math.max(0, maxDebt));

            setSelectedCollateral(bytesToString(cdpInfo.ilk));
            setCollaterizationRatio(ratio);

            
        } catch (error) {
            console.error('Error:', error);
            return <div className="home-container">Invalid CDP ID</div>;
        }
    };

    const signMessage = async (account: string) => {
        console.log("Account: ", account);
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
