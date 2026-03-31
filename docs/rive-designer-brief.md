# BiVokter — Rive Animation Brief

## Project overview

BiVokter is a Norwegian beekeeping management app. We need a **single Rive file** (`bivokter_hive.riv`) that serves as a living 3D-style beehive scene, rendered full-width at the top of our home screen and in the inspection wizard.

---

## What we need

A beehive animation with **4 scenes connected by a state machine**. The app sends one numeric input to trigger transitions between scenes — you do not need to worry about the app logic, just build the Rive file.

---

## The 4 scenes

### Scene 0 — Exterior (`exterior`)
The default view. Camera is outside, slightly elevated.

- A wooden Langstroth beehive (2 boxes stacked) sitting in green grass
- Warm afternoon light, soft shadows
- 3–5 bees flying lazily around the hive entrance
- Bees land on the landing board occasionally
- Idle animation: small camera sway, bees flapping continuously

### Scene 1 — Interior pan (`interior`)
Camera slowly zooms into the hive entrance and pans upward through the open top.

- Short transition (~1.5 s): camera moves from exterior → inside looking down
- Interior: warm amber/golden tones, walls covered in wax comb
- 2–3 bees visible crawling on the walls
- Idle: gentle light flicker (as if from above), bees moving slowly

### Scene 2 — Frames view (`frames`)
Close-up of 5–6 wooden frames hanging side by side.

- Frames filled with honeycomb cells — some capped (white wax), some open (amber honey)
- Honey visibly glistening
- 1–2 bees crawling across frames
- Subtle honey drip from one cell, once every ~4 s
- Idle: slow bees, light honey shimmer

### Scene 3 — Bee close-up (`bees`)
Extreme close-up of bees on honeycomb.

- 4–6 bees in full detail: fuzzy bodies, transparent wings, amber-striped abdomen
- Honeycomb fills entire background — rich golden amber
- Wings flutter continuously
- One bee doing the "waggle dance" movement in the center
- Idle: continuous wing motion, slow crawling

---

## State machine specification

**State machine name:** `HiveNavigation`

**Input:**
- Name: `sceneIndex`
- Type: **Number** (0, 1, 2, 3)

**States:**
| Input value | State name | Description |
|-------------|-----------|-------------|
| 0 | `exterior` | Outside hive, default |
| 1 | `interior` | Panning inside |
| 2 | `frames` | Frames close-up |
| 3 | `bees` | Bee close-up |

**Transitions:**
- All states can transition to all other states
- Transition duration: 0.8–1.2 s with ease-in-out
- Each scene loops its idle animation when no input change occurs

---

## Technical requirements

- **File name:** `bivokter_hive.riv`
- **Canvas size:** 400 × 220 px (we scale it in the app)
- **Rive runtime version:** 9.x compatible (latest stable)
- **Fit mode:** Cover (we render with `Fit.Cover`)
- **No audio**
- **Self-contained:** all assets embedded in the .riv file
- **File size target:** under 2 MB

---

## Art style

- **Reference images:** See `/docs/reference/` folder (photos of real Norwegian beehives)
- **Style:** Semi-realistic illustration — detailed but not photographic. Think "premium mobile game UI" or "Apple app intro animation"
- **Color palette:**
  - Hive wood: #8B5E2A to #A0742A
  - Honey/comb: #F5C842 to #C4831A
  - Sky (exterior): #87CEEB
  - Grass: #4A7C40
  - Interior amber: #5C3A1E to #8B5E2A

---

## Deliverables

1. `bivokter_hive.riv` — the complete Rive file
2. A short screen recording (MP4) showing all 4 scenes and transitions
3. Optional: exported PNG previews of each scene

---

## How to test integration

Once you deliver the file:
1. Developer places `bivokter_hive.riv` in the `assets/` folder
2. Sets `RIVE_ASSET_READY = true` in `components/animations/HiveScene.tsx`
3. Builds new APK — scene should appear immediately

---

## Questions?

Contact via Fiverr messages. We are happy to provide additional reference photos or video of Norwegian beekeeping on request.
