import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../App.css';
import { POLYGON_API_KEY } from './apikey';

function TickerTape() {
  const [tickerData, setTickerData] = useState({});
  const [newSymbol, setNewSymbol] = useState('');
  const isFetching = useRef(false);
  const lastFetchedTime = useRef(null);

  const predefinedSymbols = ['AAPL', 'GOOGL', 'AMZN', 'MSFT', 'META', 'NVDA', 'TSLA'];
  const [symbolsToFetch, setSymbolsToFetch] = useState(predefinedSymbols);

  const fetchTickerData = async (symbol) => {
    try {
      const response = await fetch(
        `https://api.polygon.io/v2/last/trade/${symbol}?apiKey=${POLYGON_API_KEY}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.results;
      } else {
        throw new Error(`Error fetching data for ${symbol}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  };

  const fetchData = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;

    try {
      const now = new Date();
      if (
        lastFetchedTime.current &&
        now - lastFetchedTime.current < 1 * 10 * 1000
      ) {
        return;
      }

      console.log("Fetching data for symbols:", symbolsToFetch);

      const results = await Promise.all(symbolsToFetch.map(fetchTickerData));

      if (results.every(result => result !== null)) {
        const newTickerData = {};
        for (let i = 0; i < symbolsToFetch.length; i++) {
          if (results[i]) {
            const prevClose = tickerData[symbolsToFetch[i]]?.price;
            const change = prevClose !== undefined ? results[i].p - prevClose : 0;
            newTickerData[symbolsToFetch[i]] = { price: results[i].p, change };
          }
        }
        setTickerData(newTickerData);
        lastFetchedTime.current = now;
      } else {
        console.error('Error fetching some ticker data. Data not updated.');
      }
    } finally {
      isFetching.current = false;
    }
  }, [tickerData, symbolsToFetch]);

  useEffect(() => {
    fetchData();

    const intervalId = setInterval(fetchData, 1 * 10 * 1000);

    return () => clearInterval(intervalId);
  }, [fetchData]);

  const handleAddSymbol = () => {
    const uppercaseSymbol = newSymbol.trim().toUpperCase();

    if (uppercaseSymbol !== '' && !symbolsToFetch.includes(uppercaseSymbol)) {
      setSymbolsToFetch(prevSymbols => [...prevSymbols, uppercaseSymbol]);
      setNewSymbol('');
      fetchData();
    }
  };

  const handleClearAddedSymbols = () => {
    setSymbolsToFetch(predefinedSymbols);
    setTickerData({});
  };

  return (
    <div id="ticker-container">
      <div>
        <input
          type="text"
          value={newSymbol}
          onChange={(e) => setNewSymbol(e.target.value)}
          placeholder="Enter symbol"
        />
        <button onClick={handleAddSymbol}>Add Symbol</button>
        <button onClick={handleClearAddedSymbols}>Clear Added Symbols</button>
      </div>
      <div>
        <div id="ticker-tape">
          {Object.entries(tickerData).map(([symbol, data]) => (
            <div
              key={symbol}
              className={`ticker-item ${data.change < 0 ? 'loss' : ''}`}
            >
              <span className="symbol">{symbol}</span>
              <span className="price">{data.price.toFixed(2)}</span>
              <span className="change">({data.change.toFixed(2)})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TickerTape;