# NEPA

> Decentralized utility payment platform powered by Stellar blockchain

A modern microservices platform enabling seamless electricity and water bill payments through blockchain technology.

## 🏗️ Project Structure

```
nepa/
├── frontend/          # React frontend application
├── backend/           # Node.js API server
└── contract/          # Stellar smart contracts
```

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with 2FA support
- 💳 **Blockchain Payments** - Stellar integration for fast, low-cost transactions
- 📊 **Real-time Analytics** - Comprehensive dashboard with live metrics
- 🔔 **Smart Notifications** - Multi-channel notification system
- 📱 **Mobile Responsive** - Optimized for all devices
- 🚀 **High Performance** - Sub-second response times
- 🔒 **Enterprise Security** - Bank-grade security measures
- 📈 **Scalable Architecture** - Microservices with database-per-service

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+
- Stellar testnet account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/nepa.git
cd nepa

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install contract dependencies
cd ../contract && npm install
```

### Environment Setup

```bash
# Backend environment
cd backend
cp .env.example .env
# Configure database URLs, Stellar keys, Redis connection, etc.

# Frontend environment
cd ../frontend
cp .env.example .env
# Configure API endpoints, etc.
```

### Running the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm run dev

# Build contracts (from contract directory)
npm run build
```

## 📚 API Documentation

### Authentication

```bash
# Register user
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

### Payments

```bash
# Process payment
POST /api/payment/process
{
  "billId": "bill_123",
  "amount": 150.00,
  "method": "STELLAR"
}

# Get payment history
GET /api/payment/history?userId=user_123
```

## 🔧 Development

### Backend Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Database
npm run db:setup         # Initialize all databases
npm run db:migrate       # Run migrations
npm run db:seed          # Seed database with sample data

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:e2e         # End-to-end tests

# Quality
npm run lint            # Lint code
npm run type-check      # TypeScript checking
npm run test:coverage   # Coverage report
```

### Frontend Scripts

```bash
# Development
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build

# Testing
npm test              # Run tests
npm run test:e2e       # End-to-end tests

# Quality
npm run lint         # Lint code
npm run type-check   # TypeScript checking
```

### Contract Scripts

```bash
# Build
npm run build        # Build smart contracts
npm run test         # Run contract tests
npm run deploy       # Deploy to network
```

## 🔒 Security

- **Authentication**: JWT with refresh tokens
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: AES-256 for data at rest
- **API Security**: Rate limiting, input validation, CORS
- **Audit Trail**: Comprehensive logging of all actions

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the future of utility payments**
