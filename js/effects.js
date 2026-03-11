/* ============================================================
   EFFECTS — Matrix Rain, Particles, Signal Interference,
             Data Streams, Avatar Glitch, Idle Screensaver
   T.M CORP — Cyberpunk CV
   ============================================================ */

/* Global FX toggle (used by SYSTEM OK button) */
window.fxEnabled = true

/* ============================================================
   MATRIX RAIN
   ============================================================ */
;(function () {
  const c   = document.getElementById('matrixCanvas')
  const ctx = c.getContext('2d')

  function resize () { c.width = innerWidth; c.height = innerHeight }
  resize()
  window.addEventListener('resize', resize)

  const chars    = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/{}[]|'
  const fontSize = 14
  let columns, drops

  function initDrops () {
    columns = Math.floor(c.width / fontSize)
    drops   = Array.from({ length: columns }, () => Math.random() * c.height / fontSize | 0)
  }
  initDrops()
  window.addEventListener('resize', initDrops)

  function draw () {
    ctx.fillStyle = 'rgba(3,8,18,0.12)'
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.font = fontSize + 'px Share Tech Mono'

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.random() * chars.length | 0]
      const x = i * fontSize
      const y = drops[i] * fontSize

      ctx.fillStyle = Math.random() > 0.98
        ? 'rgba(255,0,255,0.8)'
        : 'rgba(0,245,255,0.6)'
      ctx.fillText(char, x, y)

      if (y > c.height && Math.random() > 0.975) drops[i] = 0
      drops[i] += 0.25
    }
    requestAnimationFrame(draw)
  }
  draw()
})()

/* ============================================================
   FLOATING PARTICLES (with cursor repulsion)
   ============================================================ */
;(function () {
  const c   = document.getElementById('particleCanvas')
  const ctx = c.getContext('2d')

  function resize () { c.width = innerWidth; c.height = innerHeight }
  resize()
  window.addEventListener('resize', resize)

  let mouseX = -1000, mouseY = -1000
  const REPEL = 100
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY })

  const particles = []
  const COUNT = 60

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:  Math.random() * innerWidth,
      y:  Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r:  Math.random() * 2 + 0.5,
      o:  Math.random() * 0.4 + 0.1
    })
  }

  function draw () {
    ctx.clearRect(0, 0, c.width, c.height)

    for (const p of particles) {
      /* Repel from cursor */
      const dx = p.x - mouseX
      const dy = p.y - mouseY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < REPEL && dist > 0) {
        const force = (1 - dist / REPEL) * 0.8
        p.vx += dx / dist * force
        p.vy += dy / dist * force
      }

      /* Dampen & move */
      p.vx *= 0.98
      p.vy *= 0.98
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = c.width
      if (p.x > c.width) p.x = 0
      if (p.y < 0) p.y = c.height
      if (p.y > c.height) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(0,245,255,${p.o})`
      ctx.fill()
    }

    /* Draw connections between nearby particles */
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(0,245,255,${0.08 * (1 - dist / 120)})`
          ctx.stroke()
        }
      }
    }
    requestAnimationFrame(draw)
  }
  draw()
})()

/* ============================================================
   TYPING TAGLINE
   ============================================================ */
window.typeTagline = function () {
  const el   = document.getElementById('taglineTyper')
  const text = 'WEB INTEGRATOR | DEVELOPER FRONT-END | AI EXPLORER'
  let i = 0
  const cursor = document.createElement('span')
  cursor.className = 'tagline-cursor'
  el.appendChild(cursor)

  function type () {
    if (i < text.length) {
      el.insertBefore(document.createTextNode(text[i]), cursor)
      i++
      setTimeout(type, 50 + Math.random() * 30)
    } else {
      setTimeout(() => cursor.remove(), 2000)
    }
  }
  type()
}

/* ============================================================
   SIGNAL INTERFERENCE (random screen glitch)
   ============================================================ */
window.signalInterference = function () {
  if (!fxEnabled) return

  /* Glitch sound — layered noise + tone burst */
  if (window.audioCtx) {
    const ctx = window.audioCtx
    const t = ctx.currentTime
    const dur = 0.35

    /* Layer 1: harsh noise */
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
    const nd = noiseBuf.getChannelData(0)
    for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * 0.6
    const noiseSrc = ctx.createBufferSource()
    noiseSrc.buffer = noiseBuf
    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.3, t)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur)
    noiseSrc.connect(noiseGain).connect(ctx.destination)
    noiseSrc.start(t)

    /* Layer 2: digital crackle tone */
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(120, t)
    osc.frequency.linearRampToValueAtTime(40, t + dur)
    const oscGain = ctx.createGain()
    oscGain.gain.setValueAtTime(0.15, t)
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(oscGain).connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur)
  }

  const glitch = document.createElement('div')
  glitch.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;background:rgba(0,245,255,0.03);mix-blend-mode:overlay;'
  document.body.appendChild(glitch)

  const steps = 6
  let step = 0
  const interval = setInterval(() => {
    step++
    if (step % 2 === 0) {
      glitch.style.background = 'rgba(255,0,255,0.04)'
      glitch.style.transform  = `translateX(${(Math.random() - 0.5) * 8}px) translateY(${(Math.random() - 0.5) * 4}px)`
      document.body.style.filter = `hue-rotate(${Math.random() * 30 - 15}deg) brightness(${1 + Math.random() * 0.15})`
    } else {
      glitch.style.background = 'rgba(0,245,255,0.03)'
      glitch.style.transform  = 'none'
      document.body.style.filter = 'none'
    }
    if (step >= steps) {
      clearInterval(interval)
      glitch.remove()
      document.body.style.filter = 'none'
    }
  }, 80)

  /* Schedule next interference */
  setTimeout(signalInterference, 20000 + Math.random() * 40000)
}

/* ============================================================
   DATA STREAM BORDERS
   ============================================================ */
window.initDataStream = function () {
  const panels = document.querySelectorAll('.panel-section')
  panels.forEach(panel => {
    const stream = document.createElement('div')
    stream.className = 'data-stream'
    panel.style.position = 'relative'
    panel.appendChild(stream)

    function generateChars () {
      if (!fxEnabled) { stream.textContent = ''; return }
      let s = ''
      for (let i = 0; i < 60; i++) {
        s += Math.random() > 0.5
          ? Math.floor(Math.random() * 16).toString(16).toUpperCase()
          : String.fromCharCode(0x30A0 + Math.random() * 96)
      }
      stream.textContent = s
    }
    setInterval(generateChars, 150)
    generateChars()
  })
}

/* ============================================================
   SYSTEM OK / FX TOGGLE
   ============================================================ */
window.systemOkEl = null

window.toggleFx = function () {
  fxEnabled = !fxEnabled
  const dot   = systemOkEl.querySelector('.hud-dot')
  const label = systemOkEl.querySelector('span')

  if (fxEnabled) {
    dot.classList.remove('red')
    dot.classList.add('green')
    label.textContent = 'SYSTEM OK'
    document.getElementById('matrixCanvas').style.display   = ''
    document.getElementById('particleCanvas').style.display = ''
    document.querySelectorAll('.data-stream').forEach(d => d.style.display = '')
    if (ambientGain) ambientGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 1)
  } else {
    dot.classList.remove('green')
    dot.classList.add('red')
    label.textContent = 'FX OFF'
    document.getElementById('matrixCanvas').style.display   = 'none'
    document.getElementById('particleCanvas').style.display = 'none'
    document.querySelectorAll('.data-stream').forEach(d => d.style.display = 'none')
    if (ambientGain) ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1)
  }
}

/* ============================================================
   AVATAR RANDOM GLITCH
   ============================================================ */
;(function () {
  function avatarGlitch () {
    if (!fxEnabled) return setTimeout(avatarGlitch, 5000 + Math.random() * 10000)
    const holo = document.querySelector('.avatar-holo')
    if (!holo) return setTimeout(avatarGlitch, 5000 + Math.random() * 10000)

    holo.style.transition = 'none'
    const steps = 4
    let i = 0
    const iv = setInterval(() => {
      if (i % 2 === 0) {
        holo.style.transform = `translate(${(Math.random() - 0.5) * 6}px,${(Math.random() - 0.5) * 4}px) skewX(${(Math.random() - 0.5) * 4}deg)`
        holo.style.filter    = `hue-rotate(${Math.random() * 60 - 30}deg) brightness(${1 + Math.random() * 0.3})`
      } else {
        holo.style.transform = 'none'
        holo.style.filter    = 'none'
      }
      i++
      if (i >= steps) {
        clearInterval(iv)
        holo.style.transform = 'none'
        holo.style.filter    = 'none'
      }
    }, 100)
    setTimeout(avatarGlitch, 5000 + Math.random() * 15000)
  }
  setTimeout(avatarGlitch, 3000)
})()

/* ============================================================
   CLOCK
   ============================================================ */
setInterval(() => {
  const d = new Date()
  document.getElementById('clock').textContent =
    d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}, 1000)

/* ============================================================
   UPTIME
   ============================================================ */
let uptimeStart
window.startUptime = function () {
  uptimeStart = Date.now()
  setInterval(() => {
    const s   = Math.floor((Date.now() - uptimeStart) / 1000)
    const m   = Math.floor(s / 60)
    const sec = s % 60
    document.getElementById('uptimeCounter').textContent =
      `UPTIME ${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }, 1000)
}

/* ============================================================
   IDLE SCREENSAVER (3 minutes)
   ============================================================ */
;(function () {
  let idleTimer = null
  const IDLE_MS = 180000
  const matrixCanvas = document.getElementById('matrixCanvas')

  function goIdle () {
    if (!fxEnabled) return
    matrixCanvas.style.transition = 'opacity 1s ease'
    matrixCanvas.style.opacity    = '0.7'
    matrixCanvas.style.zIndex     = '9000'
  }

  function wakeUp () {
    matrixCanvas.style.transition = 'opacity 1s ease'
    matrixCanvas.style.opacity    = '0.12'
    matrixCanvas.style.zIndex     = '0'
  }

  function resetIdle () {
    if (idleTimer) clearTimeout(idleTimer)
    wakeUp()
    idleTimer = setTimeout(goIdle, IDLE_MS)
  }

  ;['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
    document.addEventListener(evt, resetIdle, { passive: true })
  })
  resetIdle()
})()
