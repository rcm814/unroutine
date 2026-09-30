import { poses } from '../data/poses.js'

const categoryOrder = ['warmup', 'mobility', 'strength', 'deep', 'peak', 'cooldown']

function seededSort(items, seed) {
  return [...items].sort((a, b) => {
    const av = Array.from(a.id + seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97
    const bv = Array.from(b.id + seed).reduce((sum, char) => sum + char.charCodeAt(0), 0) % 97
    return av - bv
  })
}

export function generateFlow({ minutes, focus, intensity }) {
  const maxDifficulty = { easy: 1, moderate: 2, hard: 3 }[intensity] ?? 2
  const targetSeconds = minutes * 60
  const seed = `${minutes}-${focus}-${intensity}`

  let pool = poses.filter(
    (pose) => pose.focuses.includes(focus) && pose.difficulty <= maxDifficulty,
  )

  if (focus === 'full-lotus') {
    pool = pool.sort((a, b) => b.lotus - a.lotus)
  }

  const warmups = seededSort(
    poses.filter((pose) => pose.category === 'warmup' && pose.difficulty <= maxDifficulty),
    seed,
  )
  const cooldowns = seededSort(
    poses.filter((pose) => pose.category === 'cooldown' && pose.difficulty <= maxDifficulty),
    seed,
  )

  const selected = []
  const addUnique = (pose) => {
    if (pose && !selected.some((item) => item.id === pose.id)) selected.push(pose)
  }

  warmups.slice(0, minutes >= 20 ? 2 : 1).forEach(addUnique)

  const focusPool = seededSort(pool, seed)
  const coreTarget = minutes <= 10 ? 5 : minutes <= 20 ? 8 : 11
  focusPool.slice(0, coreTarget).forEach(addUnique)

  if (focus === 'full-lotus') {
    const peak = poses
      .filter((pose) => pose.category === 'peak' && pose.difficulty <= maxDifficulty)
      .sort((a, b) => b.lotus - a.lotus)[0]
    addUnique(peak)
  }

  cooldowns.slice(0, minutes >= 20 ? 2 : 1).forEach(addUnique)

  selected.sort(
    (a, b) => categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category),
  )

  let total = selected.reduce((sum, pose) => sum + pose.duration, 0)

  if (total < targetSeconds) {
    const extras = seededSort(
      poses.filter(
        (pose) =>
          pose.difficulty <= maxDifficulty &&
          !selected.some((selectedPose) => selectedPose.id === pose.id) &&
          (pose.focuses.includes(focus) || pose.focuses.includes('recovery')),
      ),
      seed + '-extra',
    )

    for (const pose of extras) {
      if (total >= targetSeconds * 0.92) break
      selected.splice(Math.max(1, selected.length - 1), 0, pose)
      total += pose.duration
    }
  }

  const scale = Math.min(1.45, Math.max(0.65, targetSeconds / total))
  const flow = selected.map((pose) => ({
    ...pose,
    sessionDuration: Math.max(30, Math.round((pose.duration * scale) / 15) * 15),
  }))

  return {
    id: `${Date.now()}-${focus}`,
    focus,
    intensity,
    requestedMinutes: minutes,
    generatedAt: new Date().toISOString(),
    poses: flow,
    totalSeconds: flow.reduce((sum, pose) => sum + pose.sessionDuration, 0),
  }
}
