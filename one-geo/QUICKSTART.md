# Well-Log Analysis System - Quick Setup Guide

## One-Time Setup (5 minutes)

### Backend Setup
```bash
cd backend
npm install
mkdir -p ../data ../uploads
cp .env.example .env
```

### Frontend Setup
```bash
cd ../frontend
npm install
```

## Running the Application

### Start Backend (Terminal 1)
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

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Expected output:
```
  VITE v4.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

Then open **http://localhost:3000** in your browser.

## Features Overview

| Feature | Status | How to Use |
|---------|--------|-----------|
| 📁 Upload LAS Files | ✅ | Drag & drop or click upload area |
| 📈 Curve Visualization | ✅ | Select "Curve Viewer" → Choose curves → Adjust depth |
| 🤖 AI Interpretation | ✅ | Select "AI Interpretation" → Pick curves → Run |
| 💬 Chatbot | ✅ | Select "Chatbot" → Ask questions |
| 💾 Data Storage | ✅ | SQLite (in ./data/welllog.db) |
| 📊 Multiple Wells | ✅ | Upload multiple .las files |

## Test Data

Use the provided `Well_Data (las).las` file to test:
1. Drag it to the upload area
2. It will be parsed and show curves like HC1-HC10, TOTAL_GAS, etc.
3. Try visualizing different curves
4. Run interpretations on depth ranges
5. Ask the chatbot questions

## Troubleshooting

**Port 5000/3000 already in use?**
```bash
# Change in backend - edit backend/src/index.ts
# Or kill the process:
lsof -i :5000  # Find process
kill -9 <PID>
```

**Module not found errors?**
```bash
cd backend && npm install
cd ../frontend && npm install
```

**Database issues?**
```bash
rm -rf data/  # Delete and recreate on next run
```

## Project Structure

- `/backend` - Express.js API server
- `/frontend` - React web UI
- `/data` - SQLite database (created automatically)
- `/uploads` - Uploaded LAS files

## APIs Available

```
POST   /api/upload                          - Upload LAS file
GET    /api/wells                           - List all wells
GET    /api/wells/:wellId                   - Get well details
GET    /api/wells/:wellId/curves/:curve     - Get curve data
POST   /api/wells/:wellId/interpret         - Run AI analysis
GET    /api/wells/:wellId/interpretations   - Get past analyses
POST   /api/chat                            - Chat with bot
```

## Next Steps (Optional)

1. **Add Real AI Integration** - Sign up for OpenAI API and add key to `.env`
2. **Deploy to Cloud** - Use Heroku, AWS, or Vercel
3. **Add Authentication** - Implement user login
4. **Use PostgreSQL** - Upgrade from SQLite for production

Happy analyzing! 🌍⛺📊
