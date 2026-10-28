# Feature: Bills & Invoicing

## Architecture Isolation
This folder encapsulates all logic, UI, animations, and API interactions for the SaaS Accounts Payable and Invoicing system.

## Files
- `BillsView.jsx`: Main table, status filters, payment actions, and new invoice modal.
- `BillsStyles.css`: Custom overdue animations and billing highlights.
- `BillsAnimations.js`: Row entrance staggers and GSAP status flash indicators.
- `BillsService.js`: REST client for CRUD `/api/bills`.

## Endpoints
- `GET /api/bills`
- `POST /api/bills`
- `PUT /api/bills/:id/status`
- `DELETE /api/bills/:id`
