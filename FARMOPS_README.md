# FarmOps - Offline-First Farm Operations Platform

![FarmOps Dashboard](https://github.com/user-attachments/assets/ff99b5a2-7b6a-4787-a88f-df94bb9b6de8)

## Overview

FarmOps is a production-ready, offline-first Progressive Web App (PWA) for managing farm operations across three key roles: Owner, Manager, and Worker. Built with Next.js 15, React 19, and TypeScript strict mode, it provides a robust platform for task management, procurement, inventory, payroll, and monitoring.

## ✨ Key Features

### Offline-First Architecture
- **IndexedDB Storage**: All user actions saved locally first
- **Smart Sync Queue**: Exponential backoff with jitter for reliable syncing
- **Service Worker**: App-shell caching for instant loads
- **Foreground Sync**: Primary strategy with best-effort background sync
- **No Data Loss**: Works seamlessly offline with automatic sync when reconnected

### Role-Based Access Control
- **Owner**: Approvals, weekly digest, exception management, full visibility
- **Manager**: Daily operations, fund requests, inventory movements, team management
- **Worker**: Task execution with proof-of-work capture (photo/video/audio + GPS)
- **Vendor**: PO confirmation and invoice submission portal
- **Verifier**: Audit workflows and compliance monitoring

### Core Modules

#### 1. **Task Operations**
- Task board with today/overdue/completed views
- Template management for recurring tasks
- Proof-of-work capture (photos, videos, audio)
- GPS and timestamp metadata
- Offline task creation and completion

#### 2. **Budget & Spend Governance**
- Budget visibility dashboards
- Spend request workflows
- Owner approval inbox
- Budget tracking and variance alerts
- Offline-first spend request queue

#### 3. **Procurement**
- Purchase request creation
- PO generation and tracking
- Delivery confirmation
- Discrepancy logging and resolution
- Vendor portal for PO confirmation

#### 4. **Inventory Management**
- Inventory movements (in/out/adjustment)
- Lot tracking
- Leakage-item controls
- Stock level monitoring
- Movement history and audit trail

#### 5. **Payroll Workflows**
- Payroll run preparation
- Approval workflows
- Payment status tracking
- Payroll history and reports

#### 6. **Manager Communications**
- Voice-first daily updates
- Text fallback for updates
- Owner digest viewer
- Update history timeline

#### 7. **Owner Control Tower**
- Weekly digest dashboard
- Exception center with filters
- Trend cards and analytics
- Quick approval actions
- Alert configuration

#### 8. **Verification & Audit**
- Audit scheduling
- Checklist execution
- Discrepancy reporting
- Verification workflow tracking
- Audit history

#### 9. **Monitoring & Sensors**
- Sensor status dashboards
- Threshold alert views
- Issue timelines
- Historical data charts

#### 10. **Incident Management**
- Issue escalation workflows
- Expert request system
- Resolution tracking
- Incident timelines

## 🏗️ Technical Architecture

### Stack

```typescript
- Framework: Next.js 15 App Router + React 19 + TypeScript strict
- Styling: Tailwind CSS v4 + CSS variables + shadcn/radix UI primitives
- State Management:
  - TanStack Query for server state
  - Zustand for client-local workflow state
  - React Hook Form + Zod for forms/validation
- PWA:
  - Service Worker (/public/sw.js) for app-shell caching
  - IndexedDB for offline domain data
  - Foreground sync as primary strategy
- Authentication: Clerk with farm-scoped roles
- Event Queue: Inngest for background workflows
```

### Project Structure

```
chericheri-store/
├── app/                          # Next.js App Router
│   ├── farm/                    # Farm operations routes
│   │   ├── dashboard/          # Main dashboard
│   │   ├── tasks/              # Task management
│   │   ├── procurement/        # Procurement workflows
│   │   ├── inventory/          # Inventory management
│   │   ├── payroll/            # Payroll processing
│   │   ├── monitoring/         # Sensor monitoring
│   │   ├── incidents/          # Incident management
│   │   ├── verification/       # Audit workflows
│   │   └── settings/           # Sync center & settings
│   ├── api/                    # API routes
│   └── layout.tsx              # Root layout with providers
├── src/
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   └── farm/               # Farm-specific components
│   ├── lib/
│   │   ├── api/                # API client & sync queue
│   │   ├── db/                 # IndexedDB abstraction
│   │   ├── hooks/              # Custom React hooks
│   │   ├── providers/          # Context providers
│   │   └── utils/              # Utility functions
│   ├── stores/                 # Zustand stores
│   ├── types/                  # TypeScript types
│   └── styles/                 # Global styles & theme
├── public/
│   ├── sw.js                   # Service worker
│   ├── manifest.json           # PWA manifest
│   ├── offline.html            # Offline fallback page
│   └── icons/                  # PWA icons
└── config/                     # Configuration files
```

### Key Design Patterns

#### Offline-First Data Flow

```typescript
// 1. User action saves locally first
await saveLocalTask(newTask);

// 2. Queue for sync if online
await queueSyncJob(farmId, 'create-task', {
  method: 'POST',
  endpoint: '/api/tasks',
  body: newTask,
});

// 3. Sync queue processes with retry logic
// - Exponential backoff: 1s, 2s, 4s, 8s, up to 5 minutes
// - Jitter: ±20% randomization to prevent thundering herd
// - Bounded batch size: Max 10 concurrent syncs
// - Deduplication: Prevents duplicate in-flight syncs
```

#### Farm-Scoped Data Isolation

```typescript
// All IndexedDB keys are farm-scoped
const taskKey = `${farmId}-task-${taskId}`;

// All API calls include farmId
await apiClient.get('/tasks', { params: { farmId } });

// Switching farms clears local cache
await clearFarmData(previousFarmId);
```

#### API Response Envelope

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input',
    details: { ... }
  }
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance
- Clerk account for authentication
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# MongoDB
MONGODB_URI=mongodb://...

# Inngest
INNGEST_SIGNING_KEY=...
INNGEST_EVENT_KEY=...

# App Config
NEXT_PUBLIC_CURRENCY=USD
```

## 📱 PWA Installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (⋮) → "Add to Home screen"
3. Confirm installation

### iOS (Safari)
1. Open the app in Safari
2. Tap Share (□↑) → "Add to Home Screen"
3. Confirm installation
4. **Important**: Web Push requires Home Screen installation on iOS

## 🧪 Testing

### Unit Tests

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npx playwright test

# Run specific test
npx playwright test tests/offline-sync.spec.ts

# Run in UI mode
npx playwright test --ui
```

### Key Test Scenarios

1. **Offline Task Creation**
   - Create task while offline
   - Verify local storage
   - Go online
   - Verify sync completes

2. **Sync Queue Retry**
   - Queue multiple operations
   - Simulate network failure
   - Verify exponential backoff
   - Verify eventual success

3. **Farm Switching**
   - Switch farms
   - Verify data isolation
   - Verify cache cleared

## 🎨 UI/UX Guidelines

### Theme System

The app uses CSS variables for theming with support for light/dark modes:

```css
/* Light theme */
--background: 0 0% 100%;
--primary: 142.1 76.2% 36.3%; /* Farm green */

/* Dark theme */
--background: 20 14.3% 4.1%;
--primary: 142.1 70.6% 45.3%;
```

### Accessibility

- ✅ Visible focus states (2px ring with offset)
- ✅ Reduced motion support (`prefers-reduced-motion`)
- ✅ 44px minimum touch targets (mobile-friendly)
- ✅ ARIA labels and semantic HTML
- ✅ Keyboard navigation support

### Design Principles

1. **Clean & Practical**: Minimal, field-usable design
2. **Mobile-First**: Optimized for phones and tablets
3. **Low-Bandwidth Friendly**: Works on slow connections
4. **Voice/Photo Primary**: Minimize typing burden
5. **Clear Status Signaling**: Visual feedback for sync states

## 🔐 Security

### Data Protection

- Farm-scoped data isolation
- Role-based access control
- Clerk authentication with middleware
- Secure API endpoints
- No sensitive data in IndexedDB (only IDs and references)

### Media Upload Security

1. Request signed upload URL from backend
2. Direct upload to Cloudflare R2 (or compatible)
3. Progress tracking with error states
4. Metadata persisted in outbox events

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Configuration

```bash
# Production environment variables
vercel env add MONGODB_URI production
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
# ... add all required env vars
```

### Service Worker Considerations

- Service worker auto-updates on app reload
- Cache versioning: `farmops-v1`
- Runtime cache: 5MB limit (configurable)
- Offline fallback: `/offline.html`

## 📊 Monitoring

### Error Tracking

Sentry integration ready (uncomment in layout.tsx):

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

- Service Worker logs: `console.log('[SW]', ...)`
- Sync Queue logs: `console.log('[Sync Queue]', ...)`
- IndexedDB logs: `console.log('[IndexedDB]', ...)`

## 🗺️ Implementation Roadmap

### ✅ Phase 1: Foundation (Complete)
- Core infrastructure (PWA, IndexedDB, sync queue)
- TypeScript strict mode
- shadcn/ui components
- API client with typed responses
- Zustand & TanStack Query setup
- Base layout with navigation
- Dashboard with mock data

### 🚧 Phase 2: Core Features (In Progress)
- Task operations module
- Proof-of-work capture
- Budget & spend workflows
- Procurement module
- Inventory management

### 📋 Phase 3: Advanced Features (Planned)
- Payroll workflows
- Manager communications
- Owner control tower
- Verification & audit
- Monitoring & sensors
- Incident management

### 🔬 Phase 4: Polish & Production (Planned)
- Comprehensive test coverage
- Performance optimization
- Accessibility audit
- Cross-browser testing
- Documentation
- Deployment guide

## 🤝 Contributing

This is a production application. For contribution guidelines, please contact the repository maintainer.

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For issues or questions, please open a GitHub issue or contact the development team.

---

**Built with ❤️ for sustainable farming operations**
