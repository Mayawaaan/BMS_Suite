# Feature: Sales & Deals Pipeline

## Architecture Isolation
Encapsulates Kanban pipeline stages (`Prospect`, `Qualified`, `Proposal`, `Closed Won`), deal value calculations, probability progression, and sales rep tracking.

## Files
- `SalesView.jsx`: Interactive deal pipeline board, deal detail cards, stage switcher, and new deal creation.
- `SalesStyles.css`: Scoped pipeline board and glowing won deal states.
- `SalesAnimations.js`: Framer spring motion and GSAP victory indicators.
- `SalesService.js`: REST client hitting `/api/sales`.

## Endpoints
- `GET /api/sales`
- `POST /api/sales`
- `PUT /api/sales/:id/stage`
- `DELETE /api/sales/:id`
