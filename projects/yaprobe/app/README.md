# YaProbé mobile MVP

Expo SDK 57 / React Native 0.86.

## Run locally

```bash
cd projects/yaprobe/app
npm install
npx expo start
```

Use Expo Go on a physical Android device for camera/barcode testing.

The app deliberately works **without Supabase credentials**. In that mode it uses AsyncStorage and seeded demo products so product/UX work is never blocked by backend setup.

### Demo barcodes
- `7501234567890` → Cabernet Reserva
- `7501234567891` → Colombia Intenso
- `7501234567892` → Chocolate 70%

The scanner also has a “Probar demo” action so the flow can be tested without printing a barcode.

## Connect Supabase

1. Create a Supabase project.
2. Run `../supabase/schema.sql` in the SQL editor.
3. Enable Anonymous Sign-Ins in Auth.
4. Copy `.env.example` to `.env`.
5. Fill:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
6. Do not commit `.env`.

The current UI remains local-first while the remote sync adapter is integrated. `src/supabase.ts` already includes persistent React Native auth and anonymous session bootstrapping.

## Android
Package:
`com.echauriapps.yaprobe`

SDK 57 targets Android API 36.

## Product principle
The app should give value in seconds:

**scan → recognize → remember → decide**

Do not add social/feed/AI scope until this loop is excellent.
