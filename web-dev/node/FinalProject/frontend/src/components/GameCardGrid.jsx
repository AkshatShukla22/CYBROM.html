import React from 'react';
import GameCard from './GameCard';
import '../styles/GameCardGrid.css';

const GameCardGrid = ({ title, games }) => {
  if (!games || games.length === 0) {
    return null;
  }

  return (
    <section className="game-card-grid-section">
      <div className="grid-section-header">
        <h2 className="grid-section-title">{title}</h2>
        <span className="grid-games-count">{games.length} games</span>
      </div>
      
      <div className="games-grid-container">
        {games.map(game => (
          <GameCard key={game._id} game={game} />
        ))}
      </div>
    </section>
  );
};

export default GameCardGrid;