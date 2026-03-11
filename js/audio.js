/* ============================================================
   AUDIO — Web Audio API (ambient, beeps, sounds)
   T.M CORP — Cyberpunk CV
   ============================================================ */

/* Shared audio context — initialized on first user interaction */
window.audioCtx = null
window.ambientGain = null

/**
 * Key press sound — short noise burst (mechanical click)
 */
window.playKey = function () {
  if (!audioCtx) return
  const bufferSize = audioCtx.sampleRate * 0.03
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15))
  }
  const src = audioCtx.createBufferSource()
  src.buffer = buffer
  const filter = audioCtx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 800 + Math.random() * 200
  const gain = audioCtx.createGain()
  gain.gain.value = 0.2
  src.connect(filter)
  filter.connect(gain)
  gain.connect(audioCtx.destination)
  src.start()
}

/**
 * Boot drone — rising sweep sound
 */
window.playBootDrone = function () {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(100, audioCtx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 6)
  gain.gain.setValueAtTime(0.02, audioCtx.currentTime)
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 6)
  osc.start()
  osc.stop(audioCtx.currentTime + 6)
}

/**
 * Ambient hum — 3 layers: deep sine, harmonic, filtered noise
 */
window.startAmbient = function () {
  if (!audioCtx) return

  /* Layer 1 — deep hum */
  const osc1 = audioCtx.createOscillator()
  const g1 = audioCtx.createGain()
  osc1.connect(g1)
  osc1.type = 'sine'
  osc1.frequency.value = 55
  g1.gain.value = 0.012

  /* Layer 2 — higher harmonic */
  const osc2 = audioCtx.createOscillator()
  const g2 = audioCtx.createGain()
  osc2.connect(g2)
  osc2.type = 'sine'
  osc2.frequency.value = 110
  g2.gain.value = 0.006

  /* Layer 3 — filtered noise for texture */
  const bufSize = audioCtx.sampleRate * 2
  const noiseBuf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate)
  const data = noiseBuf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1
  const noiseSrc = audioCtx.createBufferSource()
  noiseSrc.buffer = noiseBuf
  noiseSrc.loop = true
  const noiseFilter = audioCtx.createBiquadFilter()
  noiseFilter.type = 'lowpass'
  noiseFilter.frequency.value = 200
  const g3 = audioCtx.createGain()
  g3.gain.value = 0.008
  noiseSrc.connect(noiseFilter)
  noiseFilter.connect(g3)

  /* Master gain */
  ambientGain = audioCtx.createGain()
  ambientGain.gain.value = 0
  ambientGain.connect(audioCtx.destination)
  g1.connect(ambientGain)
  g2.connect(ambientGain)
  g3.connect(ambientGain)

  osc1.start()
  osc2.start()
  noiseSrc.start()

  /* Fade in over 3 seconds */
  ambientGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 3)

  /* Layer 4 — random electronic blips */
  function scheduleBlip () {
    if (!audioCtx || audioCtx.state === 'closed') return
    const t = audioCtx.currentTime
    const freq = [800, 1200, 1600, 2000, 2400, 3200][Math.floor(Math.random() * 6)]
    const dur = 0.04 + Math.random() * 0.06

    const osc = audioCtx.createOscillator()
    osc.type = ['sine', 'triangle'][Math.floor(Math.random() * 2)]
    osc.frequency.setValueAtTime(freq, t)

    const g = audioCtx.createGain()
    g.gain.setValueAtTime(0.015 + Math.random() * 0.01, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)

    osc.connect(g).connect(ambientGain)
    osc.start(t)
    osc.stop(t + dur)

    /* Next blip in 3–8 seconds */
    setTimeout(scheduleBlip, 3000 + Math.random() * 5000)
  }
  setTimeout(scheduleBlip, 4000)
}

/**
 * Terminal log beep — different tones per class
 */
window.playLogBeep = function (cls) {
  if (!audioCtx) return
  const tones = {
    '':        { freq: 500, type: 'sine' },
    'success': { freq: 700, type: 'sine' },
    'warn':    { freq: 350, type: 'triangle' },
    'error':   { freq: 200, type: 'sawtooth' },
    'system':  { freq: 500, type: 'sine' },
    'info':    { freq: 600, type: 'sine' },
  }
  const t = tones[cls || ''] || tones['']
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.type = t.type
  osc.frequency.value = t.freq
  gain.gain.value = 0.04
  osc.start()
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08)
  osc.stop(audioCtx.currentTime + 0.08)
}

/**
 * Access granted chime — ascending notes
 */
window.playGranted = function () {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  const notes = [600, 800, 1000, 1200]
  notes.forEach((f, i) => {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.type = 'sine'
    osc.frequency.value = f
    gain.gain.value = 0.06
    osc.start(audioCtx.currentTime + i * 0.08)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.08 + 0.15)
    osc.stop(audioCtx.currentTime + i * 0.08 + 0.15)
  })
}
