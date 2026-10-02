# WHISKERFOLK — QA / Release Gates

## Gate A — Prototype Integrity
- JS parses successfully.
- Five vertical-slice scenes are wired.
- Reduced-motion CSS exists.
- No shop/currency in first-rescue UI.
- Match board has valid-move recovery.
- Puzzle failure does not hard-stop story.

## Gate B — Production Core
Required on Godot project:
- build succeeds;
- unit tests pass;
- no unlicensed assets/code;
- save schema versioned;
- rescue state can resume after app background;
- no state loss after scene change.

## Gate C — Mobile Interaction
Test on at least:
- low/mid Android;
- current mid Android;
- tall narrow aspect ratio;
- tablet ratio.

Check:
- 48dp+ targets;
- safe areas;
- back behavior;
- orientation lock if chosen;
- touch drag/tap conflict;
- interrupted audio;
- app background/restore;
- notification interruption;
- low battery/performance mode.

## Performance target
- target 60 FPS on representative mid Android;
- no sustained frame spikes during cascades;
- no runaway particle count;
- memory stable across 20 puzzle/home transitions;
- room animation update can throttle offscreen/nonessential actors.

## Accessibility
- objective tiles differentiated by shape/pattern, not color only;
- reduced motion;
- haptics toggle;
- sound toggle;
- text contrast;
- readable dynamic text where feasible.

## Emotional QA
Reviewers specifically flag:
- instant-love behavior;
- manipulative sadness;
- guilt copy;
- constant animation noise;
- “reward screen” overpowering rescue;
- generic mobile UI;
- Home becoming dashboard.

## GO build definition
A build can be called Vertical Slice Candidate only when:
- full Mochi arc runs start-to-home;
- no blocker bug;
- character animation is production-near;
- audio pass exists;
- puzzle context changes world state visibly;
- analytics fires;
- save/resume works;
- at least one device playtest is recorded.
