import sqlite3 from 'sqlite3';
import path from 'path';

class Database {
  private db: sqlite3.Database;

  constructor() {
    const dbPath = path.resolve(__dirname, '../../database.sqlite');

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Database connection failed:', err.message);
      } else {
        console.log('✅ Connected to the SQLite database.');
      }
    });

    this.initialize();
  }

  private initialize() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS wells (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT,
          wellName TEXT,
          field TEXT,
          location TEXT,
          startDepth REAL,
          stopDepth REAL,
          depthStep REAL,
          filepath TEXT,
          uploadedAt TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS curves (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          well_id INTEGER,
          curveName TEXT,
          unit TEXT,
          description TEXT,
          FOREIGN KEY (well_id) REFERENCES wells (id)
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS curve_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          curve_id INTEGER,
          depthIndex INTEGER,
          value REAL,
          FOREIGN KEY (curve_id) REFERENCES curves (id)
        )
      `);
    });
  }

  // -------------------------
  // WELL METHODS
  // -------------------------

  insertWell(well: any, filepath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO wells 
        (filename, wellName, field, location, startDepth, stopDepth, depthStep, filepath, uploadedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(
        query,
        [
          well.filename,
          well.wellName,
          well.field,
          well.location,
          well.startDepth,
          well.stopDepth,
          well.depthStep,
          filepath,
          well.uploadedAt,
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getAllWells(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM wells", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  getWell(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM wells WHERE id = ?", [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  // -------------------------
  // CURVE METHODS
  // -------------------------

  insertCurve(wellId: number, curve: any): Promise<number> {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO curves (well_id, curveName, unit, description)
        VALUES (?, ?, ?, ?)
      `;

      this.db.run(
        query,
        [wellId, curve.curveName, curve.unit, curve.description],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getCurves(wellId: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM curves WHERE well_id = ?",
        [wellId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  insertCurveData(curveId: number, dataPoints: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN TRANSACTION");

        const stmt = this.db.prepare(
          "INSERT INTO curve_data (curve_id, depthIndex, value) VALUES (?, ?, ?)"
        );

        for (const point of dataPoints) {
          stmt.run(curveId, point.depthIndex, point.value);
        }

        stmt.finalize((err) => {
          if (err) {
            reject(err);
            return;
          }

          this.db.run("COMMIT", (commitErr) => {
            if (commitErr) reject(commitErr);
            else resolve();
          });
        });
      });
    });
  }


  getCurveData(curveId: number, start: number, stop: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT depthIndex as depth, value FROM curve_data WHERE curve_id = ?",
        [curveId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close(err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export default new Database();
