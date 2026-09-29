# UX / UI specification

## Product identity
Working name: **YaProbé**  
Tagline: **Recuerda lo que probaste. Decide mejor.**

Tone: helpful, sharp, curious, never preachy.

## Visual direction
- Background: warm off-white / near-white.
- Primary ink: almost-black.
- Accent: one vivid electric lime/green for “recognized / good / action”, used sparingly.
- Secondary accent: amber for rating stars.
- Cards: large radius, subtle border, almost no shadow.
- Product photography: isolated, bright and large.
- Typography: modern grotesk/system sans; strong numerical typography for scores.
- Motion: 150–250 ms; spring only for scan recognition and rating confirmation.
- Avoid gradients as decoration unless used as subtle score/progress treatment.

## Navigation
Bottom navigation, 3 destinations only:
1. **Inicio**
2. **Mis pruebas**
3. **Perfil**

A persistent central scan action visually dominates.

No “Community” tab in MVP. Community information appears inside product pages where it has context.

## Activation
No multi-page onboarding.

Screen 1:
**“No vuelvas a comprar algo que ya sabías que no te gustaba.”**
Primary CTA: **Escanear mi primer producto**
Secondary: **Ver cómo funciona**

Anonymous session starts immediately. Account protection is offered after value is created.

## Home
Header:
- YaProbé logo.
- Search field: “Producto, marca o código…”
- Large scan card: “Escanea antes de comprar”.

Sections:
- **Últimos que probaste** — horizontal product cards.
- **Tu top** — top 3 by personal rating / repurchase.
- **Tu memoria** — tiny summary: products rated, categories explored.
- Optional curiosity card only after enough data: “Tu perfil de café empieza a tomar forma”.

## Scan screen
Full-screen camera.
- Large central scan frame.
- Haptic success.
- Flash control.
- Manual barcode / search fallback.
- No extra copy while camera is active.

On recognition, product sheet rises immediately.

### Recognized + previously rated
The strongest state in the product:
**“Sí, ya lo probaste.”**
Then:
- product image/name/variant;
- Your score;
- “No lo comprarías otra vez” / “Sí lo repetirías”;
- last price;
- date;
- note;
- community below.

Primary CTA: **Actualizar mi opinión**
Secondary: **Comparar**

### Recognized + never rated
Product identity first.
Then:
**“Todavía no lo has calificado.”**
Primary CTA: **Lo probé**
Secondary: **Guardar para después**

### Unknown barcode
**“Aún no lo conocemos. Sé el primero en registrarlo.”**
Fields:
1. photo;
2. product name;
3. brand;
4. category.
Barcode prefilled and locked unless user edits.
Then fast rating.

## Rating sheet
Goal: 5–10 seconds.

1. **¿Qué te pareció?**
Five large tappable stars.

2. **¿Lo comprarías otra vez?**
Three segmented choices:
- Sí
- Tal vez
- No

3. Optional collapsed row:
**Precio y nota**
Expand only if touched.

Save CTA:
**Guardar en mi memoria**

After saving:
Short haptic + compact confirmation:
**“Listo. La próxima vez te lo recordaré.”**

## Product page hierarchy
1. Product identity.
2. **Tu opinión** (if exists).
3. **Comunidad**.
4. Price/value.
5. Notes.
6. Similar/alternatives later.

### Community card
Never show a naked average.

Example:
**4.3 ★**
**1,842 personas**
**78% lo compraría otra vez**

If sample is low:
**“Aún hay pocas opiniones para un promedio confiable.”**

## Mis pruebas
Default: recently rated.
Search stays visible.

Filters:
- Category.
- Stars.
- Buy again: yes/no/maybe.
- Price range later.

Sort:
- Recent.
- Highest rated.
- Lowest rated.
- Price.

Each row visually answers:
photo | product | stars | repurchase icon | last price

## Personal ranking
A core delight feature, not a separate complex mode.

Per category:
**Tus mejores cafés**
1. Product A — 4.8
2. Product B — 4.5
3. Product C — 4.1

This creates collection/progress without forcing consumption frequency.

## Curiosity mechanics
Use self-relevant questions:
- “¿Cuál es realmente tu café #1?”
- “Has probado 7 marcas. ¿Cuál repetirías?”
- “Tu calificación aquí es muy distinta a la comunidad.”
- “La última vez pagaste menos.”

Use sparingly and only when derived from real user data.

## Accessibility
- 44+ pt touch targets.
- Never encode recommendation only with color.
- Text contrast WCAG AA target.
- Stars have accessible labels.
- Scanner has manual fallback.
- Motion respects reduced-motion preference.

## UX performance targets
- Camera opens < 700 ms on typical mid-range Android after warm start.
- Barcode recognition → product sheet < 1.0 s when cached/network healthy.
- Existing-user rating flow: ≤ 3 taps after recognition for stars + repurchase + save.
- Search results begin rendering immediately; debounce network requests.
- Product page must never block on community aggregates before showing personal history.
