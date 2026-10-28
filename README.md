# OmniPulse™ — Enterprise Multi-Module Analytics SaaS Platform

> A commercial-grade, multi-developer SaaS architecture designed for tracking **Bills**, **Sales Pipeline**, **Product Management & SKUs**, **Revenue & MRR Analytics**, **Customer CRM**, and **Stock & Global Inventory**.

---

## 🌟 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 + Vite |
| **Styling & Design System** | Tailwind CSS v4 + Cyber Glassmorphic Tokens |
| **Smooth Scrolling** | Lenis Smooth Scroll Engine |
| **Entrance & Counter FX** | GSAP (GreenSock Animation Platform) |
| **Interactive Micro-UI** | Framer Motion (Modals, Kanban boards, drawers) |
| **Data Visualization** | Vector SVG Sparklines & Financial Velocity Graphs |
| **Backend Engine** | Node.js + Express (ES Modules) |
| **Database & Resilience** | MongoDB (Mongoose Schemas) + Resilient In-Memory Fallback |

---

## 🏗️ Multi-Developer Modular Architecture

Every single feature is strictly isolated into its own domain folder containing its **dedicated UI component**, **scoped CSS stylesheet**, **animation configurations**, **API connector**, and **developer documentation**:

```
d:\Websites\CRM\
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongo connector with auto-mock fallback
│   ├── models/                   # Mongoose Schemas (Bill, Sale, Product, Customer, Stock, Revenue)
│   ├── controllers/              # Isolated CRUD controllers
│   ├── routes/                   # Isolated REST API endpoints
│   ├── data/
│   │   └── seedData.js           # Production-like mock & seed database
│   └── server.js                 # Express API server (Port 5000)
│
└── frontend/
    └── src/
        ├── core/                 # Shared framework layout, Lenis scroller, API client
        │   ├── layout/           # Sidebar, Header, MainLayout
        │   ├── providers/        # SmoothScrollProvider (Lenis)
        │   └── services/         # apiClient.js
        │
        ├── features/             # 🚀 ISOLATED FEATURE MODULES
        │   ├── dashboard/        # Executive Pulse & Cross-Module Intelligence
        │   │   ├── DashboardView.jsx
        │   │   ├── DashboardStyles.css
        │   │   ├── DashboardAnimations.js
        │   │   ├── DashboardService.js
        │   │   └── README.md
        │   ├── bills/            # Module 1: Bills & Invoicing
        │   │   ├── BillsView.jsx
        │   │   ├── BillsStyles.css
        │   │   ├── BillsAnimations.js
        │   │   ├── BillsService.js
        │   │   └── README.md
        │   ├── sales/            # Module 2: Sales Pipeline & Deals
        │   │   ├── SalesView.jsx
        │   │   ├── SalesStyles.css
        │   │   ├── SalesAnimations.js
        │   │   ├── SalesService.js
        │   │   └── README.md
        │   ├── products/         # Module 3: Product Catalog & Pricing
        │   │   ├── ProductsView.jsx
        │   │   ├── ProductsStyles.css
        │   │   ├── ProductsAnimations.js
        │   │   ├── ProductsService.js
        │   │   └── README.md
        │   ├── revenue/          # Module 4: Revenue & MRR Velocity
        │   │   ├── RevenueView.jsx
        │   │   ├── RevenueStyles.css
        │   │   ├── RevenueAnimations.js
        │   │   ├── RevenueService.js
        │   │   └── README.md
        │   ├── customers/        # Module 5: Customer CRM & Accounts
        │   │   ├── CustomersView.jsx
        │   │   ├── CustomersStyles.css
        │   │   ├── CustomersAnimations.js
        │   │   ├── CustomersService.js
        │   │   └── README.md
        │   └── stock/            # Module 6: Stock & Multi-Hub Inventory
        │       ├── StockView.jsx
        │       ├── StockStyles.css
        │       ├── StockAnimations.js
        │       ├── StockService.js
        │       └── README.md
        │
        └── shared/               # Reusable GlassCards, StatCards, Badges, Modals
```

---

## ⚡ Key Highlights

1. **Multi-Developer Collaboration**: Developers can work on separate modules (e.g., Developer A on `features/bills`, Developer B on `features/stock`) without merging or style collisions.
2. **Resilient Backend Data Layer**: Connects to MongoDB (`mongodb://127.0.0.1:27017/crm_saas`). If MongoDB is not running locally, the server continues in **Resilient In-Memory Mode** so everything remains 100% interactive out-of-the-box.
3. **Buttery Smooth Scroll**: Integrated with **Lenis** for silky inertial scrolling.
4. **Interactive GSAP & Framer Motion UI**: GSAP power-easing counters, Framer spring-stepper Kanban transitions, and reactive alert badges.
5. **Full REST API Suite**: Dedicated endpoints for every module:
   - `/api/dashboard` (Summary telemetry)
   - `/api/bills` (Accounts payable & invoices)
   - `/api/sales` (Pipeline opportunities & stages)
   - `/api/products` (SKU catalog & profit margins)
   - `/api/revenue` (MRR/ARR growth metrics)
   - `/api/customers` (CRM client accounts & LTV)
   - `/api/stock` (Regional warehouse inventory & threshold alerts)
   - `/api/health` (Service telemetry check)

---

## ⚡ Redis Key-Value Engine & High-Speed Caching

The platform includes a **Dual-Engine Redis Layer** (`backend/config/redis.js`):
- **Live Redis Client**: Connects via `ioredis` to `REDIS_URL` (`redis://127.0.0.1:6379` by default or remote cloud Redis like Upstash / Redis Cloud).
- **Virtual Redis Fallback**: If a live Redis daemon is not detected, it immediately provides a high-speed, zero-crash in-memory Redis engine supporting exact Redis commands (`get`, `set`, `del`, `delByPattern`, `keys`, `flushAll`, `ttl`, `getStatus`, `getKeyDetails`).
- **Sub-2ms Lookups**: All requests to Bills, Sales, Products, Customers, Stock, Revenue, and Dashboard check Redis first (`X-Cache: HIT`), returning responses in under 2ms.
- **Auto-Invalidation**: Whenever an item is created, modified, or deleted, corresponding Redis keys (`crm:bills:*`, `crm:dashboard:*`, etc.) are automatically purged.

---

## 🌱 Master Data Seeding

To seed rich demo data across all 6 business verticals (`shop`, `factory`, `industry`, `software`, `ecommerce`, `all`):

```bash
cd backend
npm run seed
```

Or trigger directly from the UI in the **Super Admin Control Center** via the **"Run Master Seed Now"** button (`POST /api/system/seed`).

---

## 🛡️ Super Admin Control Center & RBAC

The platform features a **Super Admin Command Center** (God Mode):
- **Clearance Level**: Supreme platform architect access over all modules, cross-vertical governance, and system telemetry.
- **Redis Cache Inspector**: Live hit/miss telemetry, memory usage, key count, interactive key browser, and "Flush Redis Cache" actions.
- **Master Data Seeder**: 1-click database & Redis cache reload.
- **User Governance Directory**: View all registered accounts across company verticals and promote/demote any user to `superadmin`, `admin`, `manager`, `staff`, or `auditor`.
- **Multi-Tenant Override**: Audit the application across any operating vertical in real time.

### 🔑 Demo Accounts & Credentials (Password: `password123`)

| Persona | Role | Company Vertical | Email | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Elena Vance** | `superadmin` (Supreme Architect) | Universal (`all`) | `elena.vance@omnipulse.io` | `password123` |
| **Raj Patel** | `admin` (Store Proprietor) | Retail Shop (`shop`) | `raj.patel@metromart.com` | `password123` |
| **Maya Lin** | `staff` (Counter Cashier) | Retail Shop (`shop`) | `maya.cashier@metromart.com` | `password123` |
| **Vikram Malhotra** | `admin` (Plant Director) | Factory & Mfg (`factory`) | `vikram.m@apexmanufacturing.com` | `password123` |
| **Hans Gruber** | `manager` (Operations Lead) | Factory & Mfg (`factory`) | `hans.g@apexmanufacturing.com` | `password123` |
| **Alastair Sterling** | `admin` (VP Engineering) | Heavy Industries (`industry`) | `a.sterling@nationalinfra.gov` | `password123` |
| **Marcus Vance** | `admin` (CTO & Co-Founder) | Software SaaS (`software`) | `marcus.v@apextech.io` | `password123` |
| **Chloe Bennett** | `admin` (Brand Director) | E-Commerce (`ecommerce`) | `chloe.b@veloxd2c.com` | `password123` |
| **David Chen** | `auditor` (Financial Auditor) | Universal (`all`) | `d.chen@compliance-audit.org` | `password123` |

---

## 🚀 Quickstart

### Start Everything Simultaneously:
```bash
npm run dev
# Launches both backend (port 5000) and frontend (port 5173) concurrently
```

#   B M S _ S u i t e  
 