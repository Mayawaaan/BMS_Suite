# Feature: Revenue & MRR Analytics

## Architecture Isolation
Encapsulates SaaS financial metrics, recurring subscription expansion, profit margins, monthly trend comparisons, and revenue diversification breakdown.

## Files
- `RevenueView.jsx`: MRR/ARR velocity cards, monthly trends chart, profit vs expenses bars, and revenue source breakdown.
- `RevenueStyles.css`: Custom glowing gradient cards and animated progress bars.
- `RevenueAnimations.js`: GSAP bar chart staggers and numerical easing.
- `RevenueService.js`: REST client hitting `/api/revenue`.

## Endpoints
- `GET /api/revenue`
- `PUT /api/revenue/target`
