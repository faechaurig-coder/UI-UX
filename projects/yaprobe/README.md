# YaProbé — Product Memory & Consumer Preference Platform

> Working title. EchauriApps. Started 2026-09-28.

## One-line idea
Scan a physical product, remember whether you liked it, and make a better decision the next time you see it.

## The problem
People repeatedly buy products they have already tried because they do not remember the exact brand, variant, price, or their own opinion. Existing solutions are either narrow (wine/beer), generic rating notebooks with weak utility, or overloaded social/commerce products.

## Product thesis
YaProbé is not "rate anything." It is a **memory layer for physical consumer products**.

Core loop:

**See product → Scan → Recognize → Rate in seconds → Remember later → Benefit from the community → Improve recommendations over time**

The product must be useful with one user and become more valuable as the shared product catalog and aggregated ratings grow.

## North-star promise
**“Before you buy it again, know what you thought last time.”**

## MVP
- Anonymous-first onboarding.
- Barcode scanner as the primary action.
- Global product catalog keyed by barcode/variant.
- Fast rating: 1–5 stars + Buy again? Yes / Maybe / No.
- Optional price and short note.
- Personal history.
- Personal top products.
- Community average when confidence is sufficient.
- Product creation when barcode is unknown.
- Compressed canonical product image.
- Supabase backend with Row Level Security.

## Strategic differentiation
1. Physical products only in V1.
2. Personal memory first; social/community second.
3. No feed, followers, chat or noisy gamification.
4. No limit on personal history in the free core.
5. Community score never overrides “Your opinion”.
6. One canonical product/variant, many ratings.
7. Price + repurchase intent become first-class signals.
8. Trust and transparency are product features, not compliance afterthoughts.

## Future moat
- Consumer preference graph.
- Taste/profile vectors by category.
- Similar-user recommendations.
- Price/value intelligence.
- Aggregated anonymous consumer insights for brands.
- Retail/affiliate integrations.
- Household/shared lists.

## Design personality
Clean, bright, tactile, fast, curious, confident. Product photography is the visual hero. The UI should feel closer to a premium shopping assistant than a spreadsheet or review forum.

## Current status
Research and product design in progress on branch `yaprobe-product-v1`.
See:
- `PROJECT_STATUS.md`
- `docs/RESEARCH.md`
- `docs/EXPERT_COMMITTEE.md`
- `docs/UX_UI_SPEC.md`
- `docs/MONETIZATION_PRIVACY.md`
- `supabase/schema.sql`
- `prototype/index.html`

## Repository note
This folder is temporarily hosted inside the UI-UX repository because the current GitHub connector can edit repositories but cannot create a new repository. It should be migrated to a dedicated `YaProbe` repository when repository creation is available.
