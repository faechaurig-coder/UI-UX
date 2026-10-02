# KITTY PROJECT — MASTER EXECUTION PLAN

## 1. Executive verdict

### VERDICT: MODIFY — strong concept, insufficiently proven product

The original concept contains a potentially powerful emotional core:

**puzzle → rescue → cat → home → interaction → decoration → return**

But in its earlier framing, the risk was that the cat became a reward attached to an otherwise generic match-3. That is not defensible enough.

The reinvention is:

**rescue fantasy first; puzzle second.**

The core opportunity is not to outperform Royal Match at content volume, economy sophistication or level production. The opportunity is to create a player relationship that those products do not center:

> **“I found this cat, I helped it, it learned to trust me, and now it lives in my home.”**

This changes the core product from a puzzle game with a pet meta into an emotional rescue-and-coexistence game powered by puzzles.

---

## 2. Current-state audit

### 2.1 What exists as product direction

Approved or strongly supported concepts already exist:

- cats are rescued rather than merely unlocked;
- rescued cats remain permanently in the home;
- the home becomes progressively more alive;
- decoration, toys, outfits and spaces support expression;
- cats must have distinct personalities;
- the emotional rescue moment is more important than a generic reward chest;
- one small but deep home is preferred over many empty rooms;
- monetization should lean toward identity, expression and collection;
- the first validation target is attachment to Mochi.

### 2.2 What does NOT yet exist

There is no dedicated production repository in the connected GitHub account.

Therefore the following are not yet proven:

- production architecture;
- actual visual style;
- actual Mochi design;
- implemented onboarding;
- implemented rescue arc;
- implemented living-room AI;
- integrated rescue-puzzle objectives;
- production-ready animation system;
- audio language;
- final economy;
- live analytics;
- tested D1/D7 retention;
- tested attachment.

This is a **preproduction project**, not a game that is ready for content scaling.

---

## 3. Candidate technical foundations reviewed

### A. immane/match3-pets

Relevant strengths:

- Godot 4.6 .NET + C#;
- 8×8 board;
- match detection;
- cascades;
- bombs/rainbow/cross specials;
- gravity and spawn systems;
- deadlock checking;
- object pooling;
- 14-state game state machine;
- event bus;
- dynamic board scaling;
- pet data/services;
- room showcase;
- currency layer;
- 41 tests across 10 test files.

Useful as a **technical accelerator**, not as product identity.

Major conflicts with our vision:

- 30-second countdown;
- score-attack framing;
- gacha acquisition;
- pity system;
- pet needs;
- pet collection as reward system;
- multiple pet species;
- “pull” economy rather than rescue relationship.

### B. iuhoay/cat-run

Useful ideas:

- autonomous cat movement;
- room objects;
- target-based movement;
- state transitions such as idle/walk/sleep/eat;
- simple room interaction loop.

Conflicts:

- hunger/thirst/hygiene decay;
- obligation-based maintenance;
- explicit refill timers;
- care loop can become chores.

Use only as a behavioral reference.

---

## 4. Product gap

| Area | Current state | Target state |
|---|---|---|
| Fantasy | Cats as reward/meta | Rescue, trust and coexistence |
| First session | Undefined | 10–15 minute Mochi emotional arc |
| Puzzle | Generic match-3 candidate | Rescue-context puzzle language |
| Cat | Collectible asset | Character with memory/personality |
| Home | Decoration destination | Living place worth opening by itself |
| Collection | Broad/unfocused | 4 clear collection territories |
| Monetization | Undecided / gacha risk | Identity, home and expression |
| Retention | Level progression | Attachment + curiosity + progression |
| Virality | Share button risk | Naturally shareable cat moments |
| Content | Potential scale-first | Attachment-first vertical slice |
| Technical | No owned repo | Dedicated maintainable Kitty codebase |

---

# 5. Master roadmap

## PHASE 0 — PREPRODUCTION SOURCE OF TRUTH
**Status:** COMPLETED

### Objective
Prevent contradictory development and establish a canonical product direction.

### Deliverables
- master roadmap;
- product bible;
- technical foundation report;
- GO/MODIFY criteria;
- constraints.

### Acceptance
Any future agent should be able to understand the product without prior chat history.

---

## PHASE 1 — PRODUCT LOCK + NAMING TERRITORY
**Status:** NOT STARTED

### Objective
Lock the commercial fantasy before implementation.

### Define
- one-sentence fantasy;
- target audience;
- emotional promise;
- core loop;
- emotional loop;
- meta loop;
- differentiation;
- non-goals;
- naming criteria.

### Naming requirement
“Kitty Crush” remains a codename only.

Generate at least 30 names and evaluate:

- memorability;
- international pronunciation;
- cat association without genericity;
- ability to become an IP;
- trademark/store collision risk;
- visual branding potential.

### Acceptance
A stranger can hear one sentence and understand why this is not “another match-3”.

---

## PHASE 2 — MOCHI CHARACTER BIBLE
**Status:** NOT STARTED

### Objective
Make one cat worth caring about before creating eight.

### Mochi must have
- silhouette;
- coat/markings;
- eyes;
- body proportions;
- personality;
- fears;
- likes;
- dislikes;
- quirks;
- comfort object;
- favorite location;
- trust states;
- reaction vocabulary;
- signature pose;
- signature sound;
- signature behavior;
- relationship arc;
- commercial/IP recognizability.

### Behavioral principle
Mochi must still be interesting when the player does nothing.

### Minimum animation design
- breathe;
- blink;
- ear twitch;
- tail idle;
- cautious walk;
- normal walk;
- run;
- sit;
- lie down;
- sleep;
- wake;
- stretch;
- sniff;
- hide;
- peek;
- startled;
- curious;
- playful;
- approach;
- retreat;
- accept affection;
- seek attention.

### Acceptance
A static silhouette plus two or three behaviors should identify Mochi.

---

## PHASE 3 — MOCHI VERTICAL SLICE SCRIPT
**Status:** NOT STARTED

### Objective
Design the first 10–15 minutes before mass production.

### Emotional sequence
**curiosity → concern → effort → trust → danger → rescue → relief → belonging**

### Target flow

#### Minute 0:00–1:00 — Cold open
- rain/ambient sound;
- cardboard box;
- quiet movement;
- first small meow;
- glimpse of eyes;
- no menu overload.

#### 1:00–3:30 — First help
Goal: obtain food or warmth.

Puzzle tutorial is embedded in helping Mochi.

#### 3:30–5:00 — First trust response
Mochi does not immediately become affectionate.

He:
- watches;
- hesitates;
- sniffs;
- retreats;
- returns.

#### 5:00–7:30 — Second help
Shelter/material/warmth objective.

Puzzle vocabulary remains connected to the scene.

#### 7:30–9:30 — Threat escalation
A safe, non-traumatic but emotionally legible danger:
- weather;
- street movement;
- unstable shelter;
- sudden noise.

The player should think:
**“I need to get him out of here.”**

#### 9:30–11:30 — Rescue climax
A short, more deliberate interactive puzzle sequence.

#### 11:30–13:00 — Release
Quiet transition. No reward spam.

#### 13:00–15:00 — The Box Moment
Mochi arrives home.

Sequence:
1. transport box is placed;
2. silence;
3. small movement;
4. ears/eyes appear;
5. cautious exit;
6. room scan;
7. hide;
8. re-emerge;
9. discover first favorite spot;
10. settle.

Final message:

> **MOCHI NOW LIVES WITH YOU.**

### Acceptance
The ending should create a stronger emotional peak than a conventional “Level Complete” screen.

---

## PHASE 4 — DEDICATED TECHNICAL FOUNDATION
**Status:** BLOCKED BY DEDICATED REPO CREATION

### Preferred direction
Use Godot 4.x + C# unless implementation discovery proves another stack superior.

### Why
The reviewed open-source base already demonstrates:
- deterministic board logic;
- testability;
- mobile renderer setup;
- dynamic layout;
- event-driven architecture;
- object pooling.

### Reuse candidate
From a legal/technical standpoint, MIT-licensed components from `match3-pets` can be adapted if the required license notice is retained.

Candidate reusable concepts/classes:
- BoardData;
- MatchDetector;
- GravitySystem;
- SpawnSystem;
- ValidMoveChecker;
- ScoreCalculator only if converted from score focus to objective focus;
- TileManager/object pool;
- AnimationController patterns;
- GameStateMachine;
- EventBus;
- persistence interfaces.

### Do not inherit blindly
- GachaDrawService;
- pity;
- generic pet acquisition;
- timer pressure;
- pet hunger/energy;
- score-attack framing.

### Acceptance
A dedicated Kitty repo builds cleanly and has automated tests for the board core before visual expansion.

---

## PHASE 5 — RESCUE PUZZLE SYSTEM
**Status:** NOT STARTED

### Objective
Stop the puzzle from feeling like a disconnected minigame.

### Design
Create contextual objectives such as:
- food;
- blankets;
- pawprints;
- shelter pieces;
- water drops;
- toy pieces;
- medicine only if handled appropriately;
- keys/doors;
- safe-path obstacles.

### Critical rule
Text alone cannot re-skin a generic objective.

Bad:
“Match 30 red pieces — this helps Mochi.”

Better:
The board uses world objects and blockers that visibly advance the rescue state.

### Keep
- cascades;
- special-piece satisfaction;
- combo readability;
- board responsiveness.

### Change
- score hierarchy;
- timer pressure;
- meaningless colors;
- generic win state.

### Acceptance
A spectator understands what the puzzle is accomplishing in the rescue.

---

## PHASE 6 — LIVING ROOM / ILLUSION OF LIFE
**Status:** NOT STARTED

### Objective
Make the home worth opening even without a puzzle.

### MVP
- one room;
- Mochi;
- 5–8 meaningful objects;
- navigation;
- resting spots;
- toys;
- hiding spots;
- window/visual focus;
- autonomous behavior.

### Behavior model
Use a lightweight utility/state architecture:

**personality + current context + environment + relationship + weighted randomness**

Potential states:
- idle;
- observe;
- patrol;
- rest;
- sleep;
- play;
- investigate;
- hide;
- seek player;
- seek object;
- react to sound;
- interact with another cat later.

### Critical anti-pattern
Do not use hunger/thirst/hygiene timers as primary retention.

### Principle
**Attachment without guilt.**

### Acceptance
During a 60-second no-input test, Mochi should create at least one believable, charming behavior without feeling hyperactive.

---

## PHASE 7 — PREMIUM-CASUAL ART DIRECTION
**Status:** NOT STARTED

### Target
Top-tier mobile polish, not hyperrealism.

### Visual attributes
- warm;
- tactile;
- rounded;
- cozy;
- expressive;
- readable;
- restrained;
- distinctive.

### Avoid
- template UI;
- random gradients;
- excessive glassmorphism;
- childish stock art;
- emoji as production art;
- inconsistent illustration;
- noisy HUD;
- generic mobile buttons;
- unnecessary particles.

### Character priority
Mochi > environment > puzzle > secondary UI.

### Environment
The room should feel:
- lived-in;
- layered;
- soft-lit;
- spatially readable;
- interactive;
- photographable.

### Acceptance
A screenshot without the logo should still look like it belongs to the same universe.

---

## PHASE 8 — UX, MOTION, AUDIO AND HAPTICS
**Status:** NOT STARTED

### UX
- one primary action per screen;
- minimal HUD during emotional moments;
- no dashboard-first home;
- large touch targets;
- no color-only puzzle readability;
- clear back behavior;
- predictable navigation.

### Motion
Animation is P0, not polish-later.

Use:
- anticipation;
- easing;
- follow-through;
- micro-pauses;
- soft secondary motion.

Avoid:
- constant bouncing;
- excessive screen shake;
- confetti for routine actions.

### Audio
Build a layered language:
- rain;
- box/cardboard;
- paws;
- fabric;
- purr;
- meow variants;
- room ambience;
- toy;
- match;
- cascade;
- rescue;
- home arrival.

### Haptics
Reserve hierarchy for:
- selection;
- special creation;
- combo impact;
- rescue;
- box opening;
- meaningful affection.

### Acceptance
The game feels pleasant with headphones and restrained with sound off.

---

## PHASE 9 — FOUR COLLECTION TERRITORIES
**Status:** NOT STARTED

### Exactly four for MVP

1. **Catbook** — rescued cats, story, personality, bond.
2. **Memories** — photos, firsts, special moments.
3. **Home** — furniture, toys, interactive objects.
4. **Style** — collars, light outfits, accessories.

### Acceptance
Every collection serves attachment or expression.

---

## PHASE 10 — MULTI-CAT EXPANSION TO EIGHT
**Status:** NOT STARTED

### Only starts after Mochi passes validation.

Each cat must have:
- unique silhouette;
- unique rescue context;
- personality;
- signature behavior;
- favorite object;
- relationship tendencies;
- emotional arc.

### Rule
Do not create eight color variants of the same actor.

---

## PHASE 11 — ETHICAL MONETIZATION PROTOTYPE
**Status:** NOT STARTED

### Priority
Monetize:
- identity;
- home;
- self-expression;
- optional collection;
- seasonal aesthetics.

Potential:
- cosmetic sets;
- collars/accessories;
- premium furniture;
- room themes;
- optional passes after value is proven;
- rewarded ads only when truly optional.

Avoid as core:
- punitive lives;
- forced wait;
- aggressive revive spend;
- gacha as primary cat acquisition;
- casino presentation;
- guilt-based care.

### Acceptance
A purchase can be explained as:
**“I want this for my cat/home,”**
not:
**“The game made me miserable until I paid.”**

---

## PHASE 12 — ANALYTICS + ATTACHMENT VALIDATION
**Status:** NOT STARTED

### Core events
- first_mochi_seen;
- first_help_action;
- first_puzzle_start;
- first_puzzle_complete;
- first_trust_response;
- rescue_started;
- rescue_completed;
- box_moment_started;
- box_moment_completed;
- home_first_entry;
- first_affection;
- first_object_interaction;
- first_memory;
- first_cosmetic_equipped.

### Attachment study
Measure:
- recall;
- recognition;
- care;
- curiosity;
- return intent;
- observation time;
- personalization intent;
- spontaneous share intent.

### Key qualitative questions
- What do you remember about Mochi?
- What do you think Mochi likes?
- Would you open the game tomorrow just to see him?
- What moment would you show someone?
- What would you buy or decorate specifically for him?

### Acceptance
Players describe Mochi as a character, not as “the cat”.

---

## PHASE 13 — PERFORMANCE, QA AND RELEASE HARDENING
**Status:** NOT STARTED

### Target
Smooth Android performance on mid-range hardware.

Audit:
- FPS;
- memory;
- texture sizes;
- draw calls;
- loading;
- scene transitions;
- input latency;
- animation cost;
- save corruption;
- lifecycle/background handling;
- touch behavior;
- accessibility.

### Tests
- board core;
- objectives;
- save/load;
- state transitions;
- cat behavior;
- unlock logic;
- purchase abstraction later;
- offline behavior.

---

## PHASE 14 — GO GATE
**Status:** NOT STARTED

### GO means
Not “it runs”.

GO means Mochi works.

Required evidence:
- players remember Mochi;
- players can describe personality;
- first-session completion is healthy;
- rescue moment is understood;
- box moment is emotionally salient;
- users voluntarily observe Mochi;
- users express return intent;
- at least one naturally shareable moment exists;
- home feels alive;
- puzzle feels connected to rescue;
- performance is stable;
- monetization does not corrupt the fantasy.

If these are weak:
**MODIFY.**

If the fantasy still fails after high-quality execution:
**KILL.**

Only after GO:
- mass levels;
- eight cats;
- events;
- seasonal content;
- expanded rooms;
- LiveOps;
- large content factory.

---

# 6. Design target

## Overall bar
**Premium casual / top-tier mobile polish.**

This is not a promise to match Dream Games' production budget or content scale.

It means:
- high readability;
- consistent materials;
- confident composition;
- smooth transitions;
- polished touch response;
- memorable character animation;
- strong sound design;
- very little visual junk.

## Benchmark principles

### Royal Match
Relevant principles:
- coherent world language;
- smooth rounded forms;
- match pieces that belong to the universe;
- polished boosters and feedback;
- character/world consistency.

Do not imitate its product structure blindly.

### Cats & Soup
Relevant principles:
- strong cat appeal;
- distinctive cats;
- costumes;
- photos;
- decoration;
- relaxed audio;
- repeated return to observe cats.

### Neko Atsume
Relevant principles:
- low-pressure observation;
- anticipation of what cats may do;
- collection generated through presence and curiosity.

Our unique territory remains:
**rescue + trust + coexistence.**

---

# 7. Current scorecard

This evaluates current **product readiness**, not future potential.

| Area | Current |
|---|---:|
| Product fantasy | 8.0 |
| Differentiation concept | 7.5 |
| Emotional attachment proof | 2.0 |
| Mochi character design | 1.5 |
| Visual identity | 2.0 |
| UI/UX implementation | 1.0 |
| Motion | 1.0 |
| Puzzle integration | 4.0 |
| Home experience | 3.5 |
| Audio | 1.0 |
| Retention proof | 2.0 |
| Monetization alignment | 6.5 |
| Virality proof | 2.0 |
| Technical readiness | 4.5 |
| Scalability | 4.0 |

### Interpretation
The idea has improved substantially, but the product is not yet “GO”.

The highest leverage work is:
1. Mochi;
2. 15-minute vertical slice;
3. living-room illusion of life;
4. rescue-integrated puzzle;
5. premium sensory polish.

---

# 8. Risk register

1. **Generic match-3 gravity** — puzzle dominates the fantasy.
2. **Cute but forgettable Mochi** — attractive asset without personality.
3. **Overproduction before validation** — levels/cats made too early.
4. **Home as menu** — room becomes a dashboard instead of a place.
5. **Tamagotchi burden** — care becomes chores.
6. **Feature creep** — too many collections/systems.
7. **Monetization contamination** — gacha/lives weaken trust.
8. **Animation underinvestment** — cat never feels alive.
9. **Narrative skinning** — rescue is only text over generic boards.
10. **Inconsistent art pipeline** — AI/assets create visual fragmentation.
11. **Weak mobile performance** — too many animated cats/particles.
12. **No analytics discipline** — “people liked it” replaces evidence.

---

# 9. Asset requirements for vertical slice

## MUST HAVE
- Mochi final or near-final visual design;
- Mochi core sprite/rig;
- 10–12 priority animations;
- box/transport carrier;
- rainy rescue environment;
- home living room;
- 5–8 room objects;
- puzzle tile set connected to rescue;
- 2–3 contextual blockers/objectives;
- main UI kit;
- sound pack for rain/paws/meows/purr/puzzle/box;
- basic haptic mapping;
- rescue transition;
- home arrival scene.

## SHOULD HAVE
- 20+ microexpressions/secondary motions;
- memory/photo presentation;
- one collar/accessory;
- one toy with special interaction;
- one favorite resting spot;
- day/night lighting variation.

## LATER
- cats 2–8;
- seasonal sets;
- multiple rooms;
- extensive wardrobe;
- events;
- LiveOps catalog.

---

# 10. Final committee decision

## MODIFY — proceed with the vertical slice

The product should continue.

But the next milestone is **not** “build more levels”.

It is:

> **Prove that Mochi becomes emotionally meaningful.**

The most important deliverable in the entire project is now the first 10–15 minutes and the living room immediately after.

If that works, the project earns the right to scale.
