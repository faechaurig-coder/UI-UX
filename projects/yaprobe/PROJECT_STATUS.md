# PROJECT STATUS — YaProbé

**Owner brand:** EchauriApps  
**Started:** 2026-09-28  
**Stage:** Product design + interactive prototype  
**Temporary GitHub location:** `faechaurig-coder/UI-UX/projects/yaprobe`  
**Branch:** `yaprobe-product-v1`

## What this project is
A mobile app for remembering physical products a user has tried and turning those personal ratings into a useful community product database over time.

## Locked decisions
- V1 focuses on physical consumer products, not “anything”.
- Barcode scanning is the primary entry point.
- Personal utility must exist before network effects.
- Rating flow target: under 10 seconds after product recognition.
- Core rating = stars + repurchase intent.
- Price is optional but structured.
- Product photos are canonical/shared, not duplicated per rating.
- Supabase is the preferred MVP backend.
- Anonymous-first authentication to remove signup friction.
- No social feed, streaks, followers, chat or AI in MVP.
- No sale of identifiable personal user data.
- UI must prioritize speed, memory and confidence.

## In progress
- Competitive research.
- Information architecture.
- Visual design system.
- Interactive static prototype.
- Supabase schema and RLS design.

## Not started
- Production React Native / Expo app.
- Supabase project provisioning.
- Camera/barcode integration.
- Image upload/compression implementation.
- Play Console package and store listing.
- Closed testing track.

## Next technical milestone
Convert the approved prototype into an Expo/React Native application targeting the current Google Play API requirement, connect Supabase, and implement scan → product → rate → history end-to-end.

## Definition of MVP done
A new Android user can install, start without mandatory signup, scan or manually add a product, rate it, close the app, return later, scan the same product, and immediately see their prior rating plus safe aggregate community data.

## Known external requirement
If publishing through a new personal Play developer account subject to Google’s testing rule, production access requires a closed test with at least 12 opted-in testers continuously for 14 days.

## Handoff rule
Any agent continuing this project must read, in order:
1. README.md
2. PROJECT_STATUS.md
3. docs/RESEARCH.md
4. docs/EXPERT_COMMITTEE.md
5. docs/UX_UI_SPEC.md
6. supabase/schema.sql
