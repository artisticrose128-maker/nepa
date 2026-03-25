# NEPA - Decentralized Utility Payment Platform

A decentralized utility payment platform enabling users to pay electricity and water bills using Stellar blockchain.

## 🏗️ Architecture

This project implements a **Database Per Service** microservices architecture, ensuring:
- Data isolation between services
- Independent scaling capabilities
- Technology diversity support
- Autonomous deployment

### Microservices

1. **User Service** - Authentication, profiles, sessions
2. **Notification Service** - Email, SMS, push notifications
3. **Document Service** - File storage (S3/IPFS)
4. **Utility Service** - Utility provider management
5. **Payment Service** - Payment processing via Stellar
6. **Billing Service** - Bill management and coupons
7. **Analytics Service** - Reporting and metrics
8. **Webhook Service** - Event webhooks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL client tools
- Stellar account (testnet)

### Setup

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd nepa
npm install
```

2. **Start database containers**
```bash
npm run db:docker-up
```

3. **Configure environment**
```bash
cp .env.example .env
# Update database URLs and other configurations
```

4. **Generate Prisma clients**
```bash
npm run db:generate-all
```

5. **Run migrations**
```bash
npm run db:migrate-all
```

6. **Start the application**
```bash
npm run dev
```

## 📊 Database Management

### Available Commands

```bash
# Setup all databases
npm run db:setup

# Generate all Prisma clients
npm run db:generate-all

# Run all migrations
npm run db:migrate-all

# Backup all databases
npm run db:backup

# Health check
npm run db:health-check

# Monitor connection pools
npm run db:monitor-pools

# Docker commands
npm run db:docker-up      # Start containers
npm run db:docker-down    # Stop containers
npm run db:docker-logs    # View logs
```

### Database Services

Each service has its own PostgreSQL database:

| Service | Database | Port |
|---------|----------|------|
| User | nepa_user_service | 5432 |
| Notification | nepa_notification_service | 5433 |
| Document | nepa_document_service | 5434 |
| Utility | nepa_utility_service | 5435 |
| Payment | nepa_payment_service | 5436 |
| Billing | nepa_billing_service | 5437 |
| Analytics | nepa_analytics_service | 5438 |
| Webhook | nepa_webhook_service | 5439 |

## 🔄 Event-Driven Architecture

Services communicate through domain events:

```typescript
import EventBus from './databases/event-patterns/EventBus';
import MessageBroker from './databases/event-patterns/MessageBroker';
import { createPaymentSuccessEvent } from './databases/event-patterns/events';

// Publish event (in-memory)
EventBus.publish(createPaymentSuccessEvent(paymentId, billId, userId, amount));

// Publish event (persistent queue)
await MessageBroker.connect();
await MessageBroker.publish(event);

// Subscribe to event
EventBus.subscribe('payment.success', async (event) => {
  // Handle event
});
```

### Start Message Broker

```bash
npm run messaging:start  # Start RabbitMQ & Redis
npm run test:events      # Test event system
```

### RabbitMQ Management
- URL: http://localhost:15672
- User: admin / Pass: admin

## 🔐 Saga Pattern

Distributed transactions use the Saga pattern:

```typescript
import PaymentSaga from './databases/saga/PaymentSaga';

const result = await PaymentSaga.executePayment({
  userId,
  billId,
  amount,
  method: 'STELLAR',
  transactionId
});
```

## 📖 Documentation

- [Database Architecture](./databases/README.md)
- [Migration Guide](./databases/migration-guide.md)
- [Event Patterns](./databases/event-patterns/)
- [Security Architecture](./SECURITY.md)
- [Testing Framework](./api-testing/README.md)
- [Saga Implementation](./databases/saga/)

## 🧪 Testing

```bash
npm test                    # Run all tests
npm run test:unit          # Unit tests
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests
npm run test:security      # Security vulnerability tests
npm run test:contract      # Microservice contract tests
npm run test:performance   # Performance & load tests
npm run db:test-saga       # Test saga implementation
```

## 📈 Monitoring

```bash
# Check database health
npm run db:health-check

# Monitor connection pools
npm run db:monitor-pools 300000 10000  # 5 min duration, 10s interval
```

## 🔧 Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
```

## 📊 Observability

### Start Monitoring Stack

```bash
# Start all observability services
npm run observability:start

# Test observability
npm run observability:test

# View logs
npm run observability:logs
```

### Access Dashboards

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **Alertmanager**: http://localhost:9093

### Features

- **Structured Logging**: JSON logs with correlation IDs
- **Distributed Tracing**: OpenTelemetry + Jaeger
- **Metrics Collection**: Prometheus + Grafana
- **Log Aggregation**: Loki + Promtail
- **Alerting**: Alertmanager with Slack/PagerDuty
- **SLA Monitoring**: Automated SLA tracking
- **Anomaly Detection**: ML-based anomaly detection

See [Observability Documentation](./observability/README.md) for details.

## 🌟 Features

- ✅ Microservices architecture with database per service
- ✅ Event-driven communication between services
- ✅ Saga pattern for distributed transactions
- ✅ Stellar blockchain integration for payments
- ✅ Multi-utility support (electricity, water)
- ✅ Webhook system for external integrations
- ✅ Document storage (S3/IPFS)
- ✅ Comprehensive analytics and reporting
- ✅ Real-time notifications
- ✅ Automated backups and disaster recovery
- ✅ Distributed monitoring and observability
- ✅ SLA tracking and anomaly detection
- ✅ Event-driven architecture with RabbitMQ
- ✅ Asynchronous event processing with retry logic
- ✅ Event sourcing for audit trails

## 📝 License

MIT
