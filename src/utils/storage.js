const KEYS = {
  preferences: 'unroutine.preferences',
  history: 'unroutine.history',
  plan: 'unroutine.weeklyPlan',
}

export function loadPreferences() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.preferences)) ?? {
      minutes: 20,
      focus: 'hips',
      intensity: 'moderate',
      voice: true,
    }
  } catch {
    return { minutes: 20, focus: 'hips', intensity: 'moderate', voice: true }
  }
}

export function savePreferences(value) {
  localStorage.setItem(KEYS.preferences, JSON.stringify(value))
}

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.history)) ?? []
  } catch {
    return []
  }
}

export function saveSessionToHistory(session) {
  const current = loadHistory()
  const entry = {
    id: session.id,
    completedAt: new Date().toISOString(),
    focus: session.focus,
    intensity: session.intensity,
    minutes: Math.round(session.totalSeconds / 60),
    poseCount: session.poses.length,
  }

  const next = [entry, ...current.filter((item) => item.id !== entry.id)].slice(0, 30)
  localStorage.setItem(KEYS.history, JSON.stringify(next))
  return next
}

export function loadWeeklyPlan() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.plan)) ?? null
  } catch {
    return null
  }
}

export function saveWeeklyPlan(plan) {
  localStorage.setItem(KEYS.plan, JSON.stringify(plan))
}
