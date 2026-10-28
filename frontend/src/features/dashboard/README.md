# Module: Executive Dashboard

## Overview
This module aggregates real-time SaaS KPIs across Bills, Sales, Product Management, Revenue, Customers, and Stock.

## Files
- `DashboardView.jsx` - Main React presentation and widget layout.
- `DashboardStyles.css` - Scoped styles, mesh glows, activity feed styles.
- `DashboardAnimations.js` - GSAP hero entrance & Framer Motion child staggers.
- `DashboardService.js` - API connector hitting `/api/dashboard`.

## Backend Endpoint
- `GET /api/dashboard` -> Returns aggregated KPIs, alerts, and cross-module activity stream.
