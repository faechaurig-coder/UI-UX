# Monetization + privacy strategy

## Principle
The consumer app should grow the preference graph. Therefore the free product must encourage more legitimate ratings, not artificially restrict them.

## Do NOT paywall
- Number of products rated.
- Personal history.
- Barcode scanning.
- Basic community average.
- Basic search.
- Editing your own ratings.

Paywalling these harms retention and the network.

## Possible consumer premium later
Only after retention exists:
- Advanced taste profile and insights.
- Cross-product comparison.
- Smart recommendations.
- Household/shared memory.
- Advanced price history.
- CSV/PDF export.
- Watchlists / price alerts.
- Personal analytics by category.
- Optional ad-free tier if ads are ever used.

Digital premium sold in the Android app must follow Google Play billing rules.

## Commerce
Later:
- clearly disclosed affiliate links;
- retailer availability;
- price comparison;
- “buy again” shortcuts.

Promoted products must never silently alter organic community scores or recommendation logic.

## B2B long-term
Potential product:
**Aggregated consumer preference intelligence**

Examples:
- average rating;
- repurchase intent;
- value perception by price band;
- category benchmark;
- product-to-product switching;
- trend over time;
- aggregate taste clusters.

### Hard rule
Do not sell identifiable personal histories or sensitive/personal data.

B2B outputs should be aggregated with minimum cohort thresholds to reduce re-identification risk.

## Data minimization
MVP does not need:
- precise GPS;
- contacts;
- date of birth;
- gender;
- phone number;
- address.

Country/currency can be user-selected or coarse and optional.

## Accounts
Recommended activation:
- anonymous Supabase user at first launch;
- after 3 useful ratings, prompt:
  **“Protege tu memoria para no perderla.”**
- allow Google/email account linking.
- provide clear account/data deletion flow when identifiable accounts are enabled.

## Camera
Camera is used only when the user chooses scan/photo.
Do not request camera permission at first app launch.

## Photos
- One canonical product image per product/variant where possible.
- Compress client-side before upload.
- Strip EXIF metadata where practical.
- Avoid storing duplicate personal photos.
- Image moderation/reporting can be added as community submission grows.

## Storage economics
Supabase Free currently provides 1 GB file storage, 500 MB database, 5 GB egress and 50,000 MAU. It is enough for MVP validation if images are compressed and deduplicated.

Do not depend on paid server-side image transformations in MVP. Resize/compress on-device.

If image scale becomes the constraint:
- keep Supabase for auth/database;
- move product images behind an abstraction to Cloudflare R2 or another object store later.

## Trust
Every product score should preserve:
- rating count;
- repurchase count/percentage;
- timestamped aggregate;
- low-sample warning.

Future:
- verified barcode scan signal;
- abuse detection;
- trust weighting;
- rate limits;
- duplicate merge workflow.
