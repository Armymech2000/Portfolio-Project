import React, { useState, useEffect } from 'react';
import { POLYGON_API_KEY } from './apikey';

function calculateStockPerformance(sharePrice, numShares, buyPrice) {
    if (
        isNaN(sharePrice) ||
        isNaN(numShares) ||
        isNaN(buyPrice) ||
        numShares <= 0 ||
        buyPrice <= 0
    ) {
        throw new Error('Invalid input. Please enter valid numbers.');
    }

    const currentTotalValue = sharePrice * numShares;
    const profitLoss = currentTotalValue - numShares * buyPrice;
    const percentChange =(profitLoss / (numShares * buyPrice)) * 100 || 0;

    return { currentTotalValue, profitLoss, percentChange };
}

function Calculator({ onAddToPortfolio }) {
    const [tickerSymbol, setTickerSymbol] = useState('');
    const [numShares, setNumShares] = useState('');
    const [buyPrice, setBuyPrice] = useState('');
    const [sharePrice, setSharePrice] = useState('');
    const [result, setResult] = useState(null);
    const [profitLossColor, setProfitLossColor] = useState('black');
    const [percentChangeColor, setPercentChangeColor] = useState('black');

    useEffect(() => {
        const fetchSharePrice = async () => {
            try {
                const response = await fetch(
                    `https://api.polygon.io/v2/last/trade/${tickerSymbol}?apiKey=${POLYGON_API_KEY}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setSharePrice(data.results.p.toString());

                    setResult(prevResult => ({
                        ...prevResult,
                        currentTotalValue: data.results.p * numShares,
                        profitLoss: data.results.p * numShares - numShares * buyPrice,
                        percentChange: ((data.results.p * numShares - numShares * buyPrice) / (numShares * buyPrice)) * 100 || 0
                    }));
                } else {
                    console.error(
                        `Error fetching share price for ${tickerSymbol}:`,
                        response.status,
                        response.statusText
                    );
                    setResult({
                        currentTotalValue: 0,
                        profitLoss: 0,
                        percentChange: 0,
                        error: 'Error fetching share price.'
                    });
                }
            } catch (error) {
                console.error(`Error fetching share price for ${tickerSymbol}:`, error);
                setResult({
                    currentTotalValue: 0,
                    profitLoss: 0,
                    percentChange: 0,
                    error: 'Error fetching share price.'
                });
            }
        };

        if (tickerSymbol) {
            fetchSharePrice();
        }
    }, [tickerSymbol, numShares, buyPrice]);

    useEffect(() => {
        if (result) {
            setProfitLossColor(result.profitLoss >= 0 ? 'green' : 'red');
            setPercentChangeColor(result.percentChange >= 0 ? 'green' : 'red');
        }
    }, [result]);

    const calculateResult = () => {
        const currentSharePrice = parseFloat(sharePrice) || 0;
        const currentNumShares = parseFloat(numShares) || 0;
        const currentBuyPrice = parseFloat(buyPrice) || 0;

        try {
            const result = calculateStockPerformance(currentSharePrice, currentNumShares, currentBuyPrice);
            setResult(result);
        } catch (error) {
            setResult({ currentTotalValue: 0, profitLoss: 0, percentChange: 0, error: error.message });
        }
    };

    const handleAddToPortfolio = () => {
        if (result && !result.error) {
            onAddToPortfolio({
                symbol: tickerSymbol,
                averageSharePrice: parseFloat(buyPrice),
                numShares: parseFloat(numShares),
            });
        }
    };

    return (
        <div className="calculator-container">
            <h2>Stock Performance Calculator</h2>

            <label htmlFor="ticker-symbol">Ticker Symbol:</label>
            <input
                type="text"
                id="ticker-symbol"
                value={tickerSymbol}
                onChange={(e) => setTickerSymbol(e.target.value.toUpperCase())}
            />

            <label htmlFor="num-shares">Number of Shares:</label>
            <input
                type="number"
                id="num-shares"
                value={numShares}
                onChange={(e) => setNumShares(e.target.value)}
            />

            <label htmlFor="buy-price">Buy Price:</label>
            <input
                type="number"
                id="buy-price"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
            />

            <div className="button-grid">
                <button id="calculate-button" onClick={calculateResult}>Calculate</button>
                <button onClick={handleAddToPortfolio} disabled={!result || result.error}>
                    Add to Portfolio
                </button>
            </div>

            <div id="result">
                {result && !result.error && (
                    <div>
                        <p>Current Total Value: ${result.currentTotalValue.toFixed(2)}</p>
                        <p style={{ color: profitLossColor }}>Profit/Loss: ${result.profitLoss.toFixed(2)}</p>
                        <p style={{ color: percentChangeColor }}>Percent Change: {result.percentChange.toFixed(2)}%</p>
                    </div>
                )}
                {result && result.error && (
                    <p style={{ color: 'red' }}>Error: {result.error}</p>
                )}
            </div>
        </div>
    );
}

export default Calculator;