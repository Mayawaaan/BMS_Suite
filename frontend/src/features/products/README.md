# Feature: Product Management & Catalog

## Architecture Isolation
Encapsulates product cataloging, SKU indexing, cost vs retail pricing margins, stock counts, and sales velocity metrics.

## Files
- `ProductsView.jsx`: Catalog grid/table, margin computation, search filter, and new SKU modal.
- `ProductsStyles.css`: Scoped card hover and margin pill styling.
- `ProductsAnimations.js`: Staggered card grid reveal and GSAP hover lifts.
- `ProductsService.js`: REST client hitting `/api/products`.

## Endpoints
- `GET /api/products`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
