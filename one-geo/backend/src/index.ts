import express from 'express';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import dotenv from 'dotenv';
import path from 'path';
import { createUploadRouter } from './routes/uploadRoutes';
import db from './models/database';
import { AIInterpreter } from './services/aiService';
import { log } from 'console';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT;
console.log(PORT);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(express.json());
app.use(fileUpload());


const aiService = new AIInterpreter(process.env.OPENAI_API_KEY || '');

// Routes
app.use('/api', createUploadRouter(db, aiService));
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Well-log API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Upload well data: POST /api/upload`);
  console.log(`📈 Visualize curves: GET /api/wells/:wellId/curves/:curveName/data`);
  console.log(`🤖 AI Interpretation: POST /api/wells/:wellId/interpret`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await db.close();
  process.exit(0);
});
