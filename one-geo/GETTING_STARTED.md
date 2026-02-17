# Well-Log Analysis System - Getting Started Guide

This guide will walk you through setting up and running the complete system step-by-step.

## Prerequisites Check

Before starting, make sure you have:
- Node.js 16+ installed (check: `node --version`)
- npm (comes with Node.js)
- Terminal/Command Prompt
- The LAS file in the project directory

## Part 1: Backend Setup (5 minutes)

### Step 1.1: Install Backend Dependencies

```bash
cd backend
npm install
```

**What it does:** Downloads all required packages (Express, TypeScript, SQLite, CORS, etc.)

Expected output:
```
added XXX packages in X.XXs
```

### Step 1.2: Configure Environment

```bash
# macOS/Linux
cp .env.example .env

# Or manually create .env with:
cat > .env << 'EOF'
PORT=5000
OPENAI_API_KEY=your_api_key_here
NODE_ENV=development
DATABASE_PATH=../data/welllog.db
UPLOAD_DIR=../uploads
EOF
```

### Step 1.3: Create Data Directories

```bash
# Create directories for database and uploads
mkdir -p ../data ../uploads
```

### Step 1.4: Verify Backend Setup

```bash
# Check TypeScript compilation
npm run build

# You should see no errors and a dist/ folder created
```

## Part 2: Frontend Setup (5 minutes)

### Step 2.1: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**What it does:** Installs React, Vite, Plotly, Axios, and dependencies

Expected output:
```
added XXX packages in X.XXs
```

## Part 3: Running the System

### Option A: Development Mode (Recommended for Testing)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server running on http://localhost:5000
📊 Upload well data: POST /api/upload
📈 Visualize curves: GET /api/wells/:wellId/curves/:curveName/data
🤖 AI Interpretation: POST /api/wells/:wellId/interpret
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in 123 ms

  ➜  Local:   http://localhost:3000/
  ➜  Press h to show help
```

### Option B: Production Build

```bash
# Build backend
cd backend
npm run build   # Creates dist/ folder

# Build frontend
cd ../frontend
npm run build   # Creates dist/ folder

# Run production backend
npm start

# Serve frontend (from dist folder with any server)
# Or: npm run preview
```

## Part 4: First Test

### 4.1: Open Application
Open your browser to: **http://localhost:3000**

You should see:
- Purple gradient header "🌍 Well-Log Data Analysis System"
- Upload area on left sidebar
- Empty well list
- Welcome message in main area

### 4.2: Upload Test Data

1. **Drag and Drop Method:**
   - Find and drag `Well_Data (las).las` to the upload area
   - Drop it on "Drop your .LAS file here"

2. **Click Method:**
   - Click the drop zone
   - Navigate to `Well_Data (las).las`
   - Select it

3. **Expected Result:**
   - Upload animation appears
   - Success message: "✓ Well "WELL1" imported successfully"
   - "WELL1" appears in the sidebar

### 4.3: Test Curve Viewer

1. Click on "WELL1" in the sidebar
2. Click the "📈 Curve Viewer" tab
3. You should see control panel on left with all curves listed:
   - HC1 through HC10
   - TOTAL_GAS
   - RAW_NAPH
   - Aromatic compounds
   - And many more...

4. **Select Curves:**
   - Check "HC1"
   - Check "TOTAL_GAS"
   - Check "N2"

5. **View Chart:**
   - A plotly chart appears showing well-log plots
   - X-axis: Values
   - Y-axis: Depth (reversed, deepest at bottom)
   - Curves are color-coded

6. **Test Interactivity:**
   - Hover over lines to see exact values
   - Zoom using mouse wheel
   - Pan by dragging
   - Double-click to reset view

### 4.4: Test AI Interpretation

1. Select "🤖 AI Interpretation" tab
2. You should see:
   - Depth range inputs (default: 8665 to 20035)
   - List of all curves

3. **Run Analysis:**
   - Change depth start to 8665
   - Change depth stop to 10000
   - Select: HC1, TOTAL_GAS, N2
   - Click "🔍 Run Interpretation"

4. **See Results:**
   Wait 1-2 seconds, then you'll see:
   - "## Well-Log Interpretation Report"
   - "### Hydrocarbon Analysis"
   - "### Atmospheric Components"
   - Analysis with statistics

### 4.5: Test Chatbot

1. Select "💬 Chatbot" tab
2. You should see conversation with bot greeting
3. **Ask Questions:**
   - "What is the total gas?"
   - "Tell me about the well depth"
   - "What curves are available?"

4. You'll get contextual responses

## Part 5: Understanding the Data Flow

### Upload Process
```
Your Computer
    ↓
Browser (React)
    ↓
Express Server
    ↓
LAS Parser → SQLite Database
    ↓
Files saved to disk
    ↓
Response: "Well imported!"
```

### Visualization Process
```
"Curve Viewer" tab
    ↓
Select curves
    ↓
Hit API: /api/wells/1/curves/HC1/data
    ↓
Database query
    ↓
Data → Frontend → Plotly renders chart
```

### Interpretation Process
```
Select depth + curves
    ↓
Click "Run Interpretation"
    ↓
Send to /api/wells/1/interpret
    ↓
AI analysis (pattern detection)
    ↓
Results saved to DB
    ↓
Display in UI
```

## Part 6: Troubleshooting

### Problem: "Port 5000 already in use"
```bash
# Find what's using it
lsof -i :5000

# Kill the process  
kill -9 <PID>

# Or use different port - edit backend/src/index.ts
```

### Problem: "Cannot find module"
```bash
# Reinstall dependencies
cd backend
rm -rf node_modules package-lock.json
npm install

cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Problem: "Database errors"
```bash
# Reset database (will lose uploaded wells)
rm -rf data/
# Database recreates on next run
```

### Problem: Frontend won't load data
```bash
# Check if backend is running (Terminal 1)
curl http://localhost:5000/health

# Should return: {"status":"ok","message":"Well-log API is running"}
```

### Problem: "ENOENT: no such file or directory"
```bash
# Create missing directories
mkdir -p data uploads
```

## Part 7: Testing Different Scenarios

### Scenario 1: Multiple Wells
```
1. Upload Well_Data (las).las
2. Rename file locally to something else (well2.las)
3. Upload again
4. Now you have 2 wells in sidebar
5. Switch between them
6. Curves may be different per well
```

### Scenario 2: Depth Range Testing
```
Curve Viewer → Adjust depth start/stop → Chart updates
Try:
  - 8665 to 9000 (shallow)
  - 15000 to 20035 (deep)
  - 12000 to 12500 (narrow range)
```

### Scenario 3: Performance Testing
```
Select ALL curves at once
Watch performance
Plotly can handle 50+ curves
Pan/zoom still smooth
```

### Scenario 4: Data Export Simulation
```
Right-click on chart area
→ "Download plot as PNG"
Save well-log visualization image
```

## Part 8: Code Investigation (Optional)

If you want to understand the code:

### Backend Flow
```
backend/src/index.ts           ← Main entry point
  ├─ ./routes/uploadRoutes.ts  ← API handlers
  │   ├─ Uses ./models/database.ts  ← Data storage
  │   └─ Uses ./services/aiService.ts  ← AI logic
  └─ Uses ./parsers/lasParser.ts  ← File parsing
```

### Frontend Flow
```
frontend/src/main.tsx          ← React entry
  └─ App.tsx                   ← Main component
      ├─ FileUploader.tsx      ← Upload logic
      ├─ WellSelector.tsx      ← Well list
      ├─ CurveViewer.tsx       ← Visualization
      ├─ Interpreter.tsx       ← AI UI
      └─ Chatbot.tsx           ← Chat UI
```

### Database Structure
```
SQLite Database (data/welllog.db)
  ├─ wells           (well metadata)
  ├─ curves          (curve definitions)
  ├─ curveData       (actual values)
  └─ interpretations (AI results)
```

## Part 9: Next Steps

### For Development
1. **Add Features:**
   - Modify components in `frontend/src/components/`
   - Add API endpoints in `backend/src/routes/`
   - Both use hot-reload (npm run dev)

2. **Integrate OpenAI:**
   - Get API key from openai.com
   - Add to `.env` file
   - Update `aiService.ts` to use real API

3. **Scale Up:**
   - Switch to PostgreSQL
   - Add user authentication
   - Deploy to AWS/Heroku

### For Production
1. Follow DEPLOYMENT.md guide
2. Set up monitoring
3. Configure SSL/HTTPS
4. Set up backups

## Part 10: Verification Checklist

After setup, verify everything works:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] http://localhost:3000 loads
- [ ] Can upload LAS file
- [ ] Well appears in sidebar
- [ ] Curve Viewer shows chart
- [ ] Can select multiple curves
- [ ] Chart updates on depth range change
- [ ] AI Interpretation produces output
- [ ] Chatbot responds to questions
- [ ] No console errors (check DevTools)
- [ ] Network requests show 200 status

If all ✓, you're ready to go!

## Part 11: Tips & Tricks

### Speed Up Development
```bash
# Terminal 1 (Backend)
npm run watch    # Auto-compile TypeScript

# Terminal 2 (Frontend)
npm run dev      # Auto-reload changes

# Just save and see changes instantly
```

### Database Inspection
```bash
# If you have sqlite3 installed
sqlite3 data/welllog.db

# View tables
.tables

# Query data
SELECT * FROM wells;
```

### Clear Cache
```bash
# Frontend
cd frontend
rm -rf node_modules/.vite

# Or just reload page: Cmd+Shift+R (macOS)
```

### Monitor Network
```
In browser DevTools:
1. Open Network tab
2. Upload a file
3. Watch requests/responses
4. Check response sizes and times
```

## Getting Help

If something doesn't work:

1. **Check the logs:**
   - Terminal where backend is running
   - Browser console (F12 → Console tab)
   - Browser Network tab

2. **Read the documentation:**
   - README.md - Full overview
   - ARCHITECTURE.md - Technical details
   - DEPLOYMENT.md - Production setup

3. **Common solutions:**
   - Restart both servers
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Check Node.js version: `node --version`

---

**Congratulations! You now have a fully functional well-log analysis system running locally.** 🎉

Ready to explore subsurface data with AI-assisted insights!
