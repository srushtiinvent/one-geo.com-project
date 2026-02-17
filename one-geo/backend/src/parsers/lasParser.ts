/**
 * LAS File Parser
 * Parses LAS (Log ASCII Standard) format files
 * Structure: Version Header -> Well Info -> Curve Info -> ASCII Data
 */

export interface LASHeader {
  version: string;
  wrap: string;
}

export interface LASWellInfo {
  strt: number; // Start depth
  stop: number; // Stop depth
  step: number; // Depth step
  null: number; // Null value indicator
  [key: string]: any;
}

export interface LASCurve {
  mnem: string; // Curve mnemonic
  unit: string;
  apiCode: string;
  description: string;
}

export interface LASData {
  header: LASHeader;
  wellInfo: LASWellInfo;
  curves: LASCurve[];
  data: { [key: string]: number[] }; // depth -> array of values
}

export class LASParser {
  /**
   * Parse a LAS file content
   */
  static parse(content: string): LASData {
    const lines = content.split('\n');
    
    let currentSection = '';
    const data: LASData = {
      header: { version: '', wrap: '' },
      wellInfo: {
        strt: 0,
        stop: 0,
        step: 0,
        null: -9999,
      },
      curves: [],
      data: {},
    };

    let dataStartIdx = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      // Section headers
      if (line.startsWith('~Version')) {
        currentSection = 'version';
        continue;
      }
      if (line.startsWith('~Well')) {
        currentSection = 'well';
        continue;
      }
      if (line.startsWith('~Curve')) {
        currentSection = 'curve';
        continue;
      }
      if (line.startsWith('~ASCII') || line.startsWith('~A')) {
        currentSection = 'ascii';
        dataStartIdx = i + 1;
        continue;
      }

      // Parse sections
      if (currentSection === 'version') {
        this.parseVersionLine(line, data.header);
      } else if (currentSection === 'well') {
        this.parseWellLine(line, data.wellInfo);
      } else if (currentSection === 'curve') {
        const curve = this.parseCurveLine(line);
        if (curve) data.curves.push(curve);
      }
    }

    // Parse ASCII data section
    if (dataStartIdx > 0) {
      this.parseASCIIData(
        lines.slice(dataStartIdx),
        data.curves,
        data.data,
        data.wellInfo.null
      );
    }

    return data;
  }

  private static parseVersionLine(line: string, header: LASHeader): void {
    const match = line.match(/^VERS\.?\s+(.+?):/);
    if (match) {
      header.version = match[1].trim();
    }
    if (line.includes('WRAP')) {
      const match = line.match(/WRAP\.?\s+(\w+)/);
      if (match) header.wrap = match[1];
    }
  }

  private static parseWellLine(line: string, wellInfo: any): void {
    const match = line.match(/^(\w+)\.?\s+([^:]*?):\s*(.*)/);
    if (match) {
      const [, key, value, description] = match;
      const keyLower = key.toLowerCase();

      if (keyLower === 'strt') {
        wellInfo.strt = parseFloat(value);
      } else if (keyLower === 'stop') {
        wellInfo.stop = parseFloat(value);
      } else if (keyLower === 'step') {
        wellInfo.step = parseFloat(value);
      } else if (keyLower === 'null') {
        wellInfo.null = parseFloat(value);
      } else {
        wellInfo[keyLower] = value.trim();
      }
    }
  }

  private static parseCurveLine(line: string): LASCurve | null {
    const match = line.match(/^(\w+)\s+\.(\w+)\s+(.+?):\s*(.*)/);
    if (match) {
      const [, mnem, unit, apiCode, description] = match;
      return {
        mnem: mnem.trim(),
        unit: unit.trim(),
        apiCode: apiCode.trim(),
        description: description.trim(),
      };
    }
    return null;
  }

  private static parseASCIIData(
    lines: string[],
    curves: LASCurve[],
    dataObj: { [key: string]: number[] },
    nullValue: number
  ): void {
    // Initialize arrays for each curve
    curves.forEach((curve) => {
      dataObj[curve.mnem] = [];
    });

    // Parse each data line
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const values = trimmed.split(/\s+/).map((v) => parseFloat(v));

      // Assign values to curves
      for (let i = 0; i < Math.min(values.length, curves.length); i++) {
        // Only store non-null values
        if (values[i] !== nullValue) {
          dataObj[curves[i].mnem].push(values[i]);
        }
      }
    }
  }

  /**
   * Get statistics for a curve
   */
  static getCurveStats(values: number[]): {
    min: number;
    max: number;
    mean: number;
    count: number;
  } {
    if (values.length === 0) {
      return { min: 0, max: 0, mean: 0, count: 0 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;

    return { min, max, mean, count: values.length };
  }
}
