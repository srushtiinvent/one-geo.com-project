# Well-Log Data Analysis System

A comprehensive full-stack application for analyzing subsurface well-log data with AI-assisted interpretation, interactive visualization, and chatbot interface.

## 🏗️ Architecture Overview

### Technology Stack

**Backend:**
- **Framework**: Express.js (Node.js)
- **Language**: TypeScript
- **Database**: SQLite (local storage, upgradeable to PostgreSQL)
- **Parser**: Custom LAS file parser
- **AI**: OpenAI API integration (optional)
- **Port**: 5000

**Frontend:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Visualization**: Plotly.js
- **Styling**: CSS3
- **Port**: 3000

### Key Design Decisions

1. **Database Choice: SQLite**
   - Lightweight and self-contained for local development
   - No external dependencies
   - Can be easily upgraded to PostgreSQL for production
   - Schema includes: wells, curves, curveData, and interpretations tables

2. **LAS Parser**
   - Custom implementation for flexibility
   - Handles LAS 2.0 format
   - Extracts metadata (well info) and curve data
   - Filters null values automatically

3. **API Architecture**
   - RESTful endpoints for file upload, data retrieval, and interpretation
   - Secure: credentials never exposed to client
   - Supports depth-range queries for efficient data loading

4. **File Storage**
   - Local filesystem for development (./uploads directory)
   - Ready for AWS S3 integration in production
   - Original raw files preserved alongside parsed data

## 📋 Features Implemented

### ✅ Core Requirements

1. **Architecture**
   - Proper frontend/backend separation
   - RESTful API communication
   - Sensitive credentials stored in .env (server-side only)

2. **File Ingestion & Storage**
   - Drag-and-drop LAS file upload
   - LAS file parser extracting metadata and curve data
   - SQLite database for structured storage
   - Original files stored locally

3. **Visualization**
   - Interactive Plotly.js-based well-log curves viewer
   - Multi-curve selection and visualization
   - Depth range filtering
   - Zoom and pan support (Plotly built-in)
   - Hover information with depth and values

4. **AI-Assisted Interpretation**
   - Depth-range and curve selection interface
   - Intelligent pattern analysis:
     - Hydrocarbon compound identification
     - Gas content analysis with anomaly detection
     - Atmospheric component detection
     - Aromatic content analysis
   - Interpretation saved to database for history

5. **Chatbot Interface**
   - Conversational interface for well data exploration
   - Question-aware responses about well characteristics
   - Real-time messaging UI

### ✅ Bonus Features

- Chatbot interface (fully implemented)
- Interpretation history tracking
- Multiple well management

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- macOS, Linux, or Windows

### Installation & Setup

1. **Clone or extract the project**
```bash
cd /Users/srushti.invent/Desktop/one-geo
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend
npm install
```

4. **Configure environment variables**
```bash
cd ../backend
cp .env.example .env
# Edit .env if needed (OPENAI_API_KEY is optional)
```

5. **Create data directory**
```bash
mkdir -p ../data
```

### Running Locally

**Terminal 1 - Start Backend Server:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend Development Server:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

Then open your browser to **http://localhost:3000**

## 📊 Using the Application

### Upload Well Data
1. Click the upload area or drag a .LAS file
2. File is parsed and stored in the database
3. Well appears in the sidebar

### Visualize Curves
1. Select a well from the sidebar
2. Go to "📈 Curve Viewer" tab
3. Select curves from the list
4. Adjust depth range and view the plot
5. Hover for detailed values

### AI Interpretation
1. Select a well
2. Go to "🤖 AI Interpretation" tab
3. Choose depth range and curves
4. Click "Run Interpretation"
5. View AI-generated analysis Report

### Chat with Data
1. Select a well
2. Go to "💬 Chatbot" tab
3. Ask questions about the well
4. Get intelligent responses

## 🗂️ Project Structure

```
one-geo/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Main server file
│   │   ├── parsers/
│   │   │   └── lasParser.ts      # LAS file parser
│   │   ├── models/
│   │   │   └── database.ts       # SQLite database service
│   │   ├── services/
│   │   │   └── aiService.ts      # AI interpretation service
│   │   └── routes/
│   │       └── uploadRoutes.ts   # API endpoints
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Main app component
│   │   ├── App.css               # App styles
│   │   ├── index.css             # Global styles
│   │   └── components/
│   │       ├── FileUploader.tsx   # Upload component
│   │       ├── WellSelector.tsx   # Well selection
│   │       ├── CurveViewer.tsx    # Curve visualization
│   │       ├── Interpreter.tsx    # AI interpretation UI
│   │       └── Chatbot.tsx        # Chat interface
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── data/                         # SQLite database (created on first run)
├── uploads/                      # Uploaded LAS files
└── README.md
```

## 🔌 API Endpoints

### POST `/api/upload`
Upload a LAS file
- Body: multipart/form-data (file)
- Returns: well info with curves

### GET `/api/wells`
Get all uploaded wells

### GET `/api/wells/:wellId`
Get specific well with curves

### GET `/api/wells/:wellId/curves/:curveName/data`
Get curve data for depth range
- Query params: depthStart, depthStop

### POST `/api/wells/:wellId/interpret`
Run AI interpretation
- Body: { depthStart, depthStop, curves: string[] }

### GET `/api/wells/:wellId/interpretations`
Get past interpretations for a well

### POST `/api/chat`
Chat with bot about well data
- Body: { wellId, question }

## 💾 Database Schema

### wells
- id, filename, uploadedAt, wellName, field, location, startDepth, stopDepth, depthStep, rawDataPath

### curves
- id, wellId, curveName, unit, description, dataPoints

### curveData
- id, curveId, depthIndex, value

### interpretations
- id, wellId, depthStart, depthStop, curves, interpretation, createdAt

## 🔐 Security Considerations

- **API Keys**: Stored in .env file (server-side only, never exposed to client)
- **No Secrets in Frontend**: All sensitive operations happen on backend
- **CORS**: Configured to allow frontend communication
- **File Validation**: Only .LAS files accepted

## 🚀 Production Deployment Options

### Option 1: AWS Elastic Beanstalk
```bash
# Backend
cd backend
npm run build
eb init
eb create
eb deploy

# Frontend
cd ../frontend
npm run build
# Deploy to S3 + CloudFront
```

### Option 2: Heroku
```bash
# Backend
cd backend
heroku create well-log-api
git push heroku main

# Frontend
cd ../frontend
npm run build
# Deploy to Netlify or Vercel
```

### Option 3: Docker Compose
```dockerfile
# Create docker-compose.yml for local deployment
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
```

## 📝 Future Enhancements

1. **Advanced Features**
   - Real OpenAI GPT-4 integration for interpretations
   - Multiple interpretation methods (spectral analysis, correlation)
   - Export reports as PDF
   - Comparison between multiple wells
   - Data quality metrics

2. **Infrastructure**
   - S3 file storage
   - PostgreSQL for scalability
   - Redis caching
   - Authentication/Authorization
   - Monitoring and logging

3. **UI/UX**
   - Time-series analysis
   - Statistical summaries
   - Cross-plot visualization
   - Log correlation tools
   - Dark mode

## 🧪 Testing the System

You can test with the provided `Well_Data (las).las` file:
1. Open the application at http://localhost:3000
2. Click or drag the `.las` file to upload
3. Select and visualize curves
4. Run interpretations on different depth ranges
5. Chat with the bot about the data

## 📚 References

- LAS Format: https://www.cwls.org/
- Express.js: https://expressjs.com/
- React: https://react.dev/
- Plotly.js: https://plotly.com/javascript/
- SQLite: https://www.sqlite.org/

## 📄 License

MIT License - Feel free to use and modify

---

**Built with ❤️ for subsurface data analysis**
