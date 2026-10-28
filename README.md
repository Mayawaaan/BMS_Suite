# ZSYIO BMS — Enterprise Multi-Tenant Business Management System & Operations OS

> **Version 2.4.0-enterprise** · A full-stack, multi-tenant ERP, CRM, Financial Ledger, and Operations OS built for **Retail POS**, **Factory & Manufacturing**, **Heavy Industries**, **Software SaaS**, **D2C E-Commerce**, and **Multi-Business Portfolios**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Key Capabilities](#key-capabilities)
- [System Architecture & Directory Structure](#system-architecture--directory-structure)
- [Feature Modules](#feature-modules)
- [Multi-Tenant Isolation & Security](#multi-tenant-isolation--security)
- [Dual-Engine Resilience (MongoDB + Redis Fallbacks)](#dual-engine-resilience-mongodb--redis-fallbacks)
- [Quickstart & Installation](#quickstart--installation)
- [Environment Configuration](#environment-configuration)
- [Demo Accounts & RBAC Credentials](#demo-accounts--rbac-credentials)
- [API Reference](#api-reference)
- [Testing & Verification Suites](#testing--verification-suites)

---

## Overview

**ZSYIO BMS** unifies invoicing, sales pipeline management, SKU catalog pricing, multi-warehouse stock control, customer CRM, double-entry accounting, workforce management, and multi-entity portfolio governance into a single cohesive platform.

The platform dynamically adapts its UI terminology, KPIs, and workflows across **6 industry verticals** (`all`, `shop`, `factory`, `industry`, `software`, `ecommerce`) while enforcing strict tenant-level isolation in the backend.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 8 (ES Modules) |
| **Styling & Design System** | Tailwind CSS v4, Semantic Design Tokens |
| **Smooth Scrolling** | Lenis Smooth Scroll Engine |
| **Animations & Micro-UI** | GSAP (GreenSock) Counters + Framer Motion (Modals, Kanban, Drawers) |
| **Icons & Visualization** | Lucide React, Custom SVG Sparklines & Financial Velocity Charts |
| **Backend Runtime & API** | Node.js, Express 4 (ES Modules) |
| **Database & ODM** | MongoDB + Mongoose 8 (with automatic In-Memory Fallback) |
| **Caching Engine** | Redis via `ioredis` (with automatic Virtual In-Memory Redis Fallback) |
| **Authentication & Security** | JWT (`jsonwebtoken`), `bcryptjs`, OTP Verification, `express-rate-limit`, Payload Sanitization |

---

## Key Capabilities

- **True Multi-Tenant SaaS Architecture**: Per-request tenant context resolution via `AsyncLocalStorage` and automatic Mongoose schema scoping (`tenantScopingPlugin`).
- **Multi-Business Portfolio Hub**: Create, manage, and hot-swap between multiple business entities and industry verticals under a single executive account.
- **Double-Entry Financial Ledger & CFO Suite**: Automated Chart of Accounts, Journal Entries, Trial Balance, Profit & Loss (P&L), Balance Sheet, Net Worth, and Company Valuation analytics.
- **Dynamic Industry Verticals**:
  - **Retail Shop (`shop`)**: Counter POS sessions, barcode SKU lookups, shopper receipts, and shelf stock.
  - **Factory & Manufacturing (`factory`)**: Bills of Materials (BOM), production work orders, raw material silos, and batch lots.
  - **Heavy Industries & EPC (`industry`)**: Capital equipment tenders, milestone capex, and central depot logistics.
  - **Software & Cloud SaaS (`software`)**: MRR/ARR subscriptions, cohort churn telemetry, and license seat tracking.
  - **E-Commerce & D2C (`ecommerce`)**: 3PL fulfillment velocity, flash inventory, and customer LTV.
- **Zero-Crash Local Development**: Runs immediately out-of-the-box even without local MongoDB or Redis daemons installed, thanks to synchronized in-memory engines.
- **Role-Based Access Control (RBAC)**: Five granular clearance tiers (`superadmin`, `admin`, `manager`, `staff`, `auditor`) enforced across both UI views and API endpoints.

---

## System Architecture & Directory Structure

```text
d:\Websites\CRM\
├── package.json                          # Root workspace runner (concurrently)
├── .env.example                          # Root environment template
│
├── backend/                              # Express API Server (Port 5000)
│   ├── config/
│   │   ├── db.js                         # MongoDB connection + Resilient In-Memory fallback
│   │   └── redis.js                      # Dual-engine ioredis + Virtual Redis fallback
│   ├── controllers/                      # Route handlers for all core & vertical modules
│   ├── data/
│   │   ├── seedData.js                   # Multi-vertical baseline seed records
│   │   ├── extendedBusinessData.js       # Extended enterprise dataset
│   │   └── seedRunner.js                 # Master database & Redis cache seeder
│   ├── middleware/
│   │   ├── authMiddleware.js             # JWT verification & RBAC guards
│   │   ├── tenantMiddleware.js           # Multi-tenant context & AsyncLocalStorage binding
│   │   ├── subscriptionGuard.js          # Plan tier SKU/entity quota enforcement
│   │   └── securityMiddleware.js         # Rate limiting, security headers & XSS/NoSQL sanitizer
│   ├── models/                           # Mongoose schemas (Tenant, User, Bill, Sale, Product,
│   │                                     # Customer, Stock, Revenue, Account, JournalEntry,
│   │                                     # Bom, WorkOrder, PosSession, Subscription)
│   ├── plugins/
│   │   └── tenantScopingPlugin.js        # Automatic tenantId injection & query filtering
│   ├── routes/                           # Express REST routers
│   ├── services/
│   │   ├── analyticsEngine.js            # Cross-module KPI & velocity aggregation
│   │   ├── ledgerService.js              # Double-entry accounting & journal posting
│   │   ├── otpService.js                 # Multi-factor OTP generation & verification
│   │   └── tenantProvisioningService.js  # Self-service tenant onboarding & bootstrapping
│   └── server.js                         # Application entry point
│
└── frontend/                             # React 19 + Vite Application (Port 5173)
    └── src/
        ├── core/
        │   ├── config/                   # businessProfiles.js, systemConfig.js
        │   ├── contexts/                 # AuthContext.jsx, BusinessProfileContext.jsx
        │   ├── layout/                   # MainLayout.jsx, Sidebar.jsx, Header.jsx
        │   ├── providers/                # SmoothScrollProvider.jsx (Lenis)
        │   └── services/                 # apiClient.js, authService.js, systemService.js
        ├── features/                     # Isolated domain feature modules
        │   ├── auth/                     # Login, Registration, OTP & Demo Persona Switcher
        │   ├── dashboard/                # Executive Pulse & Velocity Telemetry
        │   ├── financials/               # CFO Ledger, P&L, Balance Sheet & Valuation
        │   ├── bills/                    # Payables, Invoices, Create & Print Invoice Modals
        │   ├── sales/                    # Sales Pipeline & Interactive Kanban Board
        │   ├── products/                 # Product Catalog, SKUs & Margin Analytics
        │   ├── revenue/                  # MRR/ARR Streams & Growth Velocity
        │   ├── customers/                # Client CRM, Accounts & LTV Tracking
        │   ├── stock/                    # Multi-Warehouse Inventory & Reorder Alerts
        │   ├── payments/                 # Subscription Plans & Billing Management
        │   ├── multibusiness/            # Multi-Business Portfolio Hub & Switcher
        │   ├── employees/                # Workforce Directory & Role Governance
        │   └── superadmin/               # Platform Governance, Redis Inspector & Seeder
        └── shared/
            ├── components/               # GlassCard, StatCard, Badge, Modal, ChartSparkline, Footer
            └── utils/                    # Currency, date & number formatters
```

---

## Feature Modules

| Module | Path | Description |
| :--- | :--- | :--- |
| **Dashboard & Pulse** | `features/dashboard` | Real-time cross-module KPIs, cashflow velocity, alerts, and quick actions. |
| **CFO Financials** | `features/financials` | Double-entry general ledger, trial balance, P&L statement, balance sheet, and valuation multiples. |
| **Bills & Invoicing** | `features/bills` | Accounts payable tracking, overdue alerts, and printable tax-compliant invoice generation. |
| **Sales Pipeline** | `features/sales` | Deal stage management (`prospect`, `qualified`, `proposal`, `closed_won`, `closed_lost`) with Kanban view. |
| **Products & SKUs** | `features/products` | Catalog management with unit cost, selling price, profit margin computation, and SKU quotas. |
| **Revenue & MRR** | `features/revenue` | Recurring revenue metrics, cohort expansion, gross margin, and vertical revenue breakdown. |
| **Customers CRM** | `features/customers` | Customer lifecycle management (`lead`, `active`, `churned`) and lifetime value (LTV) tracking. |
| **Stock & Inventory** | `features/stock` | Multi-hub warehouse stock levels, reserved units, minimum threshold alerts, and restock workflows. |
| **Multi-Business Hub** | `features/multibusiness` | Portfolio overview to register new business entities, switch active tenants, or delete businesses. |
| **Workforce & Employees** | `features/employees` | Company team directory, employee onboarding, department assignment, and role management. |
| **Payments & Plans** | `features/payments` | Plan tier management (`Starter Hub`, `Growth Enterprise`, `Unlimited Suite`) and billing history. |
| **Super Admin Center** | `features/superadmin` | Platform-wide tenant governance, live Redis key browser, cache flush, and 1-click master data seeding. |

---

## Multi-Tenant Isolation & Security

1. **Tenant Resolution (`tenantMiddleware.js`)**:
   - Resolves the active tenant from JWT claims, `X-Tenant-ID`, `X-Tenant-Slug`, or `X-Business-Type` headers.
   - Binds the tenant context to Node's `AsyncLocalStorage` for the duration of the HTTP request.
2. **Schema-Level Scoping (`tenantScopingPlugin.js`)**:
   - Automatically injects `tenantId` filters into Mongoose queries (`find`, `findOne`, `countDocuments`, `updateOne`, `deleteOne`) and stamps `tenantId` on document creation.
3. **Defense-in-Depth Security (`securityMiddleware.js`)**:
   - **Rate Limiting**: Protects general API routes (`300 req / 15 min`) and authentication endpoints (`15 req / 15 min`).
   - **Payload Sanitization**: Strips `$` and `.` operator injection vectors and sanitizes XSS script tags across `req.body`, `req.query`, and `req.params`.
   - **Cryptographic Auth**: Bcrypt salted password hashing (`10` rounds), signed JWT tokens, and OTP verification.

---

## Dual-Engine Resilience (MongoDB + Redis Fallbacks)

- **Database Layer (`backend/config/db.js`)**:
  - Attempts connection to `MONGODB_URI`. If MongoDB is unreachable, the server automatically activates **Resilient In-Memory Mode** without crashing, keeping all CRUD and analytics features 100% functional.
- **Caching Layer (`backend/config/redis.js`)**:
  - Connects to `REDIS_URL` via `ioredis`. If no Redis server is running, it seamlessly falls back to an **In-Memory Virtual Redis Engine** supporting `get`, `set`, `del`, `delByPattern`, `keys`, `flushAll`, `ttl`, and key inspection.
  - Read endpoints serve cached responses in `< 2ms` (`X-Cache: HIT`), while mutations (`POST`, `PUT`, `DELETE`) automatically invalidate relevant tenant cache namespaces.

---

## Quickstart & Installation

### Prerequisites

- **Node.js** v18+ (v20+ recommended)
- **npm** v9+
- *(Optional)* **MongoDB** (local or Atlas) and **Redis** (local or Upstash) — *not required for local run due to built-in in-memory fallbacks.*

### 1. Install Dependencies

From the repository root, install root, backend, and frontend dependencies:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` in both the root and `backend/` directories:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

### 3. Run the Platform in Development Mode

From the root directory (`d:\Websites\CRM`), launch both Backend and Frontend concurrently:

```bash
npm run dev
```

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Health & Telemetry Endpoint**: http://localhost:5000/api/health

### Available Scripts

| Command (from root) | Description |
| :--- | :--- |
| `npm run dev` | Starts both backend (`nodemon`) and frontend (`vite`) concurrently |
| `npm run backend` | Starts only the backend server on port `5000` |
| `npm run frontend` | Starts only the Vite frontend server on port `5173` |
| `npm run build` | Builds the production frontend bundle in `frontend/dist` |
| `npm start` | Runs the production backend server (`node backend/server.js`) |
| `npm --prefix backend run seed` | Runs the master database and Redis seed script |

---

## Environment Configuration

```env
# Server & App Metadata
PORT=5000
NODE_ENV=development
APP_NAME=ZSYIO BMS
APP_VERSION=2.4.0-enterprise

# Database & Cache Storage (Optional locally — auto-fallbacks enabled)
MONGODB_URI=mongodb://127.0.0.1:27017/crm_saas
REDIS_URL=redis://127.0.0.1:6379

# Authentication & Cryptography
JWT_SECRET=your-secure-jwt-secret-key-at-least-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
OTP_EXPIRES_MINUTES=10

# CORS & Rate Limiting
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=300
RATE_LIMIT_AUTH_MAX=15

# Frontend Vite Environment
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ZSYIO BMS
VITE_APP_VERSION=2.4.0-enterprise
```

---

## Demo Accounts & RBAC Credentials

All default demo accounts use the password: **`password123`**

| Persona | Role | Clearance | Business Entity | Vertical | Email |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Elena Vance** | `superadmin` | Supreme Architect | ZSYIO Global BMS | Universal (`all`) | `superadmin@zsyio.io` |
| **Raj Patel** | `admin` | Full Store Access | ZSYIO Retail Store & POS | Retail Shop (`shop`) | `admin@retailshop.io` |
| **Maya Lin** | `staff` | Standard Counter | ZSYIO Retail Store & POS | Retail Shop (`shop`) | `staff@retailshop.io` |
| **David Chen** | `auditor` | Read-Only Compliance | ZSYIO Retail Store & POS | Retail Shop (`shop`) | `auditor@retailshop.io` |

> **Tip**: You can also register a brand-new account or provision additional businesses across any vertical (`factory`, `industry`, `software`, `ecommerce`, `shop`) directly from the Login screen or the **Multi-Business Portfolio Hub**.

---

## API Reference

| Base Route | Description |
| :--- | :--- |
| `GET /api/health` | Service status, active tenant resolution, MongoDB & Redis telemetry |
| `POST /api/auth/login` | Authenticate user and receive JWT + tenant profile |
| `POST /api/auth/register` | Register new user & provision isolated tenant workspace |
| `POST /api/auth/businesses` | Create an additional business entity under the authenticated user |
| `POST /api/auth/businesses/switch` | Switch active tenant context for multi-business users |
| `/api/tenants` | Tenant management, plan upgrades, and multi-tenant directory |
| `/api/dashboard` | Aggregated executive KPIs, velocity trends, and module summaries |
| `/api/ledger` | Double-entry Chart of Accounts, Journal Entries, Trial Balance, P&L, Balance Sheet & Valuation |
| `/api/bills` | Accounts payable & invoice CRUD operations |
| `/api/sales` | Sales pipeline opportunities & stage transitions |
| `/api/products` | Product SKU catalog & margin CRUD operations |
| `/api/customers` | Customer CRM accounts & LTV operations |
| `/api/stock` | Warehouse inventory & restock operations |
| `/api/revenue` | MRR, ARR, and vertical revenue telemetry |
| `/api/employees` | Workforce directory & role management (`admin` / `superadmin`) |
| `/api/vertical/retail` | Retail POS sessions, barcode checkout & register reconciliation |
| `/api/vertical/manufacturing` | Bills of Materials (BOM) & production work orders |
| `/api/vertical/saas` | SaaS subscription lifecycle & churn metrics |
| `/api/system` | Super Admin Redis cache inspector, cache flush & master data seeding |

---

## Testing & Verification Suites

The `backend/` directory includes automated end-to-end verification suites covering security, multi-tenancy, financial ledgers, and vertical workflows. With the backend server running on port `5000`, run:

```bash
node backend/test_milestone_p0.js          # Core Tenant Isolation & Auth Verification
node backend/test_milestone_p1.js          # Double-Entry Ledger & Financial Integrity
node backend/test_milestone_p2.js          # Vertical Workflows (POS, BOM/WorkOrders, SaaS)
node backend/test_milestone_p3.js          # Analytics & Caching Performance
node backend/test_security_suite.js        # Rate Limiting, RBAC & Injection Sanitization
node backend/test_multibusiness_suite.js   # Multi-Business Creation, Switching & Deletion
node backend/test_executive_financials.js  # CFO Valuation, Net Worth & Financial Ratios
node backend/test_employee_management.js   # Workforce CRUD & Role Governance
node backend/test_dashboard_velocity.js    # Real-Time Dashboard Telemetry & Velocity
```

---

## License

ISC © **ZSYIO BMS**
