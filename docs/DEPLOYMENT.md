# SportWarren Deployment Guide

This guide covers deploying SportWarren to various environments, including local development, testnet, and production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Smart Contract Deployment](#smart-contract-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Backend Deployment](#backend-deployment)
- [Database Setup](#database-setup)
- [Production Deployment](#production-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

## Prerequisites

### Required Software
- **Node.js** 18+ with npm
- **PostgreSQL** 14+
- **Redis** 6+
- **Docker** (optional but recommended)
- **Algorand Sandbox** (for local blockchain development)

### Required Accounts & Services
- **Algorand Account** with sufficient ALGO for deployment
- **Auth0 Account** for authentication
- **OpenAI API Key** for AI features
- **Supabase Account** (or self-hosted PostgreSQL)
- **AWS Account** (for production deployment)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/your-org/sportwarren.git
cd sportwarren
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Configure the following variables in your `.env` file:

```env
# Application
NODE_ENV=development
PORT=4000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/sportwarren
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-here
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Algorand Blockchain
ALGORAND_NETWORK=testnet
ALGORAND_NODE_URL=https://testnet-api.algonode.cloud
ALGORAND_INDEXER_URL=https://testnet-idx.algonode.cloud
DEPLOYER_MNEMONIC="your 25 word mnemonic phrase here"

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key

# Communication Services
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
WHATSAPP_SESSION_SECRET=your-whatsapp-session-secret

# External Services
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Local Development

### 1. Start Database Services

Using Docker Compose (recommended):
```bash
docker-compose up -d postgres redis
```

Or install and start services manually:
```bash
# PostgreSQL
brew install postgresql
brew services start postgresql

# Redis
brew install redis
brew services start redis
```

### 2. Setup Algorand Sandbox

```bash
# Clone Algorand Sandbox
git clone https://github.com/algorand/sandbox.git
cd sandbox

# Start testnet sandbox
./sandbox up testnet

# Or for local development
./sandbox up dev
```

### 3. Database Migration

```bash
# Run database migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:client    # Frontend on http://localhost:5173
npm run dev:server    # Backend on http://localhost:4000
```

## Smart Contract Deployment

### Local Deployment

```bash
# Deploy to local Algorand Sandbox
npm run deploy:contracts:local
```

### Testnet Deployment

```bash
# Ensure you have testnet ALGO in your deployer account
# Deploy to Algorand testnet
npm run deploy:contracts:testnet
```

### Mainnet Deployment

```bash
# ⚠️ Production only - ensure thorough testing first
npm run deploy:contracts:mainnet
```

### Verify Deployment

```bash
# Verify all contracts are deployed correctly
npm run verify:contracts
```

Contract addresses will be saved in `deployment-{network}.json` files.

## Frontend Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Deploy to AWS S3 + CloudFront

```bash
# Install AWS CLI and configure
aws configure

# Build application
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Backend Deployment

### Build Backend

```bash
npm run build:server
```

### Deploy to Railway

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on git push

### Deploy to Heroku

```bash
# Install Heroku CLI
npm i -g heroku

# Create Heroku app
heroku create sportwarren-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=your-production-db-url
# ... set all other environment variables

# Deploy
git push heroku main
```

### Deploy to AWS ECS

1. Create ECR repository
2. Build and push Docker image
3. Create ECS task definition
4. Deploy to ECS cluster

Example Dockerfile:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 4000
CMD ["node", "dist/server/index.js"]
```

## Database Setup

### Production Database

#### Using Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy connection details to environment variables
3. Run migrations:

```bash
npm run db:migrate:prod
```

#### Self-hosted PostgreSQL

```bash
# Create production database
createdb sportwarren_prod

# Run migrations
DATABASE_URL=postgresql://user:pass@host:5432/sportwarren_prod npm run db:migrate
```

### Redis Setup

#### Using Redis Cloud

1. Create account at [redis.com](https://redis.com)
2. Create database instance
3. Update `REDIS_URL` in environment variables

## Production Deployment

### Full Stack Deployment Checklist

- [ ] Database configured and migrated
- [ ] Redis instance running
- [ ] Smart contracts deployed to mainnet
- [ ] Environment variables set correctly
- [ ] SSL certificates configured
- [ ] Domain names configured
- [ ] Monitoring tools setup
- [ ] Backup procedures in place
- [ ] Load testing completed
- [ ] Security audit completed

### Infrastructure as Code

Example `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: sportwarren
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:6-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl

volumes:
  postgres_data:
  redis_data:
```

## Monitoring & Maintenance

### Health Checks

Implement health check endpoints:

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});
```

### Logging

Configure structured logging:

```bash
# View application logs
npm run logs

# View database logs
npm run logs:db

# View contract interaction logs
npm run logs:contracts
```

### Backup Procedures

```bash
# Database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Redis backup
redis-cli --rdb backup-$(date +%Y%m%d).rdb
```

### Updates and Migrations

```bash
# Deploy application updates
npm run deploy:update

# Run database migrations
npm run db:migrate:prod

# Update smart contracts (if needed)
npm run contracts:upgrade
```

## Troubleshooting

### Common Issues

1. **Contract deployment fails**
   - Check ALGO balance in deployer account
   - Verify network connectivity
   - Ensure TEAL files are valid

2. **Database connection errors**
   - Verify DATABASE_URL format
   - Check firewall settings
   - Confirm database is running

3. **Frontend build fails**
   - Clear node_modules and reinstall
   - Check for TypeScript errors
   - Verify environment variables

### Getting Help

- Check the [GitHub Issues](https://github.com/your-org/sportwarren/issues)
- Join our [Discord Community](https://discord.gg/sportwarren)
- Contact support: support@sportwarren.com

## Security Considerations

### Production Security Checklist

- [ ] All secrets stored securely (not in code)
- [ ] HTTPS enabled with valid certificates
- [ ] Database connections encrypted
- [ ] Rate limiting implemented
- [ ] Input validation and sanitization
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Regular security updates applied
- [ ] Smart contract security audit completed
- [ ] Monitoring and alerting configured

### Smart Contract Security

- Always test on testnet first
- Use multi-signature wallets for contract management
- Implement emergency pause mechanisms
- Regular security audits
- Monitor contract interactions

---

For more detailed information, refer to the individual service documentation or contact the development team.