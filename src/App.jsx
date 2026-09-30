import { useEffect, useMemo, useState } from 'react'
import { focusOptions, intensityOptions, poses } from './data/poses.js'
import { generateFlow } from './utils/generateFlow.js'
import {
  loadHistory,
  loadPreferences,
  loadWeeklyPlan,
  savePreferences,
  saveSessionToHistory,
  saveWeeklyPlan,
} from './utils/storage.js'

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = String(seconds % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

function titleCase(value) {
  return value
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
}

function speak(text, enabled) {
  if (!enabled || !('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.95
  window.speechSynthesis.speak(utterance)
}

function buildWeeklyPlan() {
  const days = [
    ['Monday', 'hips', 20, 'moderate'],
    ['Tuesday', 't-spine', 10, 'easy'],
    ['Wednesday', 'full-lotus', 20, 'moderate'],
    ['Thursday', 'recovery', 10, 'easy'],
    ['Friday', 'hips', 30, 'hard'],
    ['Saturday', 'full-lotus', 30, 'moderate'],
    ['Sunday', 'recovery', 20, 'easy'],
  ]

  return days.map(([day, focus, minutes, intensity]) => ({
    day,
    focus,
    minutes,
    intensity,
    complete: false,
  }))
}

export default function App() {
  const initialPreferences = useMemo(() => loadPreferences(), [])
  const [view, setView] = useState('build')
  const [preferences, setPreferences] = useState(initialPreferences)
  const [session, setSession] = useState(() => generateFlow(initialPreferences))
  const [index, setIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(session.poses[0]?.sessionDuration ?? 60)
  const [running, setRunning] = useState(false)
  const [history, setHistory] = useState(() => loadHistory())
  const [weeklyPlan, setWeeklyPlan] = useState(() => loadWeeklyPlan() ?? buildWeeklyPlan())
  const [libraryFilter, setLibraryFilter] = useState('all')
  const [sessionComplete, setSessionComplete] = useState(false)

  const currentPose = session.poses[index]
  const progress = session.poses.length
    ? ((index + 1) / session.poses.length) * 100
    : 0

  useEffect(() => {
    savePreferences(preferences)
  }, [preferences])

  useEffect(() => {
    saveWeeklyPlan(weeklyPlan)
  }, [weeklyPlan])

  useEffect(() => {
    if (!running || !currentPose) return

    if (secondsLeft <= 0) {
      if (index < session.poses.length - 1) {
        const nextIndex = index + 1
        setIndex(nextIndex)
        setSecondsLeft(session.poses[nextIndex].sessionDuration)
        speak(session.poses[nextIndex].name, preferences.voice)
      } else {
        setRunning(false)
        setSessionComplete(true)
        speak('Session complete. Nice work.', preferences.voice)
        setHistory(saveSessionToHistory(session))
      }
      return
    }

    const timer = window.setTimeout(
      () => setSecondsLeft((value) => value - 1),
      1000,
    )

    return () => window.clearTimeout(timer)
  }, [running, secondsLeft, index, session, currentPose, preferences.voice])

  function updatePreference(key, value) {
    setPreferences((current) => ({ ...current, [key]: value }))
  }

  function createSession(overrides = {}) {
    const nextPreferences = { ...preferences, ...overrides }
    setPreferences(nextPreferences)

    const nextSession = generateFlow(nextPreferences)
    setSession(nextSession)
    setIndex(0)
    setSecondsLeft(nextSession.poses[0]?.sessionDuration ?? 60)
    setRunning(false)
    setSessionComplete(false)
    setView('review')
  }

  function startSession() {
    setIndex(0)
    setSecondsLeft(session.poses[0]?.sessionDuration ?? 60)
    setSessionComplete(false)
    setView('session')
    setRunning(false)
  }

  function goTo(nextIndex) {
    const safeIndex = Math.max(0, Math.min(session.poses.length - 1, nextIndex))
    setIndex(safeIndex)
    setSecondsLeft(session.poses[safeIndex].sessionDuration)
    setRunning(false)
  }

  function togglePlanDay(day) {
    setWeeklyPlan((current) =>
      current.map((item) =>
        item.day === day ? { ...item, complete: !item.complete } : item,
      ),
    )
  }

  const filteredLibrary = libraryFilter === 'all'
    ? poses
    : poses.filter((pose) => pose.focuses.includes(libraryFilter))

  const completedThisWeek = weeklyPlan.filter((day) => day.complete).length

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setView('build')}>
          <span>U</span>
          <strong>UNROUTINE</strong>
        </button>

        <nav className="nav-tabs" aria-label="Primary">
          {[
            ['build', 'Build'],
            ['plan', 'Week'],
            ['library', 'Library'],
            ['history', 'History'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={view === id ? 'nav-tab active' : 'nav-tab'}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {view === 'build' && (
        <section className="builder-layout">
          <div className="intro-copy">
            <p className="eyebrow">SESSION GENERATOR</p>
            <h1>Move for the day you actually have.</h1>
            <p className="lede">
              Choose your time, focus and intensity. Unroutine builds the sequence.
            </p>
          </div>

          <div className="builder-card">
            <div className="field-group">
              <div className="field-heading">
                <span>01</span>
                <div>
                  <strong>How much time?</strong>
                  <small>Pick the session length that fits today.</small>
                </div>
              </div>
              <div className="option-grid compact">
                {[10, 20, 30].map((minutes) => (
                  <button
                    key={minutes}
                    className={preferences.minutes === minutes ? 'choice active' : 'choice'}
                    onClick={() => updatePreference('minutes', minutes)}
                  >
                    <strong>{minutes}</strong>
                    <span>min</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <div className="field-heading">
                <span>02</span>
                <div>
                  <strong>What needs attention?</strong>
                  <small>The generator prioritizes poses tagged for this goal.</small>
                </div>
              </div>
              <div className="option-grid">
                {focusOptions.map((option) => (
                  <button
                    key={option.id}
                    className={preferences.focus === option.id ? 'choice text-choice active' : 'choice text-choice'}
                    onClick={() => updatePreference('focus', option.id)}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="field-group">
              <div className="field-heading">
                <span>03</span>
                <div>
                  <strong>How hard?</strong>
                  <small>Intensity controls the maximum pose difficulty.</small>
                </div>
              </div>
              <div className="option-grid compact">
                {intensityOptions.map((option) => (
                  <button
                    key={option.id}
                    className={preferences.intensity === option.id ? 'choice active' : 'choice'}
                    onClick={() => updatePreference('intensity', option.id)}
                  >
                    <strong>{option.label}</strong>
                  </button>
                ))}
              </div>
            </div>

            <label className="voice-toggle">
              <input
                type="checkbox"
                checked={preferences.voice}
                onChange={(event) => updatePreference('voice', event.target.checked)}
              />
              <span>
                <strong>Voice cues</strong>
                <small>Announce each new pose during the session.</small>
              </span>
            </label>

            <button className="generate-button" onClick={() => createSession()}>
              Generate my flow
              <span>→</span>
            </button>
          </div>
        </section>
      )}

      {view === 'review' && (
        <section className="content-page">
          <div className="page-heading split-heading">
            <div>
              <p className="eyebrow">YOUR GENERATED FLOW</p>
              <h1>{titleCase(session.focus)} session</h1>
              <p className="lede">
                {Math.round(session.totalSeconds / 60)} minutes · {session.poses.length} movements · {titleCase(session.intensity)}
              </p>
            </div>
            <div className="heading-actions">
              <button className="secondary-button" onClick={() => setView('build')}>Adjust</button>
              <button className="primary-button" onClick={startSession}>Start session</button>
            </div>
          </div>

          <div className="sequence">
            {session.poses.map((pose, poseIndex) => (
              <article className="sequence-row" key={pose.id}>
                <div className="sequence-number">{String(poseIndex + 1).padStart(2, '0')}</div>
                <div className="mini-illustration" data-category={pose.category}>
                  <span>{pose.name.slice(0, 1)}</span>
                </div>
                <div className="sequence-copy">
                  <strong>{pose.name}</strong>
                  <span>{pose.cue}</span>
                  <small>{pose.category} · difficulty {pose.difficulty}</small>
                </div>
                <time>{formatTime(pose.sessionDuration)}</time>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === 'session' && currentPose && (
        <section className="session-view">
          <div className="session-topline">
            <button className="text-button" onClick={() => { setRunning(false); setView('review') }}>← Flow</button>
            <span>{index + 1} / {session.poses.length}</span>
          </div>

          <div className="progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>

          {sessionComplete ? (
            <div className="completion-card">
              <p className="eyebrow">SESSION COMPLETE</p>
              <h1>That one counts.</h1>
              <p>
                You completed {Math.round(session.totalSeconds / 60)} minutes of {titleCase(session.focus)} work.
              </p>
              <div className="completion-actions">
                <button className="secondary-button" onClick={() => createSession()}>Generate another</button>
                <button className="primary-button" onClick={() => setView('history')}>View history</button>
              </div>
            </div>
          ) : (
            <>
              <div className="player-grid">
                <div className="large-illustration" data-category={currentPose.category}>
                  <span>{currentPose.name.slice(0, 1)}</span>
                  <small>{currentPose.category}</small>
                </div>

                <div className="player-copy">
                  <p className="eyebrow">{currentPose.focuses.map(titleCase).join(' · ')}</p>
                  <h1>{currentPose.name}</h1>
                  <p>{currentPose.cue}</p>
                  <div className="difficulty">
                    <span>Difficulty</span>
                    <div>{'●'.repeat(currentPose.difficulty)}{'○'.repeat(3 - currentPose.difficulty)}</div>
                  </div>
                </div>
              </div>

              <div className="timer">{formatTime(secondsLeft)}</div>

              <div className="player-controls">
                <button className="round-button" onClick={() => goTo(index - 1)} disabled={index === 0}>←</button>
                <button
                  className="play-button"
                  onClick={() => {
                    if (!running) speak(currentPose.name, preferences.voice)
                    setRunning((value) => !value)
                  }}
                >
                  {running ? 'Pause' : 'Start'}
                </button>
                <button className="round-button" onClick={() => goTo(index + 1)} disabled={index === session.poses.length - 1}>→</button>
              </div>

              {index < session.poses.length - 1 && (
                <div className="up-next">
                  <span>Up next</span>
                  <strong>{session.poses[index + 1].name}</strong>
                  <time>{formatTime(session.poses[index + 1].sessionDuration)}</time>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {view === 'plan' && (
        <section className="content-page">
          <div className="page-heading">
            <p className="eyebrow">WEEKLY PLAN</p>
            <h1>A realistic week, not a perfect one.</h1>
            <p className="lede">{completedThisWeek} of 7 sessions marked complete.</p>
          </div>

          <div className="week-progress">
            <span style={{ width: `${(completedThisWeek / 7) * 100}%` }} />
          </div>

          <div className="week-grid">
            {weeklyPlan.map((item) => (
              <article className={item.complete ? 'day-card complete' : 'day-card'} key={item.day}>
                <div>
                  <span className="day-name">{item.day}</span>
                  <h3>{titleCase(item.focus)}</h3>
                  <p>{item.minutes} min · {titleCase(item.intensity)}</p>
                </div>
                <div className="day-actions">
                  <button onClick={() => createSession({
                    minutes: item.minutes,
                    focus: item.focus,
                    intensity: item.intensity,
                  })}>Build</button>
                  <button className="check-button" onClick={() => togglePlanDay(item.day)}>
                    {item.complete ? '✓' : '○'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button
            className="secondary-button reset-plan"
            onClick={() => setWeeklyPlan(buildWeeklyPlan())}
          >
            Reset week
          </button>
        </section>
      )}

      {view === 'library' && (
        <section className="content-page">
          <div className="page-heading">
            <p className="eyebrow">POSE LIBRARY</p>
            <h1>{poses.length} movements and growing.</h1>
            <p className="lede">
              Every movement has tags the generator uses to assemble sensible sessions.
            </p>
          </div>

          <div className="filter-row">
            {['all', ...focusOptions.map((item) => item.id)].map((filter) => (
              <button
                key={filter}
                className={libraryFilter === filter ? 'filter-chip active' : 'filter-chip'}
                onClick={() => setLibraryFilter(filter)}
              >
                {titleCase(filter)}
              </button>
            ))}
          </div>

          <div className="library-grid">
            {filteredLibrary.map((pose) => (
              <article className="library-card" key={pose.id}>
                <div className="library-visual" data-category={pose.category}>
                  <span>{pose.name.slice(0, 1)}</span>
                </div>
                <div>
                  <small>{pose.category}</small>
                  <h3>{pose.name}</h3>
                  <p>{pose.cue}</p>
                  <div className="tag-row">
                    {pose.focuses.map((focus) => <span key={focus}>{titleCase(focus)}</span>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {view === 'history' && (
        <section className="content-page">
          <div className="page-heading">
            <p className="eyebrow">TRAINING HISTORY</p>
            <h1>Consistency, visible.</h1>
            <p className="lede">Completed sessions are saved locally in this browser.</p>
          </div>

          {history.length === 0 ? (
            <div className="empty-state">
              <h3>No completed sessions yet.</h3>
              <p>Finish your first flow and it will show up here automatically.</p>
              <button className="primary-button" onClick={() => setView('build')}>Build a session</button>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <article className="history-row" key={item.id}>
                  <div>
                    <strong>{titleCase(item.focus)}</strong>
                    <span>{new Date(item.completedAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <strong>{item.minutes} min</strong>
                    <span>{titleCase(item.intensity)} · {item.poseCount} movements</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer>
        <span>UNROUTINE v1.0</span>
        <span>Built to adapt.</span>
      </footer>
    </main>
  )
}
