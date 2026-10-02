# Virtual expert committee

This is a design-review framework: a set of professional lenses used to challenge every product decision. It is not a claim that named external experts participated.

## 1. Consumer app product lead
Focus: repeatable utility, activation, retention, scope.
Decision: the product must solve a future purchase decision, not merely store ratings.

## 2. Mobile UX lead
Focus: thumb reach, scan speed, cognitive load, accessibility.
Decision: camera/scan is primary; forms become bottom sheets with progressive disclosure.

## 3. Google Play / Android release lead
Focus: target SDK, permissions, privacy declarations, testing, store-readiness.
Decision: request camera permission only when scanning; keep permissions minimal; design privacy/deletion before publication.

## 4. Behavioral psychologist
Focus: memory, self-relevance, curiosity, decision confidence.
Decision: engagement should come from **self-relevant unfinished knowledge** (“what do I actually like?”), recognition and progress—not artificial compulsion.

## 5. Cognitive neuroscience lens
Focus: salience, reward prediction, recognition memory.
Decision: use immediate recognition, contrast and micro-feedback after a scan. Do not use variable-reward mechanics designed to prolong sessions. The desired behavior is fast completion and return at the next real-world need.

## 6. Research / data science lead
Focus: validity, sample size, bias, recommender readiness.
Decision: store raw signals cleanly from day one; show sample sizes; use confidence-aware aggregates; do not overclaim personalization before enough data.

## 7. Trust & safety / privacy lead
Focus: consent, identifiable data, moderation, manipulation.
Decision: aggregate consumer insights may become a business, but identifiable histories must not be sold. Minimize location and demographic collection.

## 8. Monetization lead
Focus: sustainable revenue without damaging growth.
Decision: never cap the number of ratings/history in the free tier. The data network benefits when users log more. Monetize advanced intelligence, commerce/referrals and later B2B aggregated insights.

## 9. Growth / ASO lead
Focus: discoverability and shareable value.
Decision: store messaging should lead with the pain, not the database vision:
“¿Ya lo habías probado? Escanéalo y recuerda si valía la pena.”

## 10. Anti-fraud / reputation lead
Focus: rating manipulation, duplicates and spam.
Decision:
- one active rating per user/product;
- user can edit rather than spam multiple ratings;
- community score displays count and confidence;
- duplicate products can be merged;
- later add trust weighting and anomaly detection.

# Ethical engagement principles
The app should create curiosity through:
- “Your taste profile is becoming clearer.”
- “You rated 8 coffees; these are your top 3.”
- “You paid less for this last time.”
- “People with similar tastes disagree with the crowd.”

Avoid:
- infinite feed;
- random reward boxes;
- consumption streaks;
- push notifications that encourage alcohol or unnecessary purchasing;
- fake scarcity;
- deceptive paywalls.

Success means the user gets the answer quickly and leaves confident.
