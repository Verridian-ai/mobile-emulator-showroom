# Deployment Guide - Mobile Emulator Platform

This guide covers deployment options for the Mobile Emulator Platform across development, staging, and production environments.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Production Deployment](#production-deployment)
5. [Security Checklist](#security-checklist)
6. [Troubleshooting](#troubleshooting)

---

## Environment Configuration

The platform uses environment variables for configuration. Three example files are provided:

- `.env.development.example` - Local development settings
- `.env.staging.example` - Staging environment settings
- `.env.production.example` - Production environment settings

### Creating Your Environment File

**Development:**
```bash
cp .env.development.example .env
# Edit .env with your local settings
npm start
```

**Staging:**
```bash
cp .env.staging.example .env
# IMPORTANT: Update SESSION_SECRET and CORS_ALLOWED_ORIGINS
npm start
```

**Production:**
```bash
cp .env.production.example .env
# CRITICAL: Update all secrets (see Security Checklist below)
npm start
```

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `development`, `staging`, `production` |
| `PORT` | Yes | Server port | `4175` |
| `HOST` | No | Server host | `0.0.0.0` (default) |
| `SESSION_SECRET` | Production only | Secret for session security | Generate with crypto (see below) |
| `CORS_ALLOWED_ORIGINS` | No | Comma-separated allowed origins | `https://example.com,https://www.example.com` |
| `ENABLE_DEBUG_MODE` | No | Enable debug logging | `true` or `false` |
| `ENABLE_ANALYTICS` | No | Enable analytics features | `true` or `false` |
| `LOG_LEVEL` | No | Logging level | `debug`, `info`, `warn`, `error` |
| `PUBLIC_DIR` | No | Static files directory | `public` (default) |

### Generating Secure Secrets

For `SESSION_SECRET`, generate a cryptographically secure random string:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

---

## Local Development

### Prerequisites

- Node.js 20 or higher
- npm 9 or higher

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd mobile-emulator-platform

# Install dependencies
npm install

# Create environment file
cp .env.development.example .env

# Start development server
npm start
```

Server will be available at `http://localhost:4175`

### Health Check

Verify server is running:

```bash
curl http://localhost:4175/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": 1234567890,
  "environment": "development",
  "publicDir": true,
  "files": 10
}
```

---

## Docker Deployment

### Prerequisites

- Docker 24+ installed
- Docker Compose 2+ (optional, for docker-compose workflow)

### Building Docker Image

```bash
# Build image
docker build -t mobile-emulator:latest .

# Check image size (target: < 200MB)
docker images mobile-emulator:latest
```

### Running Docker Container

**Option 1: Docker run**

```bash
# Create .env file first
cp .env.production.example .env
# Edit .env with production settings

# Run container
docker run -d \
  --name mobile-emulator \
  -p 4175:4175 \
  --env-file .env \
  mobile-emulator:latest

# View logs
docker logs -f mobile-emulator

# Stop container
docker stop mobile-emulator
docker rm mobile-emulator
```

**Option 2: Docker Compose**

```bash
# Create .env file
cp .env.production.example .env
# Edit .env with production settings

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Docker Image Details

- **Base Image:** `node:20-alpine` (minimal Alpine Linux)
- **Multi-stage build:** Separates build and runtime stages
- **Current Size:** ~584MB (includes unoptimized assets)
- **Target Size:** < 200MB (after asset optimization in Tasks 1.1-1.3)
- **User:** Runs as non-root user `nodejs` (UID 1001)
- **Health Check:** Built-in health check on `/health` endpoint
- **Exposed Port:** 4175

**Note on Image Size:**
The current Docker image exceeds the 200MB target because it includes large unoptimized assets in the `public/` directory (~95MB). Once image optimization tasks (Tasks 1.1-1.3) are completed, the image size will be reduced to meet the target. The Docker infrastructure itself is optimized using Alpine Linux and multi-stage builds.

### Docker Environment Variables

Pass environment variables via:

1. **--env-file** (recommended):
   ```bash
   docker run --env-file .env mobile-emulator:latest
   ```

2. **-e flags**:
   ```bash
   docker run \
     -e NODE_ENV=production \
     -e PORT=4175 \
     -e SESSION_SECRET=your-secret \
     mobile-emulator:latest
   ```

3. **docker-compose.yml** (already configured):
   ```yaml
   services:
     mobile-emulator:
       env_file:
         - .env
   ```

---

## Production Deployment

### Deployment Checklist

Before deploying to production:

- [ ] Update `NODE_ENV=production` in `.env`
- [ ] Generate and set secure `SESSION_SECRET`
- [ ] Configure `CORS_ALLOWED_ORIGINS` with actual domains
- [ ] Set `ENABLE_DEBUG_MODE=false`
- [ ] Set `LOG_LEVEL=warn` or `error`
- [ ] Review all environment variables
- [ ] Test Docker build locally
- [ ] Verify health check endpoint
- [ ] Configure HTTPS/TLS (use reverse proxy)
- [ ] Set up monitoring and logging

### Cloud Deployment Options

#### Docker-Based Platforms

**AWS ECS/Fargate:**
```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag mobile-emulator:latest <account>.dkr.ecr.us-east-1.amazonaws.com/mobile-emulator:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/mobile-emulator:latest

# Deploy via ECS task definition
```

**Google Cloud Run:**
```bash
# Build and push
gcloud builds submit --tag gcr.io/<project-id>/mobile-emulator

# Deploy
gcloud run deploy mobile-emulator \
  --image gcr.io/<project-id>/mobile-emulator \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Azure Container Instances:**
```bash
# Push to ACR
az acr build --registry <registry-name> --image mobile-emulator:latest .

# Deploy
az container create \
  --resource-group myResourceGroup \
  --name mobile-emulator \
  --image <registry-name>.azurecr.io/mobile-emulator:latest \
  --dns-name-label mobile-emulator \
  --ports 4175
```

#### Kubernetes

Example deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mobile-emulator
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mobile-emulator
  template:
    metadata:
      labels:
        app: mobile-emulator
    spec:
      containers:
      - name: mobile-emulator
        image: mobile-emulator:latest
        ports:
        - containerPort: 4175
        env:
        - name: NODE_ENV
          value: "production"
        - name: SESSION_SECRET
          valueFrom:
            secretKeyRef:
              name: mobile-emulator-secrets
              key: session-secret
        livenessProbe:
          httpGet:
            path: /health
            port: 4175
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 4175
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: mobile-emulator
spec:
  selector:
    app: mobile-emulator
  ports:
  - port: 80
    targetPort: 4175
  type: LoadBalancer
```

### Reverse Proxy Configuration

#### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name mobile-emulator.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4175;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://localhost:4175/health;
        access_log off;
    }
}
```

#### Caddy

```caddy
mobile-emulator.example.com {
    reverse_proxy localhost:4175
}
```

---

## Security Checklist

### Pre-Production Security Review

- [ ] **Secrets Management**
  - [ ] `SESSION_SECRET` is cryptographically random (32+ bytes)
  - [ ] No secrets hardcoded in source code
  - [ ] `.env` file excluded from version control
  - [ ] Secrets stored in secure vault (AWS Secrets Manager, etc.)

- [ ] **CORS Configuration**
  - [ ] `CORS_ALLOWED_ORIGINS` set to specific domains
  - [ ] No wildcard (`*`) in production
  - [ ] Verified against actual frontend domains

- [ ] **Debug Features**
  - [ ] `ENABLE_DEBUG_MODE=false`
  - [ ] `LOG_LEVEL` set to `warn` or `error`
  - [ ] No sensitive data in logs

- [ ] **Docker Security**
  - [ ] Running as non-root user
  - [ ] Base image up to date
  - [ ] No unnecessary files in image (check `.dockerignore`)
  - [ ] Image scanned for vulnerabilities

- [ ] **Network Security**
  - [ ] HTTPS/TLS enabled (via reverse proxy)
  - [ ] HTTP redirects to HTTPS
  - [ ] Firewall rules configured
  - [ ] Only necessary ports exposed

- [ ] **Monitoring**
  - [ ] Health check endpoint monitored
  - [ ] Error logs aggregated
  - [ ] Alerts configured for downtime
  - [ ] Security events logged

---

## Troubleshooting

### Server Won't Start

**Error: "Missing required environment variables"**

```bash
# Check .env file exists
ls -la .env

# Verify required variables set
cat .env | grep NODE_ENV
cat .env | grep PORT

# For production, verify SESSION_SECRET
cat .env | grep SESSION_SECRET
```

**Error: "Port already in use"**

```bash
# Find process using port 4175
netstat -ano | findstr :4175  # Windows
lsof -i :4175                 # Linux/Mac

# Kill process or change PORT in .env
```

### Docker Build Fails

**Error: "Cannot find module"**

```bash
# Ensure package.json exists
ls -la package.json

# Rebuild with no cache
docker build --no-cache -t mobile-emulator:latest .
```

**Image size > 200MB**

```bash
# Check what's being copied
docker history mobile-emulator:latest

# Verify .dockerignore is correct
cat .dockerignore

# Check for large files in node_modules
du -sh node_modules
```

### Container Health Check Failing

```bash
# Check container logs
docker logs mobile-emulator

# Manually test health endpoint from inside container
docker exec mobile-emulator curl http://localhost:4175/health

# Check if public directory mounted correctly
docker exec mobile-emulator ls -la /app/public
```

### CORS Errors in Browser

**Error: "Access-Control-Allow-Origin"**

```bash
# Check CORS_ALLOWED_ORIGINS in .env
cat .env | grep CORS_ALLOWED_ORIGINS

# Verify frontend origin matches
# If frontend is https://example.com, .env should include:
CORS_ALLOWED_ORIGINS=https://example.com

# Restart server after .env changes
docker-compose restart
```

### 404 Not Found Errors

```bash
# Check if public directory exists
docker exec mobile-emulator ls -la /app/public

# Verify file exists
docker exec mobile-emulator ls -la /app/public/index.html

# Check server logs
docker logs mobile-emulator | grep "File not found"
```

---

## Performance Monitoring

### Key Metrics to Track

1. **Response Time**: `/health` endpoint should respond < 100ms
2. **Uptime**: Server uptime via `/health` response
3. **Memory Usage**: Container memory consumption
4. **CPU Usage**: Container CPU utilization
5. **Error Rate**: 5xx errors in logs

### Health Check Response

```json
{
  "status": "healthy",
  "uptime": 3600.5,        // Seconds since start
  "timestamp": 1640000000,  // Unix timestamp
  "environment": "production",
  "publicDir": true,        // Public directory exists
  "files": 15               // Number of files in public/
}
```

### Monitoring Tools

- **Docker**: `docker stats mobile-emulator`
- **Kubernetes**: `kubectl top pod mobile-emulator-xxx`
- **Cloud**: Platform-specific monitoring (CloudWatch, Stackdriver, etc.)
- **APM**: New Relic, Datadog, Prometheus + Grafana

---

## Additional Resources

- **Configuration Reference**: See `server/config/index.js` for all config options
- **Environment Variables**: See `.env.*.example` files for examples
- **Docker Documentation**: See `Dockerfile` and `docker-compose.yml`
- **Health Checks**: `/health` endpoint for monitoring
- **Security**: Article V in `.specify/memory/constitution.md`

---

## Support

For issues or questions:

1. Check this DEPLOYMENT.md guide
2. Review server logs: `docker logs mobile-emulator`
3. Test health endpoint: `curl http://localhost:4175/health`
4. Verify environment configuration: `.env` file
5. Check Docker image: `docker images mobile-emulator:latest`

---

**Last Updated**: 2025-10-01
**Version**: 1.0.0