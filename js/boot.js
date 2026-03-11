/* ============================================================
   BOOT — Init Screen, Lock Screen, Boot Sequence
   T.M CORP — Cyberpunk CV
   ============================================================ */

;(function () {
  const initScreen = document.getElementById('initScreen')
  const lockScreen = document.getElementById('lockScreen')
  const field      = document.getElementById('lockField')
  const cursor     = document.getElementById('lockCursor')
  const status     = document.getElementById('lockStatus')
  const password   = 'TM-CORP-2026'

  /* --- Init Screen: click or Enter to begin --- */
  function initStart () {
    if (lockScreen.style.display === 'flex') return
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    initScreen.style.display = 'none'
    lockScreen.style.display = 'flex'
    startUptime()
    setTimeout(typeNext, 600)
  }

  initScreen.addEventListener('click', initStart)
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && initScreen.style.display !== 'none') initStart()
  })

  /* --- Lock Screen: auto-type password --- */
  let charIdx = 0

  function typeNext () {
    if (charIdx >= password.length) {
      cursor.style.display = 'none'
      setTimeout(() => {
        status.textContent = 'ACCESS GRANTED'
        status.classList.add('granted')
        playGranted()
        setTimeout(() => {
          lockScreen.classList.add('hidden')
          setTimeout(() => {
            lockScreen.style.display = 'none'
            document.getElementById('bootScreen').style.display = 'flex'
            startBoot()
          }, 700)
        }, 800)
      }, 400)
      return
    }

    const span = document.createElement('span')
    span.className = 'lock-char'
    span.textContent = '*'
    field.insertBefore(span, cursor)
    requestAnimationFrame(() => span.classList.add('visible'))
    playKey()
    charIdx++

    setTimeout(typeNext, 80 + Math.random() * 100)
  }
})()

/* ============================================================
   BOOT SEQUENCE
   ============================================================ */

window.startBoot = function () {
  playBootDrone()

  const bootLines = [
    { text: '[T.M CORP] Kernel v4.2.1 loaded',              cls: '' },
    { text: '[BIOS]  Memory check... 16384 MB OK',          cls: '' },
    { text: '[SYS]   Mounting /dev/persona...',              cls: '' },
    { text: '[NET]   Establishing neural link... ',          cls: '' },
    { text: '[SEC]   Firewall active — threat level: LOW',   cls: 'success' },
    { text: '[DATA]  Loading experience database...',        cls: '' },
    { text: '[DATA]  Loading skill matrix...',               cls: '' },
    { text: '[GPU]   Rendering pipeline initialized',        cls: '' },
    { text: '[AI]    Co-pilot module: STANDBY',              cls: 'warn' },
    { text: '[T.M CORP] All systems nominal',                cls: 'success' },
    { text: '',                                              cls: '' },
    { text: 'Welcome, Recrutor.',                            cls: 'success' },
  ]

  const container = document.getElementById('bootTerminal')
  const bar       = document.getElementById('bootProgressBar')
  let idx = 0

  function addLine () {
    if (idx >= bootLines.length) {
      bar.style.width = '100%'

      /* Success chime */
      if (audioCtx) {
        const notes = [523, 659, 784, 1047]
        notes.forEach((f, i) => {
          const o = audioCtx.createOscillator()
          const g = audioCtx.createGain()
          o.connect(g); g.connect(audioCtx.destination)
          o.type = 'sine'
          o.frequency.value = f
          g.gain.setValueAtTime(0.06, audioCtx.currentTime + i * 0.12)
          g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.12 + 0.4)
          o.start(audioCtx.currentTime + i * 0.12)
          o.stop(audioCtx.currentTime + i * 0.12 + 0.4)
        })
      }

      /* Transition to main app */
      setTimeout(() => {
        document.getElementById('bootScreen').classList.add('hidden')
        setTimeout(() => {
          document.getElementById('bootScreen').style.display = 'none'
          document.getElementById('blackOverlay').classList.add('hidden')
          document.body.classList.add('custom-cursor')

          const app = document.getElementById('app')
          app.style.display = 'block'
          requestAnimationFrame(() => app.classList.add('visible'))

          animateSkillBars()
          initRadar()

          /* Show SYSTEM OK indicator */
          document.getElementById('monitorHudLeft').style.display = 'flex'
          window.systemOkEl = document.querySelector('#monitorHudLeft .hud-indicator')
          window.systemOkEl.style.cursor = 'pointer'
          window.systemOkEl.addEventListener('click', toggleFx)

          termLog('system ready', 'system')
          termLog('type "help" for commands', 'info')
          if (window.innerWidth > 480) showTerminal()

          startAmbient()
          typeTagline()
          initDataStream()
          setTimeout(signalInterference, 15000 + Math.random() * 20000)
        }, 900)
      }, 600)
      return
    }

    const line = document.createElement('div')
    line.className = 'line ' + bootLines[idx].cls
    line.textContent = '> ' + bootLines[idx].text
    container.appendChild(line)
    requestAnimationFrame(() => line.classList.add('visible'))
    if (bootLines[idx].text) playLogBeep(bootLines[idx].cls)

    bar.style.width = ((idx + 1) / bootLines.length * 100) + '%'
    idx++
    setTimeout(addLine, 300 + Math.random() * 250)
  }

  setTimeout(addLine, 800)
}
