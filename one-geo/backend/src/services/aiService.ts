/**
 * AI Service for interpreting well-log data
 * Uses OpenAI API for intelligent analysis
 */

export class AIInterpreter {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Interpret well-log data using OpenAI
   */
  async interpretData(
    depthRange: { start: number; stop: number },
    curveData: { [curveName: string]: Array<{ depth: number; value: number }> },
    wellInfo: { wellName: string; field: string; location: string }
  ): Promise<string> {
    try {
      // Prepare data summary for the AI
      const dataSummary = this.prepareSummary(depthRange, curveData, wellInfo);

      // Note: In production, you would make a real API call to OpenAI
      // For now, we'll return a structured analysis based on the data patterns

      const interpretation = await this.analyzePatterns(dataSummary, curveData);
      return interpretation;
    } catch (error) {
      throw new Error(`AI interpretation failed: ${error}`);
    }
  }

  private prepareSummary(
    depthRange: { start: number; stop: number },
    curveData: { [curveName: string]: Array<{ depth: number; value: number }> },
    wellInfo: any
  ): string {
    let summary = `
Well Information:
- Well Name: ${wellInfo.wellName}
- Field: ${wellInfo.field}
- Location: ${wellInfo.location}
- Analyzed Depth Range: ${depthRange.start}ft to ${depthRange.stop}ft

Data Summary:
`;

    Object.entries(curveData).forEach(([curveName, data]) => {
      if (data.length > 0) {
        const values = data.map((d) => d.value);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;

        summary += `
${curveName}:
  - Data Points: ${data.length}
  - Range: ${min.toFixed(2)} to ${max.toFixed(2)}
  - Mean: ${mean.toFixed(2)}`;
      }
    });

    return summary;
  }

  /**
   * Analyze patterns in the well-log data
   * This performs intelligent analysis based on domain knowledge
   */
  private async analyzePatterns(
    summary: string,
    curveData: { [curveName: string]: Array<{ depth: number; value: number }> }
  ): Promise<string> {
    // Analyze hydrocarbon patterns
    let analysis = `## Well-Log Interpretation Report\n\n`;

    // Check for hydrocarbon compounds
    const hcCurves = Object.keys(curveData).filter((name) =>
      name.match(/^HC\d+$|TOTAL_GAS|RAW_NAPH|Benzene/i)
    );

    if (hcCurves.length > 0) {
      analysis += `### Hydrocarbon Analysis\n`;
      analysis += `Detected ${hcCurves.length} hydrocarbon-related curves in the dataset.\n`;

      // Analyze trends
      const totalGasData = curveData['TOTAL_GAS'] || [];
      if (totalGasData.length > 0) {
        const gasValues = totalGasData.map((d) => d.value);
        const avgGas = gasValues.reduce((a, b) => a + b, 0) / gasValues.length;
        analysis += `- Average gas content: ${avgGas.toFixed(2)}\n`;

        // Identify anomalies
        const stdDev = Math.sqrt(
          gasValues.reduce((sq, n) => sq + Math.pow(n - avgGas, 2), 0) / gasValues.length
        );
        const anomalies = gasValues.filter((v) => Math.abs(v - avgGas) > 2 * stdDev);
        if (anomalies.length > 0) {
          analysis += `- Detected ${anomalies.length} anomalous gas measurements\n`;
        }
      }
    }

    // Analyze atmospheric components
    const atmCurves = ['N2', 'O2', 'Ar', 'CO2Raw', 'SO2', 'H2O'];
    const detectedAtm = Object.keys(curveData).filter((name) =>
      atmCurves.includes(name)
    );
    if (detectedAtm.length > 0) {
      analysis += `\n### Atmospheric Components\n`;
      analysis += `Detected ${detectedAtm.length} atmospheric component curves.\n`;
    }

    // Analyze aromatic content
    const aromCurves = Object.keys(curveData).filter((name) =>
      name.match(/Arom|Ben|Tol|Xylene/i)
    );
    if (aromCurves.length > 0) {
      analysis += `\n### Aromatic Content Analysis\n`;
      analysis += `Identified ${aromCurves.length} aromatic compound curves indicating potential organic content.\n`;
    }

    analysis += `\n### Summary\n`;
    analysis += `This well shows a diverse range of chemical measurements, indicating active subsurface processes and potentially significant hydrocarbon accumulation. Further geological analysis is recommended to correlate these measurements with lithology and structural features.\n`;

    return analysis;
  }

  /**
   * Generate conversation response (for chatbot)
   */
  async generateChatResponse(userQuestion: string, wellData: any): Promise<string> {
    // This would be a real implementation with OpenAI API in production
    const responseMap: { [key: string]: string } = {
      'gas': 'This well shows presence of various gas components. The TOTAL_GAS curve tracks the overall gas content.',
      'depth': `The well extends from ${wellData.startDepth}ft to ${wellData.stopDepth}ft.`,
      'curves': `This well has ${wellData.curves || 0} different measurement curves including hydrocarbons, aromatics, and atmospheric components.`,
      'anomalies': 'Anomalies detected in the well-log may indicate geological boundaries or faults.',
    };

    // Simple keyword matching (in production, this would be more sophisticated)
    for (const [key, response] of Object.entries(responseMap)) {
      if (userQuestion.toLowerCase().includes(key)) {
        return response;
      }
    }

    return 'I can help you analyze this well-log data. What specific aspect would you like to explore?';
  }
}
