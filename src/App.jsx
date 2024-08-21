import React, { useState } from 'react';
import TickerTape from './components/TickerTape';
import Calculator from './components/Calculator';
import PortfolioTracker from './components/PortfolioTracker';
import StockNews from './components/StockNews';
import logo from './app/assets/img/logo.svg'
import './App.css';

function App() {
  const [portfolio, setPortfolio] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState('');

  const handleAddToPortfolio = (stockData) => {
    setPortfolio([...portfolio, stockData]);
  };

  return (
    <div className="app-container">
      <div className="fixed-header">
        <div className="logo-wrapper">
          <img src={logo} width='100' alt="Company Logo" />
        </div>
        <TickerTape />
      </div>
      <main className="main-content">
        <Calculator onAddToPortfolio={handleAddToPortfolio} onSymbolSelect={setSelectedSymbol} />
        <PortfolioTracker portfolio={portfolio} onSymbolSelect={setSelectedSymbol} />
        {selectedSymbol && <StockNews symbol={selectedSymbol} />}
      </main>
    </div>
  );
}

export default App;