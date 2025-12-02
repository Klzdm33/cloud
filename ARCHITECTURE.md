# NeuralMesh - Arquitetura Técnica Detalhada

## 🏗️ **Visão Geral da Arquitetura**

NeuralMesh採用分层架构设计，每层负责特定功能，同时通过标准化接口相互通信：

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Web App] --> B[Mobile App]
        A --> C[CLI Tools]
        A --> D[API Gateway]
    end
    
    subgraph "Application Layer"
        D --> E[Auth Service]
        D --> F[ML Pipeline Service]
        D --> G[GPU Marketplace]
        D --> H[Payment Service]
    end
    
    subgraph "Infrastructure Layer"
        E --> I[IPFS Network]
        F --> J[GPU Providers]
        G --> J
        H --> K[Blockchain Network]
    end
    
    subgraph "Data Layer"
        I --> L[Filecoin]
        K --> M[Ethereum/Polygon]
        J --> N[Provider Infrastructure]
    end
```

## 🎯 **MVP Technical Specifications**

### **Core Components**

#### 1. **Frontend Stack**
```typescript
// Tech Stack Details
frontend: {
  framework: "Next.js 14 (App Router)",
  language: "TypeScript",
  styling: "Tailwind CSS + Custom Design System",
  state: "Zustand + React Query",
  web3: "Web3.js + WalletConnect",
  charts: "Recharts + D3.js",
  testing: "Jest + Cypress"
}
```

#### 2. **Smart Contracts Architecture**
```solidity
// Core Contract Structure
contracts: {
  "NeuralMeshToken": {
    standard: "ERC20",
    features: ["Staking", "Governance"],
    supply: "Fixed with deflationary burns"
  },
  "GPUMarketplace": {
    functions: ["listGPU", "rentGPU", "releaseGPU"],
    events: ["GPUListed", "GPURented", "PaymentCompleted"]
  },
  "ReputationSystem": {
    scoring: "Multi-factor (uptime, performance, reviews)",
    rewards: "Token distributions for good providers"
  }
}
```

#### 3. **Backend Services**
```yaml
# Microservices Architecture
services:
  auth-service:
    description: "JWT + OAuth2 + Web3 authentication"
    database: "PostgreSQL + Redis"
    
  ml-pipeline:
    description: "Model deployment & training orchestration"
    framework: "Kubernetes + Docker"
    monitoring: "Prometheus + Grafana"
    
  gpu-marketplace:
    description: "Real-time GPU availability & pricing"
    websockets: "Socket.io for live updates"
    caching: "Redis for performance"
    
  payment-service:
    description: "Crypto + fiat payment processing"
    chains: ["Ethereum", "Polygon", "BSC"]
    providers: ["Stripe", "Coinbase Commerce"]
```

## 🗄️ **Database Schema**

### **Core Tables**

```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE,
    email VARCHAR(255),
    role user_role DEFAULT 'user',
    reputation_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- GPU Providers
CREATE TABLE gpu_providers (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    gpu_model VARCHAR(100),
    vram_gb INTEGER,
    location VARCHAR(100),
    price_per_hour DECIMAL(10,4),
    availability_status provider_status,
    total_uptime_hours INTEGER DEFAULT 0,
    performance_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Active Rentals
CREATE TABLE active_rentals (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    provider_id UUID REFERENCES gpu_providers(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    total_cost DECIMAL(10,2),
    status rental_status,
    job_metadata JSONB
);

-- AI Models and Datasets
CREATE TABLE ml_models (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(200),
    framework VARCHAR(50), -- 'pytorch', 'tensorflow', 'huggingface'
    model_type model_type_enum,
    training_data_size_gb INTEGER,
    deployment_status deploy_status,
    ipfs_hash VARCHAR(128),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    transaction_type tx_type,
    amount DECIMAL(18,8),
    currency VARCHAR(10), -- 'ETH', 'MATIC', 'NMESH'
    gas_fee DECIMAL(18,8),
    status tx_status,
    blockchain_tx_hash VARCHAR(128),
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 **API Design**

### **REST API Endpoints**

```typescript
// Authentication & User Management
POST /api/auth/login
GET /api/user/profile
PUT /api/user/profile
GET /api/user/reputation

// GPU Marketplace
GET /api/gpus/available?gpu_type=H100&location=US
POST /api/gpus/list
PUT /api/gpus/update-pricing
GET /api/gpus/provider/:id/reviews

// ML Workloads
POST /api/ml/deploy
GET /api/ml/jobs/:id/status
PUT /api/ml/jobs/:id/stop
GET /api/ml/models

// Payments & Billing
GET /api/billing/usage
GET /api/billing/invoices
POST /api/billing/deposit
POST /api/billing/withdraw

// Network & Monitoring
GET /api/network/stats
GET /api/network/health
GET /api/providers/leaderboard
```

### **WebSocket Events**

```typescript
// Real-time GPU Availability
interface GPUUpdate {
  type: 'GPU_AVAILABILITY_CHANGED';
  providerId: string;
  gpuModel: string;
  isAvailable: boolean;
  pricePerHour: number;
}

// Job Progress Updates
interface JobProgress {
  type: 'JOB_PROGRESS';
  jobId: string;
  progress: number; // 0-100
  status: 'running' | 'completed' | 'failed';
  estimatedTimeRemaining: number; // seconds
}

// Payment Notifications
interface PaymentUpdate {
  type: 'PAYMENT_CONFIRMED';
  transactionId: string;
  amount: number;
  currency: string;
  status: 'confirmed' | 'failed';
}
```

## 🔐 **Security Architecture**

### **Multi-Layer Security**

```mermaid
graph TB
    subgraph "Client Security"
        A[HTTPS/TLS 1.3] --> B[Content Security Policy]
        B --> C[Subresource Integrity]
    end
    
    subgraph "Authentication"
        C --> D[JWT + Refresh Tokens]
        D --> E[Multi-factor Authentication]
        E --> F[Web3 Wallet Verification]
    end
    
    subgraph "API Security"
        F --> G[Rate Limiting]
        G --> H[Input Validation]
        H --> I[SQL Injection Prevention]
    end
    
    subgraph "Blockchain Security"
        I --> J[Smart Contract Audits]
        J --> K[Multi-signature Wallets]
        K --> L[Time-locked Transactions]
    end
    
    subgraph "Data Security"
        L --> M[End-to-end Encryption]
        M --> N[Zero-knowledge Proofs]
        N --> O[Decentralized Storage]
    end
```

### **Smart Contract Security Measures**

```solidity
// Security patterns implemented
contract NeuralMeshMarketplace {
    // 1. Access Control with Roles
    using AccessControl for AccessControl.Roles;
    
    // 2. Reentrancy Protection
    modifier nonReentrant() {
        require(!_status, "ReentrancyGuard: reentrant call");
        _status = true;
        _;
        _status = false;
    }
    
    // 3. Pausable Contract
    modifier whenNotPaused() {
        require(!paused(), "Pausable: paused");
        _;
    }
    
    // 4. Rate Limiting
    mapping(address => uint256) public lastRequest;
    
    modifier rateLimited() {
        require(
            block.timestamp >= lastRequest[msg.sender] + 1 minutes,
            "Rate limit exceeded"
        );
        lastRequest[msg.sender] = block.timestamp;
        _;
    }
}
```

## 🚀 **Deployment Architecture**

### **Infrastructure as Code**

```yaml
# docker-compose.yml for local development
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_CHAIN_ID=80001
      - NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
    depends_on:
      - backend
      - postgres
      - redis

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/neuralmesh
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=neuralmesh
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### **Kubernetes Production Setup**

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: neuralmesh-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: neuralmesh-frontend
  template:
    metadata:
      labels:
        app: neuralmesh-frontend
    spec:
      containers:
      - name: frontend
        image: neuralmesh:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: neuralmesh-frontend-service
spec:
  selector:
    app: neuralmesh-frontend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

## 📊 **Monitoring & Observability**

### **Metrics Collection**

```typescript
// Prometheus metrics setup
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Business metrics
export const gpuRentals = new Counter({
  name: 'gpu_rentals_total',
  help: 'Total number of GPU rentals',
  labelNames: ['gpu_model', 'status']
});

export const trainingJobDuration = new Histogram({
  name: 'ml_job_duration_seconds',
  help: 'Duration of ML training jobs',
  labelNames: ['framework', 'status']
});

export const activeGPUs = new Gauge({
  name: 'active_gpus_total',
  help: 'Number of active GPUs in the network'
});

export const revenueGenerated = new Counter({
  name: 'revenue_usd_total',
  help: 'Total revenue generated in USD',
  labelNames: ['currency']
});
```

### **Logging Strategy**

```typescript
// Structured logging with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'neuralmesh-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Usage examples
logger.info('GPU rental initiated', {
  userId: user.id,
  providerId: gpuProvider.id,
  gpuModel: gpuProvider.gpu_model,
  pricePerHour: gpuProvider.price_per_hour
});

logger.error('ML training job failed', {
  jobId: job.id,
  error: job.error_message,
  framework: job.framework
});
```

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Run security audit
      run: npm audit --audit-level high
    
    - name: Build application
      run: npm run build
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        CYPRESS_baseUrl: http://localhost:3000

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        docker build -t neuralmesh .
        docker tag neuralmesh $ECR_REGISTRY/neuralmesh:$GITHUB_SHA
        docker push $ECR_REGISTRY/neuralmesh:$GITHUB_SHA
        
        # Update Kubernetes deployment
        kubectl set image deployment/neuralmesh-frontend \
          frontend=$ECR_REGISTRY/neuralmesh:$GITHUB_SHA

  notify:
    needs: deploy
    runs-on: ubuntu-latest
    if: always()
    
    steps:
    - name: Notify Discord
      run: |
        curl -X POST $DISCORD_WEBHOOK \
          -H "Content-Type: application/json" \
          -d '{"content": "🚀 NeuralMesh deployed to production!"}'
```

## 🔧 **Developer Tools & SDK**

### **JavaScript SDK**

```typescript
// @neuralmesh/sdk
import NeuralMesh from '@neuralmesh/sdk';

const neuralmesh = new NeuralMesh({
  chainId: 80001, // Polygon Mumbai
  ipfsGateway: 'https://ipfs.io/ipfs/',
  apiKey: process.env.NEURALMESH_API_KEY
});

// Rent GPU
const rental = await neuralmesh.gpus.rent({
  gpuModel: 'H100',
  duration: 3600, // 1 hour in seconds
  maxPrice: 3.0 // USD per hour
});

// Deploy ML model
const deployment = await neuralmesh.ml.deploy({
  framework: 'pytorch',
  modelPath: './model.pth',
  dataset: './training_data.zip',
  gpuType: 'H100'
});

// Monitor job progress
neuralmesh.on('job_progress', (event) => {
  console.log(`Job ${event.jobId}: ${event.progress}% complete`);
});

// Get billing information
const billing = await neuralmesh.billing.getUsage();
console.log(`Total spend: $${billing.totalSpent.toFixed(2)}`);
```

### **CLI Tool**

```bash
# @neuralmesh/cli
npm install -g @neuralmesh/cli

# Initialize project
neuralmesh init my-ai-project

# Deploy model
neuralmesh deploy \
  --framework=pytorch \
  --gpu-type=H100 \
  --max-price=3.0

# Monitor job
neuralmesh monitor <job-id>

# Check billing
neuralmesh billing usage

# List available GPUs
neuralmesh gpus list --model=H100
```

## 📈 **Performance Optimization**

### **Frontend Optimizations**

```typescript
// Next.js optimizations
const config = {
  // Image optimization
  images: {
    domains: ['ipfs.io', 'gateway.pinata.cloud'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Bundle optimization
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
    optimizeImages: true,
  },
  
  // Compression
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};
```

### **Backend Optimizations**

```typescript
// Caching strategy with Redis
class GPUService {
  private redis = new Redis(process.env.REDIS_URL);
  
  async getAvailableGPUs(filters: GPUFilters): Promise<GPU[]> {
    const cacheKey = `gpus:available:${JSON.stringify(filters)}`;
    
    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Query database
    const gpus = await this.db.gpuProviders.findAvailable(filters);
    
    // Cache for 30 seconds
    await this.redis.setex(cacheKey, 30, JSON.stringify(gpus));
    
    return gpus;
  }
  
  async invalidateGPUCache(): Promise<void> {
    const keys = await this.redis.keys('gpus:available:*');
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Connection pooling
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients
  min: 5,  // Minimum number of clients
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

Esta arquitetura técnica fornece uma base sólida para o MVP, com escalabilidade futura e segurança enterprise-grade.