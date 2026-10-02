# PROJECT STATUS — YaProbé

**Owner brand:** EchauriApps  
**Started:** 2026-09-28  
**Stage:** Functional mobile MVP scaffold + backend design  
**Temporary GitHub location:** `faechaurig-coder/UI-UX/projects/yaprobe`  
**Branch:** `yaprobe-product-v1`  
**Draft PR:** #1

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
- Anonymous-first authentication removes signup friction.
- Local-first behavior prevents backend/configuration from blocking UX testing.
- No social feed, streaks, followers, chat or AI in MVP.
- No sale of identifiable personal user data.
- UI prioritizes speed, memory and decision confidence.

## Completed
- Competitive research and market framing.
- Virtual expert committee review.
- Information architecture and visual design system.
- Interactive browser prototype.
- Supabase schema + initial RLS design.
- Expo SDK 57 / React Native 0.86 application scaffold.
- Android package configuration: `com.echauriapps.yaprobe`.
- Real barcode scanner screen with `expo-camera`.
- Camera permission requested only when entering scanner.
- Known product lookup.
- Unknown product creation flow.
- Rating flow: stars + buy again + optional price/note.
- Persistent local history with AsyncStorage.
- Personal history filters/search.
- Product detail with “Your opinion” before “Community”.
- Personal ranking/profile screen.
- Optional Supabase client and anonymous-session bootstrap.
- Supabase repository adapter for lookup, own rating, save rating and aggregate stats.
- EAS preview/production build profiles.
- Android build/release runbook.
- GitHub CI workflow definition for TypeScript + Expo Doctor.

## Pending external connection / validation
- Dedicated `YaProbe` GitHub repository: current GitHub connector can edit repos but does not expose repo creation.
- Supabase project provisioning: schema is ready. A Supabase integration was suggested so it can be configured directly from ChatGPT once connected.
- Real device smoke test of camera/barcode.
- Product image capture, compression and upload.
- Cloud/local synchronization conflict policy.
- Real aggregate stats in the mobile UI.
- Production account-linking flow.
- App icon, Play feature graphic and screenshots.
- Privacy policy URL.
- Play Console closed/internal testing setup.

## Current MVP behavior
Without Supabase credentials the application remains testable:
1. launch;
2. scan a real barcode or tap demo scan;
3. recognize seeded products;
4. see previous personal opinion;
5. edit/save rating;
6. persist the change locally;
7. scan an unknown barcode;
8. create and rate the product;
9. find it later in “Mis pruebas”.

Demo barcode: `7501234567890`.

## Next technical milestone
Connect a real Supabase project, run `supabase/schema.sql`, enable anonymous sign-ins, wire the cloud repository into the local-first store, then perform an Android physical-device smoke test.

## Definition of MVP done
A new Android user can install, start without mandatory signup, scan or manually add a product, rate it, close the app, return later, scan the same product, and immediately see their prior rating plus safe aggregate community data.

## Handoff rule
Any agent continuing this project must read, in order:
1. README.md
2. PROJECT_STATUS.md
3. docs/RESEARCH.md
4. docs/EXPERT_COMMITTEE.md
5. docs/UX_UI_SPEC.md
6. docs/BUILD_AND_RELEASE.md
7. supabase/schema.sql
8. app/README.md
