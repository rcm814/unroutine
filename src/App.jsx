import { useEffect, useMemo, useState } from 'react'
import { starterFlow } from './data/flow.js'

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = String(seconds % 60).padStart(2, '0')
  return `${mins}:${secs}`
}

export default function App() {
  const [index, setIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(starterFlow[0].duration)
  const [running, setRunning] = useState(false)

  const pose = starterFlow[index]
  const progress = ((index + 1) / starterFlow.length) * 100
  const totalMinutes = useMemo(
    () => Math.ceil(starterFlow.reduce((sum, item) => sum + item.duration, 0) / 60),
    [],
  )

  useEffect(() => {
    if (!running) return

    if (secondsLeft <= 0) {
      if (index < starterFlow.length - 1) {
        const nextIndex = index + 1
        setIndex(nextIndex)
        setSecondsLeft(starterFlow[nextIndex].duration)
      } else {
        setRunning(false)
      }
      return
    }

    const timer = window.setTimeout(
      () => setSecondsLeft((value) => value - 1),
      1000,
    )

    return () => window.clearTimeout(timer)
  }, [running, secondsLeft, index])

  function goTo(nextIndex) {
    const safeIndex = Math.max(0, Math.min(starterFlow.length - 1, nextIndex))
    setIndex(safeIndex)
    setSecondsLeft(starterFlow[safeIndex].duration)
    setRunning(false)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">UNROUTINE</p>
          <h1>Move for the day you actually have.</h1>
        </div>
        <span className="session-pill">{totalMinutes} min flow</span>
      </header>

      <section className="hero-card">
        <div className="progress-track">
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="pose-meta">
          <span>Pose {index + 1} of {starterFlow.length}</span>
          <span>{pose.focus}</span>
        </div>

        <div className="pose-stage">
          <div className="pose-visual" aria-hidden="true">
            <span>{index + 1}</span>
          </div>

          <div className="pose-copy">
            <p className="eyebrow">CURRENT MOVE</p>
            <h2>{pose.name}</h2>
            <p>{pose.cue}</p>
          </div>
        </div>

        <div className="timer">{formatTime(secondsLeft)}</div>

        <div className="controls">
          <button className="secondary" onClick={() => goTo(index - 1)} disabled={index === 0}>Back</button>
          <button className="primary" onClick={() => setRunning((value) => !value)}>{running ? 'Pause' : 'Start'}</button>
          <button className="secondary" onClick={() => goTo(index + 1)} disabled={index === starterFlow.length - 1}>Next</button>
        </div>
      </section>

      <section className="queue">
        <div className="section-heading">
          <div>
            <p className="eyebrow">TODAY'S FLOW</p>
            <h3>Hip + T-spine reset</h3>
          </div>
          <span>{starterFlow.length} movements</span>
        </div>

        <div className="pose-list">
          {starterFlow.map((item, itemIndex) => (
            <button
              key={item.name}
              className={itemIndex === index ? 'pose-row active' : 'pose-row'}
              onClick={() => goTo(itemIndex)}
            >
              <span className="pose-number">{String(itemIndex + 1).padStart(2, '0')}</span>
              <span className="pose-name">
                <strong>{item.name}</strong>
                <small>{item.focus}</small>
              </span>
              <span>{formatTime(item.duration)}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
