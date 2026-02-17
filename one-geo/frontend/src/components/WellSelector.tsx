import React from 'react';
import './WellSelector.css';

interface Well {
  id: number;
  filename: string;
  wellName: string;
  field: string;
  startDepth: number;
  stopDepth: number;
}

interface Props {
  wells: Well[];
  selectedWell: Well | null;
  onSelect: (wellId: number) => void;
}

export default function WellSelector({ wells, selectedWell, onSelect }: Props) {
  return (
    <div className="well-selector">
      {wells.map((well) => (
        <div
          key={well.id}
          className={`well-item ${selectedWell?.id === well.id ? 'active' : ''}`}
          onClick={() => onSelect(well.id)}
        >
          <h3>{well.wellName}</h3>
          <p className="well-field">{well.field}</p>
          <p className="well-depth">
            {well.startDepth.toFixed(0)}ft - {well.stopDepth.toFixed(0)}ft
          </p>
          <p className="well-file">{well.filename}</p>
        </div>
      ))}
    </div>
  );
}
