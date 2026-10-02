# WHISKERFOLK — Technical Validation

Updated: 2026-10-02

## Current validated baseline

GitHub Actions workflow:
`.github/workflows/whiskerfolk-ci.yml`

Latest validated build/test evidence after the runtime/core split and mobile/audio work:

- Godot C# runtime build: **SUCCESS**
- Compiler warnings: **0**
- Compiler errors: **0**
- Core tests: **57 / 57 PASSED**
- Web prototype JavaScript syntax: **PASS**
- Godot main scene contract: **PASS**
- Android VIBRATE permission contract: **PASS**
- Third-party MIT license retention: **PASS**
- Runtime test-package isolation: **PASS**

Reference successful workflow lineage:
- run 47: Home object affinity fix — success
- run 49: living Home + replay-safe Box Moment — success
- run 51: Mochi microexpressions — success
- current audio/back baseline: build 0 warnings / 0 errors, 57/57 tests in CI logs

## What CI currently proves

It proves:
- C# code compiles against Godot.NET.Sdk 4.6.3;
- the engine-agnostic domain core is unit-tested;
- rescue arc order is valid;
- economy wallet guards are valid;
- Mochi identity/roster contracts are intact;
- Home affinity logic respects Mochi's box preference;
- match detection/gravity/spawn/score/special/move logic passes tests;
- Android/project configuration contracts remain present;
- web prototype JS remains syntactically valid.

## What CI does NOT prove

It does not prove:
- Android APK installs on the user's physical device;
- real FPS/memory/thermal performance;
- actual haptic strength/feel;
- final audio quality on phone speakers/headphones;
- final animation/art quality;
- Play Console readiness;
- human emotional attachment.

Those remain release gates.

## Architecture baseline

```
Whiskerfolk.Core (.NET 8, engine-agnostic)
├── puzzle
├── objectives
├── cats / bond / behavior
├── rescue
├── home
├── memories
├── economy
├── analytics contract
└── save model

Whiskerfolk (Godot 4.6 C#)
├── scene/presentation
├── Mochi proxy renderer
├── mobile lifecycle
├── save adapter
├── haptics
├── procedural audio proxy
└── Home runtime

Whiskerfolk.Tests
└── xUnit domain/core contract suite
```

## Quality rule

A green CI run is necessary but not sufficient for GO.

GO still requires production-near art/audio/animation, Android device QA and attachment playtesting.
