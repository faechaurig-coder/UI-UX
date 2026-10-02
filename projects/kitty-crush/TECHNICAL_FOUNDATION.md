# KITTY PROJECT — TECHNICAL FOUNDATION

## 1. Purpose

This document identifies what can be accelerated from reviewed open-source references without inheriting product decisions that conflict with Kitty's new direction.

---

# 2. Reference A — immane/match3-pets

Repository:
https://github.com/immane/match3-pets

License:
MIT.

Engine:
Godot 4.6 .NET / C#.

## Strong reusable foundation

### Core board
- BoardData
- MatchDetector
- GravitySystem
- SpawnSystem
- ValidMoveChecker
- MatchResult

These are valuable because they separate board logic from presentation.

### Runtime/gameplay
- Board
- GameStateMachine
- TileManager
- AnimationController

### Infrastructure
- EventBus
- ServiceInitializer
- persistent-storage abstraction
- object pooling
- dynamic board layout

### Tests
The repository documents 41 tests across 10 xUnit files.

This is unusually valuable for rapid iteration because the puzzle core can be modified without relying only on manual playtesting.

---

# 3. What must NOT be inherited as product strategy

## Countdown timer
The 30-second score-attack model fights the cozy/emotional pacing.

Default action:
**REMOVE from the vertical slice.**

## Gacha
Current reference includes:
- banners;
- pull cost;
- rarity;
- pity;
- multi-pull.

Default action:
**DO NOT USE for rescuing cats.**

Cat acquisition through rescue is strategically superior for this product identity.

## Pet needs
The reference includes needs/care framing.

Default action:
**REPLACE with relationship/bond state and preference discovery.**

## Generic pet roster
Cat/dog/bunny/duck weakens the specific IP thesis.

Default action:
**CATS ONLY for initial product.**

---

# 4. Proposed owned architecture

When the dedicated repo is created, aim for a data-driven architecture similar to:

```
src/
  core/
    puzzle/
      BoardData
      MatchDetector
      GravitySystem
      SpawnSystem
      ObjectiveSystem
      BlockerSystem
      ValidMoveChecker
  gameplay/
    puzzle/
      Board
      TileManager
      PuzzleStateMachine
      PuzzlePresentation
    rescue/
      RescueArc
      RescueBeat
      RescueDirector
      RescueProgress
    cats/
      CatDefinition
      CatInstance
      CatActor
      CatBehaviorController
      CatPersonality
      CatBondState
      CatPreferenceProfile
    home/
      HomeScene
      HomeObjectDefinition
      HomeObjectInstance
      InteractionSlot
      NavigationSurface
      BehaviorScheduler
    memories/
      MemoryDefinition
      MemoryTrigger
      MemoryCollection
  ui/
    onboarding/
    home/
    catbook/
    memories/
    style/
  services/
    SaveService
    AnalyticsService
    AudioService
    HapticsService
    EconomyService
  tests/
```

Names are illustrative, not mandatory.

---

# 5. Cat behavior architecture

Avoid hardcoding every cat scene separately.

Recommended model:

```
BehaviorScore =
  personalityWeight
+ contextWeight
+ objectAffinity
+ bondModifier
+ recencyPenalty
+ smallRandomness
```

Then select from allowed behaviors.

Example:

Mochi sees:
- box;
- window;
- toy;
- player;
- bed.

His personality can make:
- box hiding high probability;
- player approach low at low bond;
- window watching medium;
- toy curiosity medium-high.

After bond increases:
- approach probability rises;
- hide frequency falls;
- player-near sleeping becomes possible.

This creates visible relationship progression without requiring complex AI.

---

# 6. Rescue architecture

A RescueArc should be data-driven.

Example conceptual data:

```
MochiArc
  beat 1: discover
  beat 2: food objective
  beat 3: trust reaction
  beat 4: shelter objective
  beat 5: threat
  beat 6: rescue objective
  beat 7: transition
  beat 8: box moment
```

Each beat can trigger:
- scene state;
- dialogue/copy;
- puzzle objective;
- animation;
- sound;
- cat bond update;
- memory unlock.

This keeps narrative and puzzle connected.

---

# 7. Puzzle objective system

Do not hardwire level goals into UI text.

Define objective types.

Examples:
- CollectItem;
- ClearBlocker;
- RevealPath;
- ProtectObject;
- DropObject;
- ChargeObject.

The same mechanical primitive can be skinned carefully for different rescue contexts.

---

# 8. Living-room interactions

Every interactive home object should describe:

- interaction points;
- valid cat poses;
- behavior tags;
- duration range;
- animation key;
- sound key;
- memory triggers;
- personality affinities.

Example:

```
CardboardBox
  tags: hide, sleep, curious
  slots:
    inside
    top
  MochiAffinity: very_high
```

This lets content designers add future objects without custom scripting for every cat/object combination.

---

# 9. Save data

Minimum persistent state:

- rescued cats;
- bond state;
- discovered preferences;
- discovered behaviors;
- home inventory;
- placed objects;
- memories;
- story/rescue progress;
- soft currency later;
- cosmetic ownership;
- settings;
- analytics consent/state as required.

Version save schemas from the start.

---

# 10. Analytics architecture

Use a thin abstraction so gameplay never depends directly on a vendor SDK.

Example:
`AnalyticsService.Track(eventName, payload)`

This allows:
- local debug logging;
- later provider swap;
- tests;
- privacy control.

---

# 11. Performance target

Target a stable 60 FPS on mid-range Android where practical.

Budget aggressively:
- texture atlases;
- pooled puzzle objects;
- limited simultaneous particles;
- limited live cat count in MVP;
- preloaded critical audio;
- lazy load noncritical collections;
- avoid huge 4K spritesheets.

The visual target is premium, not wasteful.

---

# 12. Testing strategy

## Unit
- match detection;
- cascades;
- valid moves;
- objectives;
- blockers;
- rescue state progression;
- bond thresholds;
- save migration.

## Integration
- puzzle completion updates rescue;
- rescue updates home;
- home unlock triggers memory;
- cat preference affects behavior.

## Playtest
- first 15 minutes;
- no-input home observation;
- interruption/background/resume;
- low-end mobile touch;
- save/reload after each beat.

---

# 13. License discipline

If code from `immane/match3-pets` is incorporated:
- retain the MIT copyright/license notice as required;
- document which files were adapted;
- avoid presenting third-party code as original.

For `iuhoay/cat-run`, use design concepts only until the exact license text is verified in the repository itself, even though its README states MIT.

---

# 14. Technical verdict

### RECOMMENDED

Use `match3-pets` as a **puzzle-engine reference/accelerator**, not as the product shell.

Rebuild the player-facing architecture around:
- rescue;
- character;
- home;
- bond;
- memories.

### Most important technical transformation

Replace:

**PetAcquired → PetNeeds → Gacha → PetRoom**

with:

**CatDiscovered → RescueArc → BondState → LivingHome → Memory**

That transformation is the code-level expression of the product strategy.
