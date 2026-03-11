/* ============================================================
   GAME — Space Invader + Konami Code
   T.M CORP — Cyberpunk CV
   ============================================================ */

let invaderRunning = false
let invaderRAF     = null
let invaderKeyDown = null
let invaderKeyUp   = null

/* ============================================================
   LAUNCH INVADER
   ============================================================ */
window.launchInvader = function () {
  if (invaderRunning) return
  invaderRunning = true

  const container = document.getElementById('invaderGame')
  const canvas    = document.getElementById('invCanvas')
  const ctx       = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  container.classList.add('active')

  let score = 0, lives = 3, gameOver = false
  const scoreEl = document.getElementById('invScore')
  const livesEl = document.getElementById('invLives')
  scoreEl.textContent = '0'
  livesEl.textContent = '3'

  /* Player */
  const player = { x: W / 2 - 15, y: H - 30, w: 30, h: 14, speed: 4 }
  const bullets      = []
  const enemyBullets = []

  /* Enemies */
  const enemies = []
  const rows = 4, cols = 8, ew = 28, eh = 18, pad = 8
  let enemyDir = 1, enemySpeed = 0.6
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({
        x: 50 + c * (ew + pad),
        y: 30 + r * (eh + pad),
        w: ew, h: eh,
        alive: true,
        row: r
      })
    }
  }

  const keys = {}

  function closeGame () {
    invaderRunning = false
    stopMusic()
    if (invaderRAF) cancelAnimationFrame(invaderRAF)
    container.classList.remove('active')
    document.removeEventListener('keydown', invaderKeyDown)
    document.removeEventListener('keyup', invaderKeyUp)
  }

  function onKey (e) {
    if (e.key === 'Escape' && e.type === 'keydown') { closeGame(); return }
    keys[e.key] = e.type === 'keydown'
    if (e.key === ' ' && e.type === 'keydown') {
      e.preventDefault()
      if (bullets.length < 3) {
        bullets.push({ x: player.x + player.w / 2 - 1, y: player.y, w: 2, h: 8 })
        /* Shoot sound */
        if (audioCtx) {
          const o = audioCtx.createOscillator()
          const g = audioCtx.createGain()
          o.connect(g); g.connect(audioCtx.destination)
          o.type = 'square'
          o.frequency.value = 900
          g.gain.value = 0.04
          o.start()
          g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08)
          o.stop(audioCtx.currentTime + 0.08)
        }
      }
    }
  }

  invaderKeyDown = onKey
  invaderKeyUp   = onKey
  document.addEventListener('keydown', invaderKeyDown)
  document.addEventListener('keyup', invaderKeyUp)

  const rowColors = ['#ff3344', '#ffaa00', '#00ff9c', '#00f5ff']

  /* --- Sound Effects --- */
  function playExplosion () {
    if (!audioCtx) return
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.1, audioCtx.sampleRate)
    const d   = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.2))
    const s = audioCtx.createBufferSource(); s.buffer = buf
    const f = audioCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600
    const g = audioCtx.createGain(); g.gain.value = 0.15
    s.connect(f); f.connect(g); g.connect(audioCtx.destination); s.start()
  }

  function playPlayerHit () {
    if (!audioCtx) return
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate)
    const d   = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.3))
    const s = audioCtx.createBufferSource(); s.buffer = buf
    const f = audioCtx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 250
    const g = audioCtx.createGain(); g.gain.value = 0.25
    s.connect(f); f.connect(g); g.connect(audioCtx.destination); s.start()
  }

  /* --- Music (accelerating bass loop) --- */
  let musicInterval = null
  let musicBeat     = 0
  const musicNotes  = [80, 60, 70, 50]

  function playMusicBeat () {
    if (!audioCtx || gameOver) { stopMusic(); return }
    const alive = enemies.filter(e => e.alive).length
    const total = rows * cols
    const speed = Math.max(120, 500 * (alive / total))

    const o = audioCtx.createOscillator()
    const g = audioCtx.createGain()
    o.connect(g); g.connect(audioCtx.destination)
    o.type = 'square'
    o.frequency.value = musicNotes[musicBeat % musicNotes.length]
    g.gain.setValueAtTime(0.045, audioCtx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12)
    o.start()
    o.stop(audioCtx.currentTime + 0.12)
    musicBeat++

    clearTimeout(musicInterval)
    musicInterval = setTimeout(playMusicBeat, speed)
  }

  function startMusic () { musicBeat = 0; playMusicBeat() }
  function stopMusic ()  { clearTimeout(musicInterval); musicInterval = null }

  let endSoundPlayed = false

  function playVictory () {
    if (!audioCtx) return
    ;[523, 659, 784, 1047, 1318].forEach((f, i) => {
      const o = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      o.connect(g); g.connect(audioCtx.destination)
      o.type = 'sine'; o.frequency.value = f
      g.gain.setValueAtTime(0.06, audioCtx.currentTime + i * 0.15)
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.15 + 0.4)
      o.start(audioCtx.currentTime + i * 0.15)
      o.stop(audioCtx.currentTime + i * 0.15 + 0.4)
    })
  }

  function playDefeat () {
    if (!audioCtx) return
    ;[400, 300, 200, 120].forEach((f, i) => {
      const o = audioCtx.createOscillator()
      const g = audioCtx.createGain()
      o.connect(g); g.connect(audioCtx.destination)
      o.type = 'sawtooth'; o.frequency.value = f
      g.gain.setValueAtTime(0.05, audioCtx.currentTime + i * 0.2)
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.2 + 0.35)
      o.start(audioCtx.currentTime + i * 0.2)
      o.stop(audioCtx.currentTime + i * 0.2 + 0.35)
    })
  }

  /* --- Game Logic --- */
  function update () {
    if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed
    if (keys['ArrowRight'] && player.x < W - player.w) player.x += player.speed

    /* Move bullets */
    for (let i = bullets.length - 1; i >= 0; i--) {
      bullets[i].y -= 6
      if (bullets[i].y < 0) bullets.splice(i, 1)
    }

    /* Move enemy bullets */
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      enemyBullets[i].y += 3
      if (enemyBullets[i].y > H) enemyBullets.splice(i, 1)
    }

    /* Enemy movement */
    let hitEdge = false
    for (const e of enemies) {
      if (!e.alive) continue
      e.x += enemySpeed * enemyDir
      if (e.x + e.w > W - 10 || e.x < 10) hitEdge = true
    }
    if (hitEdge) {
      enemyDir *= -1
      for (const e of enemies) e.y += 12
    }

    /* Enemy shoot */
    if (Math.random() < 0.02) {
      const alive = enemies.filter(e => e.alive)
      if (alive.length) {
        const e = alive[Math.random() * alive.length | 0]
        enemyBullets.push({ x: e.x + e.w / 2, y: e.y + e.h, w: 2, h: 8 })
      }
    }

    /* Bullet-enemy collision */
    for (let i = bullets.length - 1; i >= 0; i--) {
      for (const e of enemies) {
        if (!e.alive) continue
        if (bullets[i] &&
            bullets[i].x < e.x + e.w && bullets[i].x + bullets[i].w > e.x &&
            bullets[i].y < e.y + e.h && bullets[i].y + bullets[i].h > e.y) {
          e.alive = false
          bullets.splice(i, 1)
          score += 10 * (4 - e.row)
          scoreEl.textContent = score
          playExplosion()
          break
        }
      }
    }

    /* Enemy bullet-player collision */
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const b = enemyBullets[i]
      if (b.x < player.x + player.w && b.x + b.w > player.x &&
          b.y < player.y + player.h && b.y + b.h > player.y) {
        enemyBullets.splice(i, 1)
        lives--
        livesEl.textContent = lives
        playPlayerHit()
        if (lives <= 0) gameOver = true
      }
    }

    /* Win / lose checks */
    if (!enemies.some(e => e.alive)) gameOver = true
    if (enemies.some(e => e.alive && e.y + e.h >= player.y)) gameOver = true
  }

  /* --- Rendering --- */
  function draw () {
    ctx.clearRect(0, 0, W, H)

    /* Stars */
    ctx.fillStyle = 'rgba(0,245,255,0.15)'
    for (let i = 0; i < 30; i++) {
      ctx.fillRect((i * 73 + score) % W, (i * 137) % H, 1, 1)
    }

    /* Player */
    ctx.fillStyle = 'var(--cyan)'
    ctx.fillRect(player.x, player.y, player.w, player.h)
    ctx.fillStyle = '#fff'
    ctx.fillRect(player.x + player.w / 2 - 1, player.y - 4, 2, 4)

    /* Player bullets */
    ctx.fillStyle = 'var(--cyan)'
    ctx.shadowColor = '#00f5ff'; ctx.shadowBlur = 6
    for (const b of bullets) ctx.fillRect(b.x, b.y, b.w, b.h)
    ctx.shadowBlur = 0

    /* Enemy bullets */
    ctx.fillStyle = 'var(--red)'
    ctx.shadowColor = '#ff3344'; ctx.shadowBlur = 4
    for (const b of enemyBullets) ctx.fillRect(b.x, b.y, b.w, b.h)
    ctx.shadowBlur = 0

    /* Enemies */
    for (const e of enemies) {
      if (!e.alive) continue
      ctx.fillStyle = rowColors[e.row] || '#fff'
      const cx = e.x, cy = e.y, w = e.w, h = e.h
      ctx.fillRect(cx + 4, cy, w - 8, h)
      ctx.fillRect(cx, cy + 4, w, h - 8)
      ctx.fillRect(cx + 2, cy + 2, 4, 4)
      ctx.fillRect(cx + w - 6, cy + 2, 4, 4)
    }

    /* Game over screen */
    if (gameOver) {
      if (!endSoundPlayed) {
        endSoundPlayed = true
        const won = !enemies.some(e => e.alive)
        if (won) playVictory(); else playDefeat()
      }
      ctx.fillStyle = 'rgba(2,5,12,0.7)'
      ctx.fillRect(0, 0, W, H)
      ctx.font = 'bold 28px Orbitron'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const won = !enemies.some(e => e.alive)
      ctx.fillStyle = won ? '#00ff9c' : '#ff3344'
      ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 20
      ctx.fillText(won ? 'VICTORY' : 'GAME OVER', W / 2, H / 2 - 14)
      ctx.shadowBlur = 0
      ctx.font = '13px Share Tech Mono'
      ctx.fillStyle = 'rgba(200,230,255,0.5)'
      ctx.fillText('SCORE: ' + score, W / 2, H / 2 + 20)
      ctx.fillText('ESC to close', W / 2, H / 2 + 44)
    }
  }

  function loop () {
    if (!invaderRunning) return
    if (!gameOver) update()
    draw()
    invaderRAF = requestAnimationFrame(loop)
  }

  startMusic()
  loop()
}

/* ============================================================
   KONAMI CODE — ↑↑↓↓←→←→BA
   ============================================================ */
const konamiSequence = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'b', 'a'
]
let konamiIdx = 0

document.addEventListener('keydown', e => {
  if (invaderRunning) return
  if (e.key === konamiSequence[konamiIdx]) {
    konamiIdx++
    if (konamiIdx === konamiSequence.length) {
      konamiIdx = 0
      launchInvader()
      termLog('[GAME] KONAMI CODE — SPACE INVADER LAUNCHED', 'info')
    }
  } else {
    konamiIdx = 0
  }
})
