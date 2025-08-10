# 🚀 Guia de Deploy

> **Deploy completo** do Template Default Backend

---

## 🎯 **Visão Geral**

Este guia cobre diferentes estratégias de deploy para o backend NestJS, desde desenvolvimento local até produção em cloud providers.

---

## 🐳 **Docker Deployment**

### 📦 **Build da Imagem**
```bash
# Build da aplicação
npm run build

# Build da imagem Docker
docker build -t template-default-backend .

# Executar container
docker run -d \
  --name template-backend \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db:5432/app" \
  -e JWT_SECRET="your-secret" \
  template-default-backend
```

### 🐙 **Docker Compose**
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/app
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    
  db:
    image: postgres:16
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

**Executar**:
```bash
docker-compose up -d
```

---

## ☁️ **Cloud Deployment**

### 🌊 **Vercel**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**vercel.json**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/main.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/main.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 🚀 **Heroku**
```bash
# Instalar Heroku CLI
npm i -g heroku

# Login e criar app
heroku login
heroku create template-default-api

# Configurar variáveis
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL="postgresql://..."
heroku config:set JWT_SECRET="your-secret"

# Deploy
git push heroku main
```

**Procfile**:
```
web: node dist/main.js
release: npm run migration:run
```

### ☁️ **AWS EC2**
```bash
# Conectar ao servidor
ssh -i key.pem ubuntu@ec2-instance.com

# Instalar dependências
sudo apt update
sudo apt install nodejs npm postgresql

# Configurar aplicação
git clone https://github.com/seu-repo/template-default.git
cd template-default/backend
npm install
npm run build

# Configurar PM2
npm install -g pm2
pm2 start dist/main.js --name "template-backend"
pm2 startup
pm2 save
```

### 🔵 **DigitalOcean App Platform**
```yaml
# .do/app.yaml
name: template-default-backend
services:
- name: api
  source_dir: backend
  github:
    repo: seu-usuario/template-default
    branch: main
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
databases:
- engine: PG
  name: main-db
  num_nodes: 1
  size: basic-xs
  version: "14"
```

---

## 🗃️ **Database Setup**

### 🐘 **PostgreSQL**

#### **Local Setup**
```bash
# Instalar PostgreSQL
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download do site oficial

# Criar database
sudo -u postgres createdb template_default
```

#### **Cloud Databases**

**Supabase**:
```bash
# Criar projeto em supabase.com
# Copiar connection string
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres"
```

**PlanetScale**:
```bash
# Criar database em planetscale.com
# Configurar conexão
DATABASE_URL="mysql://username:password@host:3306/database"
```

**AWS RDS**:
```bash
# Criar instância RDS
# Configurar security groups
DATABASE_URL="postgresql://user:pass@rds-instance.region.rds.amazonaws.com:5432/db"
```

### 🔄 **Migrations**
```bash
# Executar migrations
npm run migration:run

# Reverter migration
npm run migration:revert

# Gerar migration
npm run migration:generate -- -n CreateUsers
```

---

## 🔐 **Environment Configuration**

### 🌍 **Variáveis de Ambiente**

**.env.production**:
```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="postgresql://user:pass@host:5432/db"
DATABASE_SSL=true
DATABASE_LOGGING=false

# Authentication  
JWT_SECRET="super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN="https://seu-frontend.com"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Monitoring
LOG_LEVEL=warn
SENTRY_DSN="https://your-sentry-dsn"

# External Services
REDIS_URL="redis://user:pass@host:6379"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-password"
```

### 🔒 **Secrets Management**

**AWS Secrets Manager**:
```typescript
import { SecretsManager } from 'aws-sdk';

const secretsManager = new SecretsManager({ region: 'us-east-1' });

async function getSecret(secretName: string) {
  const result = await secretsManager.getSecretValue({ 
    SecretId: secretName 
  }).promise();
  return JSON.parse(result.SecretString);
}
```

**HashiCorp Vault**:
```bash
# Configurar Vault
export VAULT_ADDR="https://vault.company.com"
export VAULT_TOKEN="your-token"

# Buscar secrets
vault kv get -field=database_url secret/template-default
```

---

## 🔍 **Monitoring e Logging**

### 📊 **Application Performance**

**New Relic**:
```typescript
// main.ts
import * as newrelic from 'newrelic';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // New Relic monitoring
  app.use(newrelic.getBrowserTimingHeader());
  
  await app.listen(3000);
}
```

**Datadog**:
```typescript
import * as tracer from 'dd-trace';
tracer.init();

// Custom metrics
const StatsD = require('node-statsd');
const stats = new StatsD();

stats.increment('api.requests');
```

### 📝 **Structured Logging**

**Winston + ELK Stack**:
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
    new winston.transports.File({
      filename: 'logs/app.log',
      format: winston.format.json()
    })
  ]
});
```

### 🚨 **Error Tracking**

**Sentry**:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});

@Catch()
export class SentryFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    Sentry.captureException(exception);
    // ... handle exception
  }
}
```

---

## ⚡ **Performance Optimization**

### 🚀 **Production Optimizations**

**PM2 Cluster Mode**:
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'template-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

**Nginx Reverse Proxy**:
```nginx
upstream backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### ⚡ **Caching Strategy**
```typescript
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 300 // 5 minutes
    })
  ]
})
export class AppModule {}
```

---

## 🔄 **CI/CD Pipeline**

### 🔧 **GitHub Actions**
```yaml
# .github/workflows/deploy.yml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run tests
        run: |
          cd backend
          npm run test
          npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
          appdir: "backend"
```

### 🏗️ **Build Optimization**
```bash
# Multi-stage Docker build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

---

## ✅ **Health Checks**

### 🏥 **Kubernetes Health Checks**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: template-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: template-backend
  template:
    metadata:
      labels:
        app: template-backend
    spec:
      containers:
      - name: backend
        image: template-default-backend:latest
        ports:
        - containerPort: 3000
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### 📊 **Custom Health Checks**
```typescript
@Injectable()
export class CustomHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // Custom health logic
    const isHealthy = await this.checkCustomService();
    
    const result = this.getStatus(key, isHealthy);
    
    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('Custom service failed', result);
  }
}
```

---

## 🎉 **Conclusão de Deploy**

### ✅ **Checklist de Produção**
- ✅ **Environment Variables** configuradas
- ✅ **Database** configurado e migrations executadas
- ✅ **SSL/TLS** configurado
- ✅ **Monitoring** ativo (logs, metrics, errors)
- ✅ **Backups** automatizados
- ✅ **Health Checks** implementados
- ✅ **CI/CD** pipeline funcionando
- ✅ **Security** hardening aplicado

---

<div align="center">
  <p><strong>🚀 Deploy profissional e seguro</strong></p>
  <p><em>Preparado para escalar em qualquer ambiente</em></p>
</div>
