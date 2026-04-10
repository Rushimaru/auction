import React from 'react';
import './Loader.css';

const Loader = ({ text = "Loading Statistics..." }) => {
  return (
    <div className="loader-overlay">
      <div className="loader-card glass-panel">
        <div className="premium-spinner">
          <div className="spinner-inner"></div>
          <div className="spinner-orbit"></div>
        </div>
        <p className="loader-text">{text}</p>
        <div className="loader-glow"></div>
      </div>
    </div>
  );
};

export default Loader;
