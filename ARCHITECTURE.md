# Unroutine Architecture

## Overview

Unroutine is currently a client-side React application. The v1.0 architecture intentionally keeps the product simple enough to run locally without an API while separating domain data, session-generation logic, persistence, and presentation.

## Layers

### 1. Pose data

`src/data/poses.js`

The pose database is the domain source of truth. Each pose describes:

- stable ID
- display name
- supported training focuses
- movement category
- difficulty
- default duration
- full-lotus relevance
- coaching cue

This structure allows the UI and generator to work from data instead of hard-coded routines.

### 2. Session generation

`src/utils/generateFlow.js`

The generator accepts:

```js
{
  minutes,
  focus,
  intensity
}
```

It then:

1. maps intensity to a maximum difficulty
2. filters for focus-relevant movements
3. adds warm-up work
4. adds focus-specific movements
5. prioritizes lotus-relevant movements when applicable
6. adds cooldown work
7. sorts the sequence by movement category
8. fills short sessions with additional relevant movements
9. scales durations toward the requested total

The current generator is deterministic for the same input combination. This makes behavior easier to debug while the product is still evolving.

### 3. Local persistence

`src/utils/storage.js`

Local Storage currently persists:

- builder preferences
- completed-session history
- weekly-plan completion

No sensitive account data is stored because v1.0 has no authentication or backend.

### 4. UI state

`src/App.jsx`

The main app currently manages four product areas:

- session builder
- guided session player
- weekly planner
- library and history

This is intentionally kept in one file at v1.0 for speed of iteration. As the project grows, the next refactor should split these into components and route-level views.

## Recommended next refactor

```text
src/
├── components/
│   ├── AppHeader.jsx
│   ├── PoseCard.jsx
│   ├── ProgressBar.jsx
│   └── TimerControls.jsx
├── features/
│   ├── builder/
│   ├── player/
│   ├── planner/
│   ├── library/
│   └── history/
├── data/
│   └── poses.js
├── utils/
│   ├── generateFlow.js
│   └── storage.js
└── App.jsx
```

## Future backend boundary

When accounts are introduced, the local-storage functions can become a clean boundary for API replacements.

Likely future entities:

- User
- Preference
- Pose
- SessionTemplate
- GeneratedSession
- CompletedSession
- WeeklyPlan
- Goal

## Testing priorities

Before a larger release, automated tests should cover:

- generated flows never exceed selected difficulty
- generated flows contain warm-up and cooldown work
- requested focus appears in the generated sequence
- session durations remain within an acceptable range
- history persistence does not duplicate completed sessions
- weekly-plan persistence survives page refresh
