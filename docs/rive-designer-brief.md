# BiVokter — Rive Animation Brief

## About the app

**BiVokter** ("Hive Guardian") is a Norwegian beekeeping management app for Android and iOS. Beekeepers use it to track their hives, log inspections, monitor varroa mite counts, forecast honey harvests, and follow seasonal guides.

The app has five tabs: Home, My Hives, Calendar, Learn, and Community.

---

## Where the animation appears

The Rive file is used in **two places**:

### 1. Home screen (always visible)
The animation sits full-width near the top of the home screen. It always shows **Scene 0 (exterior)**. It is the first thing the user sees when they open the app. This scene is the most important — it must look polished and inviting.

### 2. Inspection wizard (4 steps)
When a beekeeper starts a hive inspection, they go through a 4-step wizard. The animation sits at the top of the wizard and **changes scene with each step** as the "camera" moves deeper into the hive:

| Wizard step | Scene shown |
|-------------|-------------|
| Step 1 — Basic info | Scene 0: Exterior |
| Step 2 — Hive status | Scene 1: Interior |
| Step 3 — Health check | Scene 2: Frames |
| Step 4 — Notes | Scene 3: Bees |

The user experiences this as zooming further into the hive as they record more detailed data. The transition between scenes should feel like a smooth camera move.

---

## The 4 scenes

### Scene 0 — Exterior (`exterior`) — DEFAULT
Camera is outside, slightly elevated, warm afternoon light.

- A wooden **Langstroth beehive** (2 boxes stacked) sitting in green grass
- Norwegian-style hive: painted white or natural wood, simple rectangular boxes
- 3–5 bees flying lazily around the hive entrance
- Bees occasionally land on the landing board
- Idle animation: gentle camera sway, bees flapping continuously
- Sky visible in background, soft shadows on the grass

### Scene 1 — Interior pan (`interior`)
Camera moves from outside → inside the hive.

- Transition (~1.2 s): camera zooms into the entrance and pans upward
- Interior: warm amber/golden tones, walls covered with natural wax
- 2–3 bees visible crawling slowly on the walls
- Idle: gentle light flicker from above, bees moving slowly

### Scene 2 — Frames view (`frames`)
Close-up of 5–6 wooden frames hanging side by side.

- Frames filled with honeycomb cells — some capped (white/light wax), some open (amber honey)
- Honey glistening under warm light
- 1–2 bees crawling across frames
- Subtle honey drip from one cell, once every ~4 s
- Idle: slow bees, light honey shimmer

### Scene 3 — Bee close-up (`bees`)
Extreme close-up of bees on honeycomb.

- 4–6 bees in full detail: fuzzy bodies, transparent wings, amber-striped abdomen
- Honeycomb fills the entire background — rich golden amber
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

| Setting | Value |
|---------|-------|
| File name | `bivokter_hive.riv` |
| Canvas size | 400 × 220 px |
| Rive runtime | 9.x compatible (latest stable) |
| Fit mode | `Cover` (we scale it with `Fit.Cover`) |
| Audio | None |
| Assets | Self-contained — all embedded in .riv file |
| File size | Under 2 MB |

The app scales the canvas to fill the width of the screen. On most Android phones that is ~360–420 dp wide. Design at 400 × 220 px and it will look correct on all screen sizes.

---

## Art style

**Style:** Semi-realistic illustration — detailed but not photographic. Think "premium mobile game UI" or "Apple app intro animation". Not cartoon. Not pixel art.

**References to look for:**
- Norwegian Langstroth beehives (white painted, two boxes)
- Real honeycomb frames with capped and uncapped cells
- European honeybees (*Apis mellifera*) — fuzzy, amber-brown with black stripes

**Color palette:**

| Element | Color |
|---------|-------|
| Hive wood (dark) | `#8B5E2A` |
| Hive wood (light) | `#A0742A` |
| Honey / open cells | `#F5C842` to `#C4831A` |
| Sky (exterior) | `#87CEEB` |
| Grass | `#4A7C40` |
| Interior walls | `#5C3A1E` to `#8B5E2A` |
| Bee body | Amber-brown `#E8A020` with black stripes |
| Bee wings | Translucent white / pale blue |

The app itself uses a warm honey color (`#D4A843`) as its primary brand color. The animation should feel at home in this palette.

---

## What we already have (placeholder)

While waiting for this Rive file, we have a Skia-drawn animated placeholder showing:
- Animated bees with flapping wings flying in figure-8 paths
- Honeycomb with shimmer effect
- Honey drips in the frames scene
- Zoom-in transition between scenes

This placeholder gives you a sense of the feel we are going for. The Rive file should be a polished, high-quality version of the same concept.

---

## Deliverables

1. `bivokter_hive.riv` — the complete Rive file
2. A short screen recording (MP4 or GIF) showing all 4 scenes and transitions
3. Optional: exported PNG previews of each scene at 400 × 220 px

---

## Milestones / review process

We suggest this workflow:

1. **Concept preview** — before building the full file, send a still PNG or short GIF of Scene 0 (exterior) only. We will approve the art style before you continue.
2. **Draft Rive file** — all 4 scenes, basic transitions. We review and give feedback.
3. **Final delivery** — polished file with all transitions and idle animations.

---

## How we integrate the file

Once you deliver `bivokter_hive.riv`:

1. We place the file in `assets/bivokter_hive.riv`
2. Set `RIVE_ASSET_READY = true` in `components/animations/HiveScene.tsx`
3. Build a new APK — the animation replaces the placeholder immediately

The app controls the animation with a single line of code:
```js
riveRef.current.setInputState('HiveNavigation', 'sceneIndex', 0); // show exterior
riveRef.current.setInputState('HiveNavigation', 'sceneIndex', 2); // show frames
```

You do not need to worry about any app logic — just build the Rive file correctly and we handle the rest.

---

## Questions?

Contact via Fiverr messages. We are happy to provide:
- Additional reference photos of Norwegian beehives
- Screen recordings of the current placeholder animation
- Screenshots of the app UI for color / style reference
- Video of real Norwegian hive inspections (for the frames / interior scenes)
