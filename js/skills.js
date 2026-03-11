/* ============================================================
   SKILLS — Skill Data, Radar Chart, Tags
   T.M CORP — Cyberpunk CV
   ============================================================ */

/* ============================================================
   SKILL DATA
   ============================================================ */
const allSkills = [
  /* Core Technologies */
  { label: 'HTML5',      val: 95, color: '#00f5ff', group: 'core' },
  { label: 'CSS3',       val: 92, color: '#ff00ff', group: 'core' },
  { label: 'JavaScript', val: 82, color: '#ffaa00', group: 'core' },
  { label: 'WordPress',  val: 85, color: '#4488ff', group: 'core' },
  { label: 'Git',        val: 75, color: '#00ff9c', group: 'core' },
  /* Extended Systems */
  { label: 'Prompt Engineering', val: 80, color: '#ff8800', group: 'ext' },
  { label: 'AI Tools',          val: 85, color: '#aa55ff', group: 'ext' },
  { label: 'Responsive',        val: 90, color: '#00ffcc', group: 'ext' },
  { label: 'Automation',        val: 70, color: '#44ddff', group: 'ext' },
  { label: 'Adobe Suite',       val: 65, color: '#ff44aa', group: 'ext' },
]

let activeSkillIdx = -1 // -1 = all highlighted

/* ============================================================
   BUILD SKILL TAGS
   ============================================================ */
function buildSkillTags () {
  const coreContainer = document.getElementById('coreTechTags')
  const extContainer  = document.getElementById('extSysTags')

  allSkills.forEach((s, i) => {
    const tag = document.createElement('div')
    tag.className = 'skill-tag'
    tag.style.setProperty('--tag-color', s.color)
    tag.textContent = s.label
    tag.dataset.idx = i

    tag.addEventListener('click', () => {
      activeSkillIdx = (activeSkillIdx === i) ? -1 : i
      updateActiveTags()
    })

    if (s.group === 'core') coreContainer.appendChild(tag)
    else extContainer.appendChild(tag)
  })
}

function updateActiveTags () {
  document.querySelectorAll('.skill-tag').forEach(tag => {
    const idx = parseInt(tag.dataset.idx)
    tag.classList.toggle('active', idx === activeSkillIdx)
  })
}

/* ============================================================
   RADAR CHART — Canvas-based with pulse animation
   ============================================================ */
window.initRadar = function () {
  const canvas = document.getElementById('radarCanvas')
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  /* Responsive sizing */
  const mobile = window.innerWidth <= 480
  canvas.width  = mobile ? 340 : 400
  canvas.height = mobile ? 340 : 400
  const W  = canvas.width
  const H  = canvas.height
  const cx = W / 2
  const cy = H / 2
  const radius = mobile ? 115 : 150

  const n    = allSkills.length
  const step = Math.PI * 2 / n

  let pulse = 0

  function draw () {
    pulse += 0.015
    ctx.clearRect(0, 0, W, H)

    /* Grid rings (pentagon) */
    for (let r = 1; r <= 5; r++) {
      ctx.beginPath()
      for (let i = 0; i <= n; i++) {
        const a  = i * step - Math.PI / 2
        const rr = radius * (r / 5)
        const x  = cx + Math.cos(a) * rr
        const y  = cy + Math.sin(a) * rr
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(0,245,255,0.08)'
      ctx.lineWidth   = 1
      ctx.stroke()
    }

    /* Axes */
    for (let i = 0; i < n; i++) {
      const a = i * step - Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius)
      ctx.strokeStyle = 'rgba(0,245,255,0.06)'
      ctx.lineWidth   = 1
      ctx.stroke()
    }

    /* Filled polygon */
    ctx.beginPath()
    allSkills.forEach((s, i) => {
      const a = i * step - Math.PI / 2
      const r = radius * (s.val / 100)
      const x = cx + Math.cos(a) * r
      const y = cy + Math.sin(a) * r
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.fillStyle   = 'rgba(0,245,255,0.05)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,245,255,0.3)'
    ctx.lineWidth   = 1
    ctx.stroke()

    /* Dots + labels */
    allSkills.forEach((s, i) => {
      const a = i * step - Math.PI / 2
      const r = radius * (s.val / 100)
      const x = cx + Math.cos(a) * r
      const y = cy + Math.sin(a) * r

      const isActive = activeSkillIdx === -1 || activeSkillIdx === i
      const dotSize  = isActive ? (5 + Math.sin(pulse + i) * 2) : 2.5
      const alpha    = isActive ? 1 : 0.2

      /* Line from center — only when selected */
      if (activeSkillIdx === i) {
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.lineTo(x, y)
        ctx.strokeStyle = s.color
        ctx.globalAlpha = 0.5
        ctx.lineWidth   = 1.5
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      /* Dot */
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, Math.PI * 2)
      ctx.fillStyle   = s.color
      ctx.globalAlpha = alpha
      ctx.fill()
      if (isActive) {
        ctx.shadowColor = s.color
        ctx.shadowBlur  = 12
        ctx.fill()
        ctx.shadowBlur = 0
      }
      ctx.globalAlpha = 1

      /* Label */
      const labelOff  = mobile ? 16 : 22
      const labelSize = 11
      const lx = cx + Math.cos(a) * (radius + labelOff)
      const ly = cy + Math.sin(a) * (radius + labelOff)
      ctx.font      = isActive ? 'bold ' + labelSize + 'px Orbitron' : labelSize + 'px Orbitron'
      ctx.fillStyle = isActive ? s.color : 'rgba(200,230,255,0.4)'
      ctx.textAlign    = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.label, lx, ly)
    })

    requestAnimationFrame(draw)
  }

  draw()
  buildSkillTags()

  /* Click on radar nodes */
  canvas.style.cursor = 'pointer'
  canvas.addEventListener('click', e => {
    const rect   = canvas.getBoundingClientRect()
    const scaleX = W / rect.width
    const scaleY = H / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    let hit = -1
    allSkills.forEach((s, i) => {
      const a  = i * step - Math.PI / 2
      const r  = radius * (s.val / 100)
      const dx = mx - (cx + Math.cos(a) * r)
      const dy = my - (cy + Math.sin(a) * r)
      if (Math.sqrt(dx * dx + dy * dy) < 18) hit = i
    })

    activeSkillIdx = (hit !== -1)
      ? (activeSkillIdx === hit ? -1 : hit)
      : -1
    updateActiveTags()
    e.stopPropagation()
  })

  /* Click outside deselects */
  document.addEventListener('click', e => {
    if (activeSkillIdx === -1) return
    if (e.target.closest('.skill-tag')) return
    activeSkillIdx = -1
    updateActiveTags()
  })
}

/* Compatibility stub */
window.animateSkillBars = function () {}
