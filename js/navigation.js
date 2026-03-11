/* ============================================================
   NAVIGATION — Tabs, Section Switching, Decode Reveal
   T.M CORP — Cyberpunk CV
   ============================================================ */

/* ============================================================
   DECODE REVEAL — Scramble text then progressively decode
   ============================================================ */
const decodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?/<>[]{}=+-_~^'

window.decodeReveal = function (container) {
  /* Shimmer skeleton placeholder */
  const panels = container.querySelectorAll('.panel-body')
  panels.forEach(pb => {
    const sk = document.createElement('div')
    sk.className = 'decode-skeleton'
    for (let i = 0; i < 4; i++) {
      const line = document.createElement('div')
      line.className = 'shimmer-line'
      line.style.width = (40 + Math.random() * 50) + '%'
      sk.appendChild(line)
    }
    pb.prepend(sk)
    setTimeout(() => sk.remove(), 600)
  })

  /* Scramble & decode all text elements */
  const elements = container.querySelectorAll(
    'h1,h2,h3,p,span,.tagline,.bio,.exp-date,.exp-tag,.edu-card,.contact-value,.cloud-tag,.status-item .value,.panel-header,.node-label'
  )
  elements.forEach(el => {
    if (el.querySelector('canvas') || el.querySelector('svg')) return
    const original = el.textContent
    if (!original.trim()) return
    el.dataset.original = original

    /* Scramble */
    let text = ''
    for (let i = 0; i < original.length; i++) {
      text += original[i] === ' '
        ? ' '
        : decodeChars[Math.floor(Math.random() * decodeChars.length)]
    }
    el.textContent = text

    /* Decode progressively */
    let decoded = 0
    const step = Math.max(1, Math.floor(original.length / 12))
    const iv = setInterval(() => {
      decoded += step
      let result = ''
      for (let i = 0; i < original.length; i++) {
        if (i < decoded || original[i] === ' ') {
          result += original[i]
        } else {
          result += decodeChars[Math.floor(Math.random() * decodeChars.length)]
        }
      }
      el.textContent = result
      if (decoded >= original.length) {
        el.textContent = original
        clearInterval(iv)
      }
    }, 40)
  })
}

/* ============================================================
   NAV INDICATOR — Sliding cyan bar
   ============================================================ */
const navIndicator = document.getElementById('navIndicator')

window.moveIndicator = function (tab) {
  if (!tab || !navIndicator) return
  const bar  = tab.parentElement.getBoundingClientRect()
  const rect = tab.getBoundingClientRect()
  navIndicator.style.left  = (rect.left - bar.left) + 'px'
  navIndicator.style.width = rect.width + 'px'
}

/* Init indicator on first active tab */
requestAnimationFrame(() => {
  const active = document.querySelector('.nav-tab.active')
  if (active) moveIndicator(active)
})

/* ============================================================
   SECTION SWITCHING — With transition flash
   ============================================================ */
const pageTransition = document.getElementById('pageTransition')
let transitioning = false

window.switchSection = function (sectionName) {
  if (transitioning) return
  transitioning = true

  /* Flash + sound */
  pageTransition.classList.remove('flash')
  void pageTransition.offsetWidth
  pageTransition.classList.add('flash')
  playLogBeep('')

  /* Hide current section */
  document.querySelectorAll('.panel-section').forEach(s => s.classList.remove('active'))

  setTimeout(() => {
    /* Update nav tabs */
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.remove('active')
      if (t.dataset.section === sectionName) {
        t.classList.add('active')
        moveIndicator(t)
      }
    })

    /* Show new section */
    const sec = document.getElementById('sec-' + sectionName)
    if (sec) {
      sec.classList.add('active')

      /* Shuffle Neural Map nodes */
      if (sectionName === 'interests') {
        const g = sec.querySelector('.neural-grid')
        if (g) {
          const nodes = [...g.children]
          for (let i = nodes.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            g.appendChild(nodes[j])
            nodes[j] = nodes[i]
          }
        }
      }

      decodeReveal(sec)
    }

    if (sectionName === 'skills') animateSkillBars()
    document.title = '▀█▀ █▀▄▀█ ' + sectionName.toUpperCase()
    transitioning = false
  }, 150)
}

/* Bind nav tab clicks */
document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => switchSection(tab.dataset.section))
})

/* Print button */
document.getElementById('printBtn').addEventListener('click', () => {
  initRadar()
  setTimeout(() => window.print(), 300)
})
