# Unroutine

Unroutine is a mobile-first yoga and mobility training app that generates sessions around the time, focus, and intensity the user has available that day.

The project started as a single fixed yoga timer and has evolved into a small adaptive training product with a structured pose model, session generation, guided playback, local history, and a weekly planner.

## Current release

**v1.0.0**

### What the app can do

- Generate 10, 20, or 30 minute sessions
- Focus sessions on:
  - hips
  - T-spine
  - full-lotus preparation
  - recovery
- Select easy, moderate, or hard intensity
- Assemble sessions from a structured pose database
- Sequence warm-up, mobility, strength, deep work, peak work, and cooldown movements
- Scale pose durations toward the requested session length
- Preview the complete generated session before starting
- Run a guided pose timer with:
  - start / pause
  - previous / next controls
  - session progress
  - current cue
  - upcoming pose preview
- Use browser voice announcements for pose transitions
- Save preferences locally
- Save completed-session history locally
- Build sessions directly from a seven-day weekly plan
- Track weekly completion
- Browse and filter the pose library
- Use the interface on desktop or mobile

## Tech stack

- React 19
- Vite 7
- JavaScript
- CSS
- Browser Local Storage
- Web Speech API

## Requirements

Node.js 20.19+ is required.

Check your version:

```bash
node -v
```

## Run locally

```bash
git clone https://github.com/rcm814/unroutine.git
cd unroutine
npm install
npm run dev
```

Then open the local URL printed by Vite, normally:

```text
http://localhost:5173/
```

## How session generation works

Each pose contains structured metadata:

```js
{
  id: 'pigeon-prep',
  name: 'Pigeon Prep',
  focuses: ['hips', 'full-lotus'],
  category: 'deep',
  difficulty: 2,
  duration: 90,
  lotus: 4,
  cue: 'Support the front hip if needed and keep the knee pain-free.'
}
```

The generator uses:

1. requested session duration
2. selected training focus
3. maximum difficulty allowed by intensity
4. movement category
5. full-lotus relevance when that goal is selected
6. warm-up and cooldown requirements
7. simple deterministic variation

The selected poses are ordered into a usable training flow and their working durations are scaled toward the requested total time.

## Project structure

```text
src/
├── App.jsx
├── main.jsx
├── styles.css
├── data/
│   └── poses.js
└── utils/
    ├── generateFlow.js
    └── storage.js
```

## Version progression

### v0.1 — Guided timer
- fixed starter flow
- countdown timer
- basic navigation
- responsive first interface

### v0.2 — Structured pose library
- moved pose information into reusable metadata
- added focus tags
- added categories
- added difficulty
- added lotus-specific relevance

### v0.3 — Adaptive session generation
- duration selection
- focus selection
- intensity selection
- session assembly
- duration scaling

### v0.4 — Persistence
- saved user preferences
- saved completed-session history
- saved weekly-plan state

### v0.5 — Session builder
- dedicated build screen
- clearer training choices
- generated-session preview

### v0.6 — Guided player
- pose-by-pose session view
- progress tracking
- start / pause
- previous / next
- upcoming movement preview

### v0.7 — Voice guidance
- browser speech announcements
- voice preference toggle
- automatic pose transition cues

### v0.8 — Weekly training
- seven-day mobility plan
- build a session from any planned day
- manual completion tracking
- weekly progress bar

### v0.9 — Library + history
- filterable pose library
- completed-session history
- responsive navigation
- larger visual redesign

### v1.0 — Product milestone
- unified app navigation
- cleaner data architecture
- Node version requirement
- portfolio documentation
- removal of the obsolete hard-coded flow

## Current limitations

This release deliberately stays frontend-only.

That means:

- data is stored only in the current browser
- there are no accounts yet
- weekly completion is manual
- there is no cloud sync
- pose visuals are currently abstract placeholders rather than finished anatomical illustrations
- generated sessions are rules-based rather than personalized by a learned model
- bilateral poses are represented as single movements rather than left/right substeps

## Next major milestones

### v1.1
- true left/right pose handling
- editable generated flows
- replace individual movements before starting
- reset / restart session controls

### v1.2
- custom SVG pose illustrations
- visual transition cues
- more detailed pose instructions

### v1.3
- athlete mode
- baseball practice-day recovery sessions
- pre-training versus post-training flows
- workload input

### v1.4
- improved weekly planner
- automatically mark completed planned sessions
- drag-and-drop schedule adjustments

### v2.0
- user accounts
- backend database
- synced history
- custom goals
- longer-term progression tracking
- adaptive recommendation system

## Design goal

Unroutine is not intended to be another static exercise catalog.

The long-term product idea is:

> Tell the app what kind of day you are having, and it builds the right training session for that day.

---

Built as a working product prototype and software portfolio project.
