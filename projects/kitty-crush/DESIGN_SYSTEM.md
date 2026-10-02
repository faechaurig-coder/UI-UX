# WHISKERFOLK — Premium Mobile Design System v0.1

## Quality bar
Premium-casual mobile: warm, tactile, elegant, character-first.

The interface should feel expensive because it is **controlled**, not because it has more effects.

## Composition
The world occupies 80–90% of meaningful visual attention.
UI floats only where necessary.

### Home
- no dashboard grid;
- one unobtrusive top status strip at most;
- contextual controls appear after tapping cat/object;
- collections live in bottom sheets;
- primary CTA appears only when the player has a clear next rescue beat.

### Puzzle
- board dominates;
- rescue objective visible as world context above/behind board;
- moves/objective compact;
- boosters secondary;
- no casino clutter.

## Visual DNA
### Base colors
- Ink: #27312E
- Soft ink: #51605B
- Milk: #FFF9EF
- Warm paper: #F5E9D7
- Moss: #6F8F78
- Sage light: #AFC8B4
- Caramel: #C88B5A
- Peach light: #F2C7A8
- Rain blue: #7896A6
- Night blue: #273B49

### Accent rule
One emotional accent per scene.
Do not run blue, purple, pink, green and gold simultaneously.

## Shape language
- radius family: 14 / 20 / 28;
- cards only when content genuinely needs containment;
- no nested-card labyrinth;
- large soft silhouettes;
- minimal borders;
- shadows broad and low-contrast.

## Typography
Use one rounded humanist sans family with:
- Display: 700
- Title: 650
- Body: 450–500
- Caption: 550

No more than 4 text sizes on a normal screen.

## Touch
- minimum 48 dp target;
- primary tap areas 56–64 dp;
- destructive/exit actions visually separated;
- back behavior always predictable.

## Motion
### UI
- 160–220ms micro transitions;
- 280–420ms sheets;
- ease-out for entry;
- ease-in for exit;
- no gratuitous bounce.

### World
Animals use slower asymmetric timing.
The cat may pause before completing an animation.

## Particle budget
Routine:
0–8 particles.
Special:
8–24.
Signature rescue moments:
controlled cinematic particles only when motivated by environment.

## Haptic hierarchy
1. micro selection — very light
2. match — light
3. special creation — medium-soft
4. rescue success — medium
5. box latch/open — distinctive single pulse
6. affection milestone — subtle double pulse

## Accessibility
- no color-only puzzle types;
- pattern/shape distinction;
- reduced motion mode;
- haptics toggle;
- subtitles/captions for meaningful vocalization cues;
- contrast target AA where text is involved;
- respect larger system text where possible.

## Performance
Visual quality must not depend on huge overdraw or 4K assets.
Use atlases, compressed textures, pooled FX, scene culling and limited simultaneous live actors.
