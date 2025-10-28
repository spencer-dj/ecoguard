import React from 'react';
import './Predictions.css';

const XgbPredictions = ({ predictions }) => {
  return (
    <div className="predictions-box xgb-predictions">
      <h3>XGBoost Predictions</h3>
      <ul>
        {predictions.length > 0 ? (
          predictions.map((p) => (
            <li key={p.id}>
              {p.prediction.toUpperCase()} — {p.species}
              {p.latitude && p.longtitude ? ` @ (${p.latitude}, ${p.longtitude})` : ''}
            </li>
          ))
        ) : (
          <li>No predictions yet...</li>
        )}
      </ul>
    </div>
  );
};

export default XgbPredictions;