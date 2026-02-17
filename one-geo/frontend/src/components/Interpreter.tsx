import React, { useState } from 'react';
import axios from 'axios';
import './Interpreter.css';

interface Well {
  id: number;
  curves?: Array<{
    curveName: string;
    unit: string;
    description: string;
  }>;
  startDepth: number;
  stopDepth: number;
}

interface Props {
  well: Well;
}

export default function Interpreter({ well }: Props) {
  const [depthStart, setDepthStart] = useState(well.startDepth);
  const [depthStop, setDepthStop] = useState(well.stopDepth);
  const [selectedCurves, setSelectedCurves] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [error, setError] = useState('');

  const handleCurveChange = (curveName: string) => {
    setSelectedCurves((prev) =>
      prev.includes(curveName)
        ? prev.filter((c) => c !== curveName)
        : [...prev, curveName]
    );
  };

  const handleInterpret = async () => {
    if (selectedCurves.length === 0) {
      setError('Please select at least one curve');
      return;
    }

    if (depthStart >= depthStop) {
      setError('Start depth must be less than stop depth');
      return;
    }

    setIsLoading(true);
    setError('');
    setInterpretation('');

    try {
      const response = await axios.post(
        `/api/wells/${well.id}/interpret`,
        {
          depthStart,
          depthStop,
          curves: selectedCurves,
        }
      );

      setInterpretation(response.data.interpretation);
    } catch (err: any) {
      setError(
        `Interpretation failed: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="interpreter">
      <div className="interpreter-container">
        <div className="input-panel">
          <h3>🤖 AI Interpretation</h3>

          <div className="form-group">
            <label>Depth Range (feet)</label>
            <div className="depth-range">
              <input
                type="number"
                value={depthStart}
                onChange={(e) => setDepthStart(parseFloat(e.target.value))}
                min={well.startDepth}
                max={well.stopDepth}
              />
              <span>to</span>
              <input
                type="number"
                value={depthStop}
                onChange={(e) => setDepthStop(parseFloat(e.target.value))}
                min={well.startDepth}
                max={well.stopDepth}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Select Curves to Analyze</label>
            <div className="curve-selector">
              {well.curves && well.curves.length === 0 ? (
                <p className="empty">No curves available</p>
              ) : (
                well.curves?.map((curve) => (
                  <label key={curve.curveName} className="curve-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCurves.includes(curve.curveName)}
                      onChange={() => handleCurveChange(curve.curveName)}
                    />
                    <span>
                      <strong>{curve.curveName}</strong>
                      <br />
                      <small>{curve.description}</small>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            className="interpret-btn"
            onClick={handleInterpret}
            disabled={isLoading || selectedCurves.length === 0}
          >
            {isLoading ? '⏳ Analyzing...' : '🔍 Run Interpretation'}
          </button>
        </div>

        <div className="result-panel">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing well-log data with AI...</p>
            </div>
          ) : interpretation ? (
            <div className="interpretation-result">
              <div className="markdown-content">
                {interpretation.split('\n').map((line, i) => {
                  if (line.startsWith('##')) {
                    return (
                      <h2 key={i} style={{ marginTop: i > 0 ? '2rem' : 0 }}>
                        {line.replace(/##\s*/, '')}
                      </h2>
                    );
                  }
                  if (line.startsWith('###')) {
                    return <h3 key={i}>{line.replace(/###\s*/, '')}</h3>;
                  }
                  if (line.startsWith('-')) {
                    return <li key={i}>{line.replace(/^-\s*/, '')}</li>;
                  }
                  return line.trim() ? <p key={i}>{line}</p> : null;
                })}
              </div>
            </div>
          ) : (
            <div className="empty-result">
              <p>Run an interpretation to see AI-assisted analysis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
