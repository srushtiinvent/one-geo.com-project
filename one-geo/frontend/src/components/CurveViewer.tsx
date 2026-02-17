import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import './CurveViewer.css';

interface Well {
  id: number;
  curves?: Array<{
    id: number;
    curveName: string;
    unit: string;
    description: string;
    dataPoints: number;
  }>;
  startDepth: number;
  stopDepth: number;
}

interface Props {
  well: Well;
}

export default function CurveViewer({ well }: Props) {
  const [selectedCurves, setSelectedCurves] = useState<string[]>([]);
  const [depthRange, setDepthRange] = useState({
    start: well.startDepth,
    stop: well.stopDepth,
  });
  const [plotData, setPlotData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedCurves.length > 0) {
      loadCurveData();
    }
  }, [selectedCurves, depthRange]);

  const loadCurveData = async () => {
    setIsLoading(true);
    setError('');

    try {
      const traces: any[] = [];

      for (const curveName of selectedCurves) {
        const response = await axios.get(
          `/api/wells/${well.id}/curves/${curveName}/data`,
          {
            params: {
              depthStart: depthRange.start,
              depthStop: depthRange.stop,
            },
          }
        );

        const { data: dataPoints } = response.data;

        traces.push({
          name: curveName,
          x: dataPoints.map((d: any) => d.value),
          y: dataPoints.map((d: any) => d.depth),
          type: 'scatter',
          mode: 'lines',
          hovertemplate: `<b>${curveName}</b><br>Depth: %{y:.2f}ft<br>Value: %{x:.2f}<extra></extra>`,
        });
      }

      setPlotData(traces);
    } catch (err: any) {
      setError(`Failed to load curve data: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurveToggle = (curveName: string) => {
    setSelectedCurves((prev) =>
      prev.includes(curveName)
        ? prev.filter((c) => c !== curveName)
        : [...prev, curveName]
    );
  };

  const handleDepthChange = (key: 'start' | 'stop', value: number) => {
    setDepthRange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="curve-viewer">
      <div className="viewer-container">
        <div className="controls">
          <h3>🎛️ Controls</h3>

          <div className="control-group">
            <label>Depth Range</label>
            <div className="depth-inputs">
              <input
                type="number"
                value={depthRange.start}
                onChange={(e) => handleDepthChange('start', parseFloat(e.target.value))}
                min={well.startDepth}
                max={depthRange.stop}
              />
              <span>to</span>
              <input
                type="number"
                value={depthRange.stop}
                onChange={(e) => handleDepthChange('stop', parseFloat(e.target.value))}
                min={depthRange.start}
                max={well.stopDepth}
              />
            </div>
          </div>

          <div className="control-group">
            <label>Select Curves</label>
            <div className="curve-list">
              {well.curves && well.curves.length === 0 ? (
                <p className="empty">No curves available</p>
              ) : (
                well.curves?.map((curve) => (
                  <label key={curve.id} className="checkbox">
                    <input
                      type="checkbox"
                      checked={selectedCurves.includes(curve.curveName)}
                      onChange={() => handleCurveToggle(curve.curveName)}
                    />
                    <span className="curve-name">{curve.curveName}</span>
                    <span className="curve-unit">{curve.unit}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {error && <div className="error">{error}</div>}
        </div>

        <div className="plot-container">
          {isLoading ? (
            <div className="loading">Loading curve data...</div>
          ) : selectedCurves.length === 0 ? (
            <div className="empty-state">
              <p>Select curves to visualize</p>
            </div>
          ) : (
            <Plot
              data={plotData}
              layout={{
                title: 'Well-Log Curves',
                xaxis: { title: 'Value' },
                yaxis: { title: 'Depth (ft)', autorange: 'reversed' },
                hovermode: 'closest',
                height: 600,
                margin: { l: 60, r: 20, t: 40, b: 40 },
              }}
              config={{ responsive: true }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
