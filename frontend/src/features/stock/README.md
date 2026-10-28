# Feature: Stock & Inventory Management

## Architecture Isolation
Encapsulates multi-warehouse telemetry, real-time safety thresholds, reserved units, restock dispatches, and out-of-stock risk signals.

## Files
- `StockView.jsx`: Inventory telemetry table, health indicator bars, warehouse filtering, restock counter quick-actions, and item registration modal.
- `StockStyles.css`: Scoped meter and alert row backings.
- `StockAnimations.js`: Restock pulse and GSAP feedback effects.
- `StockService.js`: REST client hitting `/api/stock`.

## Endpoints
- `GET /api/stock`
- `POST /api/stock`
- `PUT /api/stock/:id`
- `DELETE /api/stock/:id`
