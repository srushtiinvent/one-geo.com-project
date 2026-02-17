import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import FileUploader from './components/FileUploader';
import WellSelector from './components/WellSelector';
import CurveViewer from './components/CurveViewer';
import Interpreter from './components/Interpreter';
import Chatbot from './components/Chatbot';

interface Well {
  id: number;
  filename: string;
  wellName: string;
  field: string;
  location: string;
  startDepth: number;
  stopDepth: number;
  depthStep: number;
  curves?: Array<{
    id: number;
    curveName: string;
    unit: string;
    description: string;
    dataPoints: number;
  }>;
}

function App() {
  const [wells, setWells] = useState<Well[]>([]);
  const [selectedWell, setSelectedWell] = useState<Well | null>(null);
  const [activeTab, setActiveTab] = useState('viewer');

  useEffect(() => {
    fetchWells();
  }, []);

  const fetchWells = async () => {
    try {
      const response = await axios.get('/api/wells');
      setWells(response.data);
    } catch (error) {
      console.error('Failed to fetch wells:', error);
    }
  };

  const handleFileUpload = () => {
    fetchWells();
  };

  const handleSelectWell = async (wellId: number) => {
    try {
      const response = await axios.get(`/api/wells/${wellId}`);
      setSelectedWell(response.data);
    } catch (error) {
      console.error('Failed to load well:', error);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>🌍 Well-Log Data Analysis System</h1>
        <p>Upload, visualize, and analyze subsurface well-log measurements</p>
      </header>

      <div className="container">
        <aside className="sidebar">
          <FileUploader onUploadSuccess={handleFileUpload} />

          <section className="well-list">
            <h2>Wells</h2>
            {wells.length === 0 ? (
              <p className="empty-state">No wells uploaded yet</p>
            ) : (
              <WellSelector wells={wells} selectedWell={selectedWell} onSelect={handleSelectWell} />
            )}
          </section>
        </aside>

        <main className="main-content">
          {selectedWell ? (
            <>
              <div className="well-header">
                <h2>{selectedWell.wellName}</h2>
                <p>{selectedWell.field} | {selectedWell.location}</p>
                <p className="depth-info">
                  Depth: {selectedWell.startDepth.toFixed(0)}ft - {selectedWell.stopDepth.toFixed(0)}ft
                </p>
              </div>

              <div className="tabs">
                <button
                  className={`tab ${activeTab === 'viewer' ? 'active' : ''}`}
                  onClick={() => setActiveTab('viewer')}
                >
                  📈 Curve Viewer
                </button>
                <button
                  className={`tab ${activeTab === 'interpreter' ? 'active' : ''}`}
                  onClick={() => setActiveTab('interpreter')}
                >
                  🤖 AI Interpretation
                </button>
                <button
                  className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
                  onClick={() => setActiveTab('chat')}
                >
                  💬 Chatbot
                </button>
              </div>

              <div className="tab-content">
                {activeTab === 'viewer' && <CurveViewer well={selectedWell} />}
                {activeTab === 'interpreter' && <Interpreter well={selectedWell} />}
                {activeTab === 'chat' && <Chatbot well={selectedWell} />}
              </div>
            </>
          ) : (
            <div className="empty-state-main">
              <h2>👋 Welcome to Well-Log Analysis</h2>
              <p>Upload a LAS file to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
