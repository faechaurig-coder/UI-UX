# Whiskerfolk — Web Vertical Slice Prototype

This is a **playable interaction prototype** for the first-session Mochi rescue arc.

It is not the final production renderer and does not replace the intended Godot/mobile implementation. It exists to validate:

- emotional sequence;
- scene pacing;
- puzzle-to-rescue connection;
- interaction hierarchy;
- the no-dashboard first session;
- the Box Moment;
- first Home experience.

## Flow
1. Rain / box discovery
2. Food rescue puzzle
3. Trust interaction
4. Shelter puzzle
5. Carrier rescue
6. Home / Box Moment
7. Catbook, Memory and first blanket placement

## Design rules represented
- one dominant CTA;
- no currencies or shop in first session;
- world-first composition;
- low-pressure trust;
- no punitive needs;
- no generic “3 stars / level complete” reward;
- Catbook and Memories are secondary surfaces.

## Run
Serve this folder with any static HTTP server.

Example:
```bash
python -m http.server 8000
```

Then open:
`http://localhost:8000`

## Quality note
The CSS-built Mochi and environment are deliberately **art-direction proxies**, not final production character art. Final AAA quality requires a proper character rig/sprites/animation/audio pipeline in the production game.
