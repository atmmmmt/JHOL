const MOTION_EASE = [0.22, 1, 0.36, 1] as const

export const revealViewport = { once: true, amount: 0.25 }

export const fadeUp = (delay = 0, distance = 40, duration = 0.75) => ({
  initial: { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport: revealViewport,
  transition: { duration, delay, ease: MOTION_EASE },
})

export const fadeIn = (delay = 0, duration = 0.55) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: revealViewport,
  transition: { duration, delay, ease: MOTION_EASE },
})
