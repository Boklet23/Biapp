# BiVokter — Fiverr Outreach Document

---

## PART A — First message to send (copy-paste)

> Use this as your opening message before placing any order. Paste it into Fiverr chat.

---

Hi,

I'm building a Norwegian beekeeping app called **BiVokter** and I'm looking for a Rive animation designer for a key feature: a 4-scene animated beehive that sits at the top of two screens.

**Quick summary:**
- 4 scenes in one `.riv` file — exterior hive → inside hive → honeycomb frames → bee close-up
- Controlled by a state machine with one numeric input (`sceneIndex` 0–3)
- Semi-realistic illustration style — detailed, not cartoon
- Canvas: 400 × 220 px, target file size under 2 MB
- Platform: React Native (Expo) — we use the official `rive-react-native` package

**The work requires:**
- Creating the illustrations from scratch (we have no existing art assets)
- Building the Rive state machine and transitions between all 4 scenes
- Each scene has a looping idle animation (bees flying, honey dripping, etc.)

**Budget:** $400–700 USD for the full project (all 4 scenes + state machine + revisions)
**Timeline:** No hard deadline, but ideally delivered within 3–4 weeks

Before we proceed, could you answer a few questions?

1. Have you done semi-realistic nature scenes before (not just UI icons/characters)?
2. Do you create the vector illustrations yourself, or do you need us to provide source art?
3. Can you share 1–2 portfolio examples of multi-scene Rive files with state machines?
4. Is this scope within your usual work? Any concerns about the complexity?

I have a detailed technical brief ready (canvas size, color palette, state machine spec, art style, deliverables, integration instructions) — happy to share it once we've talked.

Looking forward to hearing from you.

---

## PART B — Full Technical Brief

> Share this document after the designer confirms interest. This is the complete specification.

---

### About the project

**BiVokter** ("Hive Guardian") is a Norwegian beekeeping management app for Android and iOS. Beekeepers use it to track hives, log inspections, monitor varroa mite counts, forecast honey harvests, and follow seasonal guides.

This animation is a core visual element — visible every time a user opens the app and every time they inspect a hive.

---

### Where the animation appears

**1. Home screen** — always visible, always shows Scene 0 (exterior). This is the first thing users see. It must be polished and beautiful.

**2. Inspection wizard** — a 4-step flow where the "camera" moves deeper into the hive with each step:

| Step | Scene |
|------|-------|
| Step 1 — Basic info | Scene 0: Exterior |
| Step 2 — Hive status | Scene 1: Interior |
| Step 3 — Health check | Scene 2: Frames |
| Step 4 — Notes | Scene 3: Bees |

---

### The 4 scenes

#### Scene 0 — Exterior (default)
- A Norwegian-style wooden Langstroth beehive (2 boxes stacked), painted white or natural wood
- Sitting in green grass, warm afternoon light, sky visible in background
- 3–5 bees flying lazily around the entrance, occasionally landing on the landing board
- Idle: gentle camera sway, bees flapping continuously

#### Scene 1 — Interior pan
- Transition (~1.2 s): camera zooms into the entrance and pans upward
- Warm amber/golden tones inside, walls covered with natural wax
- 2–3 bees crawling slowly on walls
- Idle: gentle light flicker from above

#### Scene 2 — Frames view
- Close-up of 5–6 wooden frames hanging side by side
- Frames filled with honeycomb cells — some capped (white/light wax), some open (amber honey)
- Honey glistening under warm light, subtle honey drip once every ~4 s
- 1–2 bees crawling across the frames

#### Scene 3 — Bee close-up
- Extreme close-up: 4–6 bees in full detail — fuzzy bodies, transparent wings, amber-striped abdomen
- Honeycomb fills entire background — rich golden amber
- One bee doing the "waggle dance" in the center
- Wings flutter continuously

---

### State machine specification

**State machine name:** `HiveNavigation`

| Input | Type | Values |
|-------|------|--------|
| `sceneIndex` | Number | 0, 1, 2, 3 |

| Value | State |
|-------|-------|
| 0 | `exterior` |
| 1 | `interior` |
| 2 | `frames` |
| 3 | `bees` |

- All states can transition to all other states
- Transition duration: 0.8–1.2 s with ease-in-out
- Each scene loops its idle animation when `sceneIndex` is not changing

---

### Technical requirements

| Setting | Value |
|---------|-------|
| File name | `bivokter_hive.riv` |
| Canvas size | 400 × 220 px |
| Rive runtime | 9.x (latest stable) |
| Fit mode | `Cover` |
| Audio | None |
| Assets | Self-contained — all embedded in .riv file |
| Max file size | 2 MB |

The app scales the canvas to fill the width of the screen (~360–420 dp on Android). Design at 400 × 220 px and it will look correct on all devices.

---

### Art style

**Style:** Semi-realistic illustration — detailed, not photographic. Think "premium mobile game intro" or "Apple app onboarding animation". Not cartoon. Not pixel art. Not flat design.

**References:**
- Norwegian Langstroth beehives (white painted, two rectangular boxes stacked, with a sloped roof)
- Real honeycomb frames with capped and uncapped cells
- European honeybees (*Apis mellifera*) — fuzzy, amber-brown with black stripes, transparent wings

**Color palette:**

| Element | Color |
|---------|-------|
| Hive wood (dark) | `#8B5E2A` |
| Hive wood (light) | `#A0742A` |
| Honey / open cells | `#F5C842` → `#C4831A` |
| Sky | `#87CEEB` |
| Grass | `#4A7C40` |
| Interior walls | `#5C3A1E` → `#8B5E2A` |
| Bee body | `#E8A020` with black stripes |
| Bee wings | Translucent white / pale blue |

App primary brand color: `#D4A843` (warm honey). The animation should feel at home in this palette.

---

### What we already have

We have a coded placeholder (React Native Skia) showing:
- Animated bees with flapping wings in figure-8 paths
- Honeycomb with shimmer
- Honey drips in the frames scene
- Zoom transitions between scenes

We can send a screen recording of this placeholder — it shows the feel we're going for. Your Rive file should be a polished, high-quality version of the same concept.

We have **no existing vector art** — you create the illustrations from scratch.

---

### Deliverables

1. `bivokter_hive.riv` — complete Rive file, self-contained
2. Short screen recording (MP4 or GIF) showing all 4 scenes and transitions
3. Optional: PNG preview of each scene at 400 × 220 px

---

### Milestones and revision process

We prefer a staged approach:

| Milestone | What you deliver | What we pay |
|-----------|-----------------|-------------|
| 1 — Art style approval | Still PNG or short GIF of Scene 0 only | 25% |
| 2 — Draft Rive file | All 4 scenes, basic transitions, state machine wired | 50% |
| 3 — Final delivery | Polished file, all idle animations, all transitions | 25% |

We allow **2 rounds of revisions per milestone**. Major scope changes outside the brief will be quoted separately.

---

### Budget

**Total budget: $400–700 USD** (≈ 4 400–7 700 NOK), depending on complexity and your rates.

Payment via Fiverr milestones as described above.

---

### How we integrate the file

Once you deliver `bivokter_hive.riv`:

1. Place file in `assets/bivokter_hive.riv`
2. Flip one flag in code — animation replaces placeholder immediately
3. The app controls it with a single line:

```js
riveRef.current.setInputState('HiveNavigation', 'sceneIndex', 2); // show frames
```

You don't need to worry about app logic — just build the Rive file to spec and we handle the rest.

---

### Questions?

We can provide:
- Screen recording of the current placeholder animation
- Screenshots of the full app UI (for color/style reference)
- Reference photos of Norwegian beehives
- Video of a real hive inspection (for frames/interior scenes)

Contact via Fiverr messages. Response time: within 24 hours.
