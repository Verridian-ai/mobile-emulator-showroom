# Environment Variables Documentation

## Overview

This document describes all environment variables used by the Mobile Emulator Platform server. All secrets and sensitive configuration MUST be stored in environment variables per **Article V (Security)** of the constitution.

## Setup Instructions

### 1. Create .env file

```bash
# Copy the example file
cp .env.example .env

# Edit with your actual values
# NEVER commit .env to git (it's already in .gitignore)
```

### 2. Generate secure secrets

```bash
# Generate SESSION_SECRET (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate BROKER_TOKEN (if using WebSocket broker)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Restart server

```bash
# Server will automatically load .env file
npm start
```

---

## Required Variables

### Production Only

These variables MUST be set when `NODE_ENV=production`:

| Variable | Description | Example |
|----------|-------------|---------|
| `SESSION_SECRET` | Secret key for session encryption | `a1b2c3d4e5f6...` (64 hex chars) |

**CRITICAL:** Never use default or weak secrets in production!

---

## Optional Variables

### Server Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Server port | `4175` | `4175`, `80`, `8080` |
| `NODE_ENV` | Environment mode | `development` | `development`, `production`, `test` |

### Security Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SESSION_SECRET` | Session encryption key | None (generates warning) | 64 hex characters |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `*` (all) | `https://example.com,https://www.example.com` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` (15 min) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | `100`, `200` |

### WebSocket Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `BROKER_URL` | WebSocket broker URL | None | `ws://localhost:7071`, `wss://broker.example.com` |
| `BROKER_TOKEN` | Broker auth token | None | 64 hex characters |

### API Keys (External Services)

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `CLAUDE_API_KEY` | Claude AI API key | None | `sk-ant-api03-...` |
| `AWS_ACCESS_KEY_ID` | AWS access key | None | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | None | Secret string |

### Database Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATABASE_URL` | Database connection string | None | `postgresql://user:pass@host:5432/db` |

### Logging & Monitoring

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Logging verbosity | `info` | `error`, `warn`, `info`, `debug` |
| `DEBUG_MODE` | Enable debug features | `false` | `true`, `false` |
| `SENTRY_DSN` | Sentry error tracking | None | `https://...@sentry.io/...` |

---

## Validation

### Startup Validation

The server validates environment variables on startup:

- **Production Mode:** Requires `SESSION_SECRET`
- **CORS Warning:** Warns if `CORS_ALLOWED_ORIGINS=*` in production
- **Missing Required:** Exits with error code 1 if required vars missing

### Example Startup Output

```
🚀 Starting Verridian Showroom Server...
📁 Public directory: /app/public
🌐 Server port: 4175
🔧 Environment: development
✅ Public directory found
📄 Found 42 files in public directory
✅ Showroom listening on http://0.0.0.0:4175
```

---

## Security Best Practices

### DO ✅

- ✅ Store ALL secrets in `.env` file
- ✅ Use strong random strings (32+ bytes) for secrets
- ✅ Keep `.env` out of version control (in `.gitignore`)
- ✅ Use different secrets for development/staging/production
- ✅ Rotate secrets regularly (especially after exposure)
- ✅ Use environment-specific `.env` files (`.env.production`, `.env.staging`)
- ✅ Document all variables in `.env.example` with dummy values

### DON'T ❌

- ❌ Commit `.env` to git
- ❌ Hardcode secrets in source code
- ❌ Share secrets via email/Slack/chat
- ❌ Use weak or predictable secrets
- ❌ Reuse secrets across environments
- ❌ Log secrets to console or files
- ❌ Store secrets in client-side JavaScript

---

## Production Checklist

Before deploying to production:

- [ ] `NODE_ENV=production` is set
- [ ] `SESSION_SECRET` is set to strong random value
- [ ] `CORS_ALLOWED_ORIGINS` is set to specific domains (not `*`)
- [ ] All API keys are production keys (not test/dev keys)
- [ ] Database credentials are production credentials
- [ ] `.env` file is NOT committed to git
- [ ] Secrets are stored in secure secret manager (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Server validates all required variables on startup
- [ ] No hardcoded secrets remain in source code

---

## Docker Configuration

When running in Docker, pass environment variables via:

### 1. Docker run command

```bash
docker run -e PORT=4175 -e SESSION_SECRET=your-secret mobile-emulator
```

### 2. docker-compose.yml

```yaml
services:
  web:
    image: mobile-emulator
    environment:
      - PORT=4175
      - SESSION_SECRET=${SESSION_SECRET}
      - NODE_ENV=production
    env_file:
      - .env
```

### 3. Kubernetes secrets

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: mobile-emulator-secrets
type: Opaque
data:
  SESSION_SECRET: <base64-encoded-secret>
```

---

## Troubleshooting

### Server won't start

**Error:** `❌ SECURITY ERROR: Required environment variables missing`

**Solution:** Set required variables in `.env` file

### CORS errors in browser

**Error:** `Access-Control-Allow-Origin` blocked

**Solution:** Set `CORS_ALLOWED_ORIGINS=https://yourdomain.com` in `.env`

### Session errors

**Error:** Session/cookie issues

**Solution:** Set `SESSION_SECRET` to strong random value

---

## References

- **Constitution Article V:** Security requirements
- **Task 1.8:** Remove hardcoded secrets (this task)
- **dotenv documentation:** https://github.com/motdotla/dotenv
- **OWASP Secrets Management:** https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html

---

**Last Updated:** 2025-10-01 (Task 1.8)
**Author:** Backend & Infrastructure Agent
**Status:** Production Ready