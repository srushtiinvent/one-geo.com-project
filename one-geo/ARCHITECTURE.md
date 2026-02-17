# Architecture and Design Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface (React)                    │
│  File Upload | Curve Viewer | AI Interpreter | Chatbot     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
┌────────────────────────▼────────────────────────────────────┐
│                    API Server (Express.js)                   │
│  Upload Routes | Data Routes | Interpretation | Chat        │
└─────┬────────────────┬──────────────┬──────────────┬────────┘
      │                │              │              │
      ▼                ▼              ▼              ▼
  ┌────────┐    ┌──────────────┐  ┌────────┐  ┌──────────┐
  │  LAS   │    │  Database    │  │   AI   │  │ OpenAI  │
  │ Parser │    │   (SQLite)   │  │Service │  │   API   │
  │        │    │              │  │        │  │(Optional)
  └────────┘    └──────────────┘  └────────┘  └──────────┘
```

## Data Flow

### Upload Flow
```
User uploads .las file
    ↓
Express receives multipart form
    ↓
LAS Parser extracts metadata & curves
    ↓
Data stored in SQLite (wells, curves, curveData tables)
    ↓
Raw file saved to uploads directory
    ↓
Response sent to frontend with well ID
```

### Visualization Flow
```
User selects curves & depth range
    ↓
Frontend requests curve data from API
    ↓
Database queries curveData table with depth filter
    ↓
Data returned to frontend
    ↓
Plotly renders interactive chart
```

### Interpretation Flow
```
User selects curves & depth range
    ↓
Frontend sends request to /interpret endpoint
    ↓
Backend fetches all selected curve data
    ↓
AI Service analyzes patterns
    ↓
Interpretation saved to database
    ↓
Result displayed in frontend
```

## Database Schema

### wells table
Stores metadata about each uploaded well:
- `id` - Primary key
- `filename` - Original file name
- `uploadedAt` - Upload timestamp
- `wellName` - Well name from LAS header
- `field` - Field name
- `location` - Geographic location
- `startDepth` - Top of well (feet)
- `stopDepth` - Bottom of well (feet)
- `depthStep` - Measurement interval (feet)
- `rawDataPath` - Path to original LAS file

### curves table
Stores metadata about curves in each well:
- `id` - Primary key
- `wellId` - Foreign key to wells
- `curveName` - Curve mnemonic (e.g., "HC1", "TOTAL_GAS")
- `unit` - Measurement unit
- `description` - Curve description
- `dataPoints` - Number of measurements

### curveData table
Large table storing actual measurement values:
- `id` - Primary key
- `curveId` - Foreign key to curves
- `depthIndex` - Depth value (feet)
- `value` - Measured value

### interpretations table
Stores AI interpretation results:
- `id` - Primary key
- `wellId` - Foreign key to wells
- `depthStart` - Analysis start depth
- `depthStop` - Analysis stop depth
- `curves` - JSON array of curve names used
- `interpretation` - AI-generated text
- `createdAt` - Timestamp

## LAS File Parser

### LAS Format Structure
```
~Version Information Block    ← Defines format version
~Well Information Block       ← Well metadata
~Curve Information Block      ← Curve definitions
~ASCII Data Section          ← Actual measurements
```

### Parser Implementation
The `LASParser` class:
1. Splits file into sections
2. Parses version, well info, and curve metadata
3. Stores measurements efficiently
4. Handles null values as specified in LAS file
5. Provides statistical functions for analysis

### Key Features
- Supports LAS 2.0 format
- Handles multiple curves per depth level
- Filters invalid/null values
- Provides curve statistics (min, max, mean)

## AI Interpretation Service

### Analysis Capabilities
The `AIInterpreter` provides intelligent analysis of well-log data:

1. **Hydrocarbon Analysis**
   - Identifies HC curves (HC1-HC10, TOTAL_GAS, etc.)
   - Calculates average gas content
   - Detects anomalies using standard deviation

2. **Atmospheric Component Detection**
   - Identifies atmospheric gas curves (N2, O2, CO2, etc.)
   - Reports component presence

3. **Aromatic Content Analysis**
   - Identifies aromatic compound curves
   - Indicates potential organic content

4. **Statistical Summaries**
   - Min/max ranges
   - Mean values
   - Data quality metrics

### Extensibility
- Can be extended with real OpenAI API calls
- Machine learning models can be integrated
- Custom domain-specific analysis can be added

## API Design

### REST Endpoints

#### File Management
- `POST /api/upload` - Upload LAS file
- `GET /api/wells` - List all wells
- `GET /api/wells/:wellId` - Get well details

#### Data Access
- `GET /api/wells/:wellId/curves/:curveName/data`
  - Query params: `depthStart`, `depthStop`
  - Returns curve values in depth range

#### Interpretation
- `POST /api/wells/:wellId/interpret`
  - Body: `{ depthStart, depthStop, curves: string[] }`
  - Returns: AI interpretation report

- `GET /api/wells/:wellId/interpretations`
  - Returns: List of past interpretations

#### Chat
- `POST /api/chat`
  - Body: `{ wellId, question }`
  - Returns: Bot response

## Frontend Architecture

### Component Hierarchy
```
App
├── FileUploader
├── WellSelector
└── Main Content (conditional)
    ├── CurveViewer
    │   ├── Controls (depth, curve selection)
    │   └── Plotly Chart
    ├── Interpreter
    │   ├── Input Panel (depth, curves)
    │   └── Result Panel (markdown)
    └── Chatbot
        ├── Message History
        └── Input Textarea
```

### State Management
- React hooks (useState, useEffect)
- No additional state library needed for current scope
- Props-based component communication

### API Communication
- Axios for HTTP requests
- Error handling and loading states
- Promise-based async operations

## Security Considerations

### Current Implementation
1. **Backend-Only Secrets**
   - API keys stored in .env
   - Never sent to frontend
   - Environment variables used

2. **CORS Configuration**
   - Allows frontend to localhost:3000
   - Can be restricted in production

3. **File Validation**
   - Only .LAS files accepted
   - Filename validation
   - File move operations separate from server

### Production Recommendations
1. Add authentication/JWT tokens
2. Implement rate limiting
3. Use HTTPS only
4. Add request validation middleware
5. Implement logging/monitoring
6. Add SQL injection protection (using parameterized queries)
7. Regular security audits

## Performance Considerations

### Optimizations Made
1. **Database Indexing**
   - Foreign key relationships indexed
   - Can add specific indexes on frequently queried columns

2. **Data Fetching**
   - Depth-range queries limit returned data
   - Lazy loading of curves
   - Avoid loading entire datasets

3. **Frontend**
   - Plotly handles large datasets efficiently
   - Checkbox-based curve selection (no re-renders on data)
   - Memo/lazy loading can be added for future scaling

### Scalability Path
1. **SQLite → PostgreSQL** - Better for concurrent access
2. **Add Caching** - Redis for frequently accessed data
3. **Implement Pagination** - For large datasets
4. **API Optimization** - Limit response size, add compression

## Deployment Architecture

### Development
```
Local Machine
├── Backend (npm run dev)
└── Frontend (npm run dev)
```

### Production

#### Option A: Traditional Server
```
AWS EC2 / Digital Ocean
├── Express.js (auto-restart with PM2)
├── PostgreSQL (managed RDS)
├── S3 (file storage)
└── CloudFront (static frontend)
```

#### Option B: Serverless
```
AWS
├── Lambda (API)
├── DynamoDB (data)
├── S3 (files & static)
└── CloudFront (CDN)
```

#### Option C: Container
```
Docker/Kubernetes
├── Backend Container
├── Database Container
└── Reverse Proxy (Nginx)
```

## Testing Strategy

### Backend Testing
- Unit tests for LASParser
- Integration tests for API endpoints
- Database tests for schema/queries

### Frontend Testing
- Component tests for UI elements
- Integration tests for data flow
- E2E tests for user workflows

## Future Enhancements

### Phase 1 (High Priority)
- Real OpenAI API integration
- PostgreSQL migration
- Basic authentication
- Export to PDF

### Phase 2 (Medium Priority)
- Advanced visualization (cross-plots)
- Machine learning correlations
- Multi-well comparison
- Data quality metrics

### Phase 3 (Nice to Have)
- Real-time collaboration
- Mobile app
- Advanced geophysical analysis
- Integration with geology software
