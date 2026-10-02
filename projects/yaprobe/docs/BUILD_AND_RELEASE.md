# Android build & release plan

## Stack locked for MVP
- Expo SDK 57 stable
- React Native 0.86
- Android target/compile API 36
- expo-camera for barcode scanning
- AsyncStorage for local-first persistence
- Supabase JS for auth/database/storage integration
- EAS Build for APK/AAB

## First local run
```bash
git checkout yaprobe-product-v1
cd projects/yaprobe/app
npm install
npx expo-doctor
npx expo start
```

Use a physical Android device. Camera/barcode behavior cannot be meaningfully validated only in a browser.

## Acceptance smoke test
1. Launch without Supabase credentials.
2. Home renders seeded history.
3. Tap scan; camera permission is requested only at that moment.
4. Tap “Probar demo” or scan demo barcode `7501234567890`.
5. Existing product opens and shows the previous personal rating before community data.
6. Edit rating.
7. Kill/relaunch app; edited rating persists.
8. Scan an unknown barcode.
9. Create product.
10. Rate it.
11. Verify it appears in “Mis pruebas”.
12. Search/filter history.

## Supabase integration
Before cloud sync:
1. Create project.
2. Run `supabase/schema.sql`.
3. Enable Anonymous Sign-Ins.
4. Add app environment variables.
5. Test RLS with two different anonymous sessions.
6. Add CAPTCHA / abuse controls before opening public product creation at scale.
7. Configure product image bucket and policies after the text-only sync path is stable.

## Preview APK
```bash
npm i -g eas-cli
eas login
eas build --platform android --profile preview
```

## Production AAB
```bash
eas build --platform android --profile production
```

Package ID: `com.echauriapps.yaprobe`

## Google Play gates
Before closed testing:
- finalized icon + feature graphic + screenshots;
- privacy policy URL;
- Data safety form aligned with actual SDK/data behavior;
- content rating questionnaire;
- camera permission disclosure;
- account deletion flow before permanent accounts are generally available;
- verify current Play testing requirements for the developer account;
- internal QA on at least one low/mid-range Android device.

## Do not add yet
- feed
- followers
- comments
- badges/streaks
- AI recommendations
- affiliate shopping
- B2B dashboard

Those are post-retention bets. First prove scan → remember → decide.
