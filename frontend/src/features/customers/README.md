# Feature: Customer CRM & Client Data

## Architecture Isolation
Encapsulates account profiles, contact points, client lifecycle status (`Active`, `Lead`, `Churned`), lifetime value (LTV), and deal associations.

## Files
- `CustomersView.jsx`: Client directory table, status filtering, customer lifetime spend tracking, and customer onboarding modal.
- `CustomersStyles.css`: Scoped hover states and avatar highlight rings.
- `CustomersAnimations.js`: Staggered list reveals and contact actions.
- `CustomersService.js`: REST client hitting `/api/customers`.

## Endpoints
- `GET /api/customers`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `DELETE /api/customers/:id`
