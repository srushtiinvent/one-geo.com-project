import express, { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { LASParser } from '../parsers/lasParser';
import Database from '../models/database';
import { AIInterpreter } from '../services/aiService';

interface CurveRecord {
  id: number;
  well_id: number;
  curve_name: string;
  curveName?: string;
  unit: string;
  description?: string;
}

export function createUploadRouter(db: any, aiService: AIInterpreter): Router {
  const router = express.Router();
  const uploadDir = process.env.UPLOAD_DIR || './uploads';

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  /**
   * Upload a LAS file
   */
  router.post('/upload', async (req: Request, res: Response) => {
    try {
      if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.files.file as any;
      const filename = `${Date.now()}-${file.name}`;
      const filepath = path.join(uploadDir, filename);

      // Save file
      await file.mv(filepath);

      // Parse LAS file
      const content = fs.readFileSync(filepath, 'utf-8');
      const lasData = LASParser.parse(content);

      // Extract well information
      const wellRecord = {
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        wellName: lasData.wellInfo.well || 'Unknown',
        field: lasData.wellInfo.fld || 'Unknown',
        location: lasData.wellInfo.loc || 'Unknown',
        startDepth: lasData.wellInfo.strt,
        stopDepth: lasData.wellInfo.stop,
        depthStep: lasData.wellInfo.step,
      };

      // Save to database
      const wellId = await db.insertWell(wellRecord, filepath);

      // Store curve metadata
      const curveIds: { [key: string]: number } = {};
      for (const curve of lasData.curves) {
        const values = lasData.data[curve.mnem] || [];
        const curveId = await db.insertCurve(wellId, {
          curveName: curve.mnem,
          unit: curve.unit,
          description: curve.description,
          dataPoints: values.length,
        });
        curveIds[curve.mnem] = curveId;

        // Store curve data
        const dataPoints = values.map((value, index) => ({
          depthIndex: index,
          value,
        }));
        await db.insertCurveData(curveId, dataPoints);
      }

      res.json({
        success: true,
        wellId,
        message: `Well "${wellRecord.wellName}" imported successfully`,
        wellInfo: {
          id: wellId,
          ...wellRecord,
          curveCount: lasData.curves.length,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: `Upload failed: ${error}` });
    }
  });

  /**
   * Get all wells
   */
  router.get('/wells', async (req, res) => {
    try {
      console.log("GET /wells hit");

      const wells = await db.getAllWells();

      console.log("Wells fetched:", wells);

      res.json(wells);
    } catch (error) {
      console.error("WELLS ERROR:", error);
      res.status(500).json({ error: `Failed to retrieve wells: ${error}` });
    }
  });

  /**
   * Get a specific well
   */
  router.get('/wells/:wellId', async (req: Request, res: Response) => {
    try {
      const well = await db.getWell(parseInt(req.params.wellId));
      if (!well) {
        return res.status(404).json({ error: 'Well not found' });
      }

      const curves = await db.getCurves(well.id);
      res.json({ ...well, curves });
    } catch (error) {
      res.status(500).json({ error: `Failed to retrieve well: ${error}` });
    }
  });

  /**
   * Get curve data for visualization
   */
  router.get('/wells/:wellId/curves/:curveName/data', async (req: Request, res: Response) => {
    try {
      const { wellId, curveName } = req.params;
      const { depthStart, depthStop } = req.query;

      const well = await db.getWell(parseInt(wellId));
      if (!well) return res.status(404).json({ error: 'Well not found' });

      const curvesList = await db.getCurves(parseInt(wellId)) as CurveRecord[];
      const curve = curvesList.find((c) => c.curveName === curveName || c.curve_name === curveName);
      if (!curve) return res.status(404).json({ error: 'Curve not found' });

      const startDepth = depthStart ? parseFloat(depthStart as string) : well.startDepth;
      const stopDepth = depthStop ? parseFloat(depthStop as string) : well.stopDepth;

      const data = await db.getCurveData(curve.id, startDepth, stopDepth);

      res.json({
        curveName,
        unit: curve.unit,
        description: curve.description,
        data,
      });
    } catch (error) {
      res.status(500).json({ error: `Failed to retrieve curve data: ${error}` });
    }
  });

  /**
   * AI Interpretation
   */
  router.post('/wells/:wellId/interpret', async (req: Request, res: Response) => {
    try {
      const { wellId } = req.params;
      const { depthStart, depthStop, curves } = req.body;

      if (!depthStart || !depthStop || !curves || curves.length === 0) {
        return res.status(400).json({
          error: 'Missing required fields: depthStart, depthStop, curves',
        });
      }

      const well = await db.getWell(parseInt(wellId));
      if (!well) return res.status(404).json({ error: 'Well not found' });

      // Fetch all selected curve data
      const curveData: { [key: string]: Array<{ depth: number; value: number }> } = {};

      // OPTIMIZATION: Fetch all curves once instead of inside the loop
      const allCurvesFromDb = await db.getCurves(parseInt(wellId)) as CurveRecord[];

      for (const curveName of curves) {
        const curveInfo = allCurvesFromDb.find((c) => c.curveName === curveName || c.curve_name === curveName);
        if (curveInfo) {
          curveData[curveName] = await db.getCurveData(
            curveInfo.id,
            depthStart,
            depthStop
          );
        }
      }

      // Get AI interpretation
      const interpretation = await aiService.interpretData(
        { start: depthStart, stop: depthStop },
        curveData,
        {
          wellName: well.wellName,
          field: well.field,
          location: well.location,
        }
      );

      // Save interpretation
      const interpId = await db.saveInterpretation(
        parseInt(wellId),
        depthStart,
        depthStop,
        curves,
        interpretation
      );

      res.json({
        success: true,
        interpretationId: interpId,
        interpretation,
      });
    } catch (error) {
      console.error('Interpretation error:', error);
      res.status(500).json({ error: `Interpretation failed: ${error}` });
    }
  });

  /**
   * Get past interpretations
   */
  router.get('/wells/:wellId/interpretations', async (req: Request, res: Response) => {
    try {
      const interpretations = await db.getInterpretations(
        parseInt(req.params.wellId)
      );
      res.json(interpretations);
    } catch (error) {
      res.status(500).json({ error: `Failed to retrieve interpretations: ${error}` });
    }
  });

  /**
   * Chatbot endpoint
   */
  router.post('/chat', async (req: Request, res: Response) => {
    try {
      const { wellId, question } = req.body;

      if (!wellId || !question) {
        return res
          .status(400)
          .json({ error: 'Missing required fields: wellId, question' });
      }

      const well = await db.getWell(parseInt(wellId));
      if (!well) return res.status(404).json({ error: 'Well not found' });

      const response = await aiService.generateChatResponse(question, well);

      res.json({ response });
    } catch (error) {
      res.status(500).json({ error: `Chat failed: ${error}` });
    }
  });

  return router;
}