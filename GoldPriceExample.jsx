import React from 'react';
import GoldPriceCard from './GoldPriceCard';

/**
 * Example usage of GoldPriceCard component
 * 
 * This shows how to integrate the gold price card
 * into your trading platform
 */

function App() {
  return (
    <div className="app">
      <div className="container">
        <h1>Trading Dashboard</h1>
        
        {/* Gold Price Card - Auto-updates every 30 seconds */}
        <GoldPriceCard />
        
        {/* You can add multiple cards */}
        <div className="cards-grid">
          <GoldPriceCard />
          {/* Add more trading cards here */}
        </div>
      </div>
    </div>
  );
}

export default App;
