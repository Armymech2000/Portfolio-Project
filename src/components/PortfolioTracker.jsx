import React, { useState, useEffect } from 'react';
import { POLYGON_API_KEY } from './apikey';

function PortfolioTracker({ portfolio }) {
    const [stockPrices, setStockPrices] = useState({});

    useEffect(() => {
        const fetchStockPrices = async () => {
            const symbols = portfolio.map(stock => stock.symbol);
            try {
                const responses = await Promise.all(
                    symbols.map(symbol =>
                        fetch(`https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`)
                    )
                );

                const data = await Promise.all(responses.map(res => res.json()));
                const newPrices = {};
                data.forEach(item => {
                    if (item.results) {
                        newPrices[item.results.T] = item.results.p;
                    }
                });
                setStockPrices(newPrices);
            } catch (error) {
                console.error('Error fetching stock prices:', error);
            }
        };

        if (portfolio.length > 0) {
            fetchStockPrices();
        }
    }, [portfolio]);

    return (
        <div className="portfolio-tracker">
            <h2>Portfolio Tracker</h2>
            <table>
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Avg. Share Price</th>
                        <th>Current Price</th>
                        <th>Gain/Loss (%)</th>
                        <th>Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    {portfolio.map((stock, index) => {
                        const currentPrice = stockPrices[stock.symbol];
                        const currentTotalValue = currentPrice * stock.numShares;
                        const gainLoss = currentTotalValue - stock.averageSharePrice * stock.numShares;
                        const percentageChange = ((gainLoss / (stock.averageSharePrice * stock.numShares)) * 100).toFixed(2);

                        return (
                            <tr key={index}>
                                <td>{stock.symbol}</td>
                                <td>{stock.averageSharePrice.toFixed(2)}</td>
                                <td>{currentPrice ? currentPrice.toFixed(2) : 'Loading...'}</td>
                                <td style={{ color: gainLoss >= 0 ? 'green' : 'red' }}>
                                    {percentageChange}%
                                </td>
                                <td>${currentTotalValue ? currentTotalValue.toFixed(2) : 'Loading...'}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default PortfolioTracker;