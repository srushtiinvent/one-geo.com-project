# Deployment Guide

This guide provides instructions for deploying the Well-Log Analysis System to production environments.

## Option 1: Local Deployment (Recommended for Initial Testing)

### Prerequisites
- Node.js 16+
- macOS, Linux, or Windows

### Setup

```bash
# 1. Navigate to project directory
cd /path/to/one-geo

# 2. Setup backend
cd backend
npm install
mkdir -p ../data ../uploads

# 3. Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=production
DATABASE_PATH=../data/welllog.db
UPLOAD_DIR=../uploads
# Optional: Add OpenAI API key for real AI features
# OPENAI_API_KEY=sk-xxx
EOF

# 4. Build backend
npm run build

# 5. Setup frontend
cd ../frontend
npm install
npm run build

# 6. Serve frontend (optional, for static hosting)
# Or use the dev server for testing
```

### Running Production Builds

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run preview
# Or serve the dist/ folder with any web server
```

Visit: `http://localhost:3000`

---

## Option 2: Docker Deployment

### Create Docker Compose File

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - NODE_ENV=production
      - DATABASE_PATH=/data/welllog.db
      - UPLOAD_DIR=/data/uploads
    volumes:
      - data:/data
    networks:
      - welllog-net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - welllog-net

volumes:
  data:

networks:
  welllog-net:
    driver: bridge
```

### Create Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 5000

CMD ["npm", "start"]
```

### Create Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Run Docker Compose

```bash
# Build and start containers
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Option 3: AWS Deployment

### Prerequisites
- AWS Account
- AWS CLI configured
- RDS PostgreSQL instance (optional, for scaling)
- S3 bucket for file storage

### Backend Deployment (Elastic Beanstalk)

```bash
cd backend

# Install EB CLI
pip install awsebcli

# Initialize application
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" welllog-api

# Create environment
eb create production

# Deploy
npm run build
eb deploy

# View logs
eb logs
```

### Frontend Deployment (S3 + CloudFront)

```bash
cd frontend

# Build
npm run build

# Create S3 bucket
aws s3 mb s3://welllog-frontend-prod

# Upload build files
aws s3 sync dist/ s3://welllog-frontend-prod

# Create CloudFront distribution (via AWS Console)
# Point to S3 bucket
# Set CNAME to your domain
```

### Environment Variables (Elastic Beanstalk)

```bash
# In .ebextensions/env.config
option_settings:
  aws:elasticbeanstalk:application:environment:
    PORT: 5000
    NODE_ENV: production
    DATABASE_PATH: /data/welllog.db
    UPLOAD_DIR: /data/uploads
```

### Database Migration to RDS

```bash
# Update database.ts to use PostgreSQL
# Install pg driver
npm install pg

# Update connection string in database.ts
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL
})
```

---

## Option 4: Heroku Deployment

### Prerequisites
- Heroku CLI installed
- Heroku account

### Backend Deployment

```bash
# Login to Heroku
heroku login

# Create app
heroku create welllog-api

# Add PostgreSQL (optional)
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set OPENAI_API_KEY=sk-xxx

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Deployment (Vercel/Netlify)

**Netlify:**
```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Vercel:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## Option 5: DigitalOcean App Platform

### Create app.yaml

```yaml
name: welllog-system
region: nyc

services:
- name: backend
  github:
    repo: your-username/welllog-backend
    branch: main
  build_command: npm install && npm run build
  run_command: npm start
  http_port: 5000
  envs:
  - key: NODE_ENV
    value: production
  - key: PORT
    scope: RUN_AND_BUILD_TIME
    value: 5000

- name: frontend
  github:
    repo: your-username/welllog-frontend
    branch: main
  build_command: npm install && npm run build
  source_dir: dist
  http_port: 3000

databases:
- name: postgres
  version: "14"
  engine: PG
```

### Deploy

```bash
# Install DOCTL
brew install doctl

# Authenticate
doctl auth init

# Deploy
doctl apps create --spec app.yaml
```

---

## Security Checklist for Production

- [ ] Environment variables configured securely (.env not in git)
- [ ] Database credentials encrypted
- [ ] HTTPS/SSL enabled
- [ ] CORS configured for specific origin
- [ ] API rate limiting implemented
- [ ] Request validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] File upload validation
- [ ] Sensitive logs redacted
- [ ] Monitoring/alerting configured
- [ ] Backup strategy implemented
- [ ] Regular security patches applied

---

## Performance Optimization

### Backend
```typescript
// Add compression
import compression from 'compression';
app.use(compression());

// Add caching headers
app.use((req, res, next) => {
  res.set('Cache-Control', 'public, max-age=3600');
  next();
});
```

### Database
```sql
-- Add indexes
CREATE INDEX idx_curves_wellId ON curves(wellId);
CREATE INDEX idx_curveData_curveId ON curveData(curveId);
CREATE INDEX idx_curveData_depthIndex ON curveData(depthIndex);
```

### Frontend
```javascript
// Lazy load components
const CurveViewer = lazy(() => import('./components/CurveViewer'));
const Chatbot = lazy(() => import('./components/Chatbot'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <CurveViewer />
</Suspense>
```

---

## Monitoring & Maintenance

### Logging
- Use Winston or Bunyan for structured logging
- Log to CloudWatch, Datadog, or ELK Stack
- Track API response times and errors

### Monitoring
- Set up alerts for high error rates
- Monitor database performance
- Track storage usage
- Monitor API rate limits

### Updates
- Regular npm package updates
- Security patches immediately
- Node.js LTS updates quarterly
- Database backups daily

---

## Scaling Strategy

### Horizontal Scaling
1. Load balancer (AWS ALB, Nginx)
2. Multiple backend instances
3. Shared database (RDS)
4. Shared file storage (S3)

### Vertical Scaling
1. Larger instance types
2. Database optimization (indexes, caching)
3. CDN for static assets
4. Redis for caching

---

## Cost Reduction

- Use managed services (RDS, S3) vs self-managed
- Reserved instances for stable workloads
- Spot instances for batch processing
- Caching to reduce database queries
- CDN to reduce bandwidth costs

---

## Troubleshooting

### Backend won't start
```bash
npm run build
npm start
# Check logs for errors
```

### Database connection issues
```bash
# Verify DATABASE_PATH or DATABASE_URL
# Check file permissions for SQLite
# Verify network access for RDS
```

### Frontend can't reach API
```bash
# Check CORS settings
# Verify API_URL env variable
# Check network tab in browser DevTools
```

### High memory usage
```bash
# Check for memory leaks
# Optimize database queries
# Implement data streaming for large responses
```

---

For questions or issues, refer to the main README.md and ARCHITECTURE.md files.
