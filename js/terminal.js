/* ============================================================
   TERMINAL — Filesystem, Commands, Drag, Resize
   T.M CORP — Cyberpunk CV
   ============================================================ */

const terminal   = document.getElementById('terminal')
const termOutput = document.getElementById('termOutput')
const termInput  = document.getElementById('termInput')
const termNavBtn = document.getElementById('termNavBtn')
const termClose  = document.getElementById('termClose')
const termHeader = document.getElementById('termToggle')

/* ============================================================
   SHOW / HIDE
   ============================================================ */
window.showTerminal = function () {
  terminal.classList.remove('hidden')
  termNavBtn.classList.add('active')
  termInput.focus()
}

window.hideTerminal = function () {
  terminal.classList.add('hidden')
  termNavBtn.classList.remove('active')
}

termClose.addEventListener('click', e => { e.stopPropagation(); hideTerminal() })
termNavBtn.addEventListener('click', () => {
  if (terminal.classList.contains('hidden')) showTerminal()
  else hideTerminal()
})

/* Ctrl+` to toggle */
document.addEventListener('keydown', e => {
  if (e.key === '`' && e.ctrlKey) {
    e.preventDefault()
    if (terminal.classList.contains('hidden')) showTerminal()
    else hideTerminal()
  }
})

/* ============================================================
   DRAG
   ============================================================ */
;(function () {
  let isDragging = false, offsetX = 0, offsetY = 0

  termHeader.addEventListener('mousedown', e => {
    if (e.target === termClose || termClose.contains(e.target)) return
    isDragging = true
    const rect = terminal.getBoundingClientRect()
    offsetX = e.clientX - rect.left
    offsetY = e.clientY - rect.top
    terminal.style.transition = 'none'
  })

  document.addEventListener('mousemove', e => {
    if (!isDragging) return
    let x = e.clientX - offsetX
    let y = e.clientY - offsetY
    x = Math.max(0, Math.min(x, innerWidth - terminal.offsetWidth))
    y = Math.max(0, Math.min(y, innerHeight - terminal.offsetHeight))
    terminal.style.left   = x + 'px'
    terminal.style.top    = y + 'px'
    terminal.style.right  = 'auto'
    terminal.style.bottom = 'auto'
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
    terminal.style.transition = ''
  })
})()

/* ============================================================
   RESIZE
   ============================================================ */
;(function () {
  const handles = terminal.querySelectorAll('.term-resize')
  let resizing = false, startX, startY, startW, startH, startLeft, startTop, handle

  handles.forEach(h => {
    h.addEventListener('mousedown', e => {
      e.preventDefault()
      e.stopPropagation()
      resizing = true
      handle   = h
      const rect = terminal.getBoundingClientRect()
      startX    = e.clientX
      startY    = e.clientY
      startW    = rect.width
      startH    = rect.height
      startLeft = rect.left
      startTop  = rect.top
      terminal.style.transition = 'none'
    })
  })

  document.addEventListener('mousemove', e => {
    if (!resizing) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (handle.classList.contains('term-resize-left')) {
      const newW = Math.max(280, startW - dx)
      terminal.style.width  = newW + 'px'
      terminal.style.left   = (startLeft + startW - newW) + 'px'
      terminal.style.right  = 'auto'
      terminal.style.bottom = 'auto'
      terminal.style.top    = startTop + 'px'
    }
    if (handle.classList.contains('term-resize-top')) {
      const newH = Math.max(200, startH - dy)
      terminal.style.height = newH + 'px'
      terminal.style.top    = (startTop + startH - newH) + 'px'
      terminal.style.bottom = 'auto'
      terminal.style.right  = 'auto'
      terminal.style.left   = startLeft + 'px'
      const headerH = terminal.querySelector('.term-header').offsetHeight
      const inputH  = terminal.querySelector('.term-input-wrap').offsetHeight
      termOutput.style.height = (newH - headerH - inputH) + 'px'
    }
    if (handle.classList.contains('term-resize-topleft')) {
      const newW = Math.max(280, startW - dx)
      const newH = Math.max(200, startH - dy)
      terminal.style.width  = newW + 'px'
      terminal.style.height = newH + 'px'
      terminal.style.left   = (startLeft + startW - newW) + 'px'
      terminal.style.top    = (startTop + startH - newH) + 'px'
      terminal.style.right  = 'auto'
      terminal.style.bottom = 'auto'
      const headerH = terminal.querySelector('.term-header').offsetHeight
      const inputH  = terminal.querySelector('.term-input-wrap').offsetHeight
      termOutput.style.height = (newH - headerH - inputH) + 'px'
    }
    if (handle.classList.contains('term-resize-topright')) {
      const newW = Math.max(280, startW + dx)
      const newH = Math.max(200, startH - dy)
      terminal.style.width  = newW + 'px'
      terminal.style.height = newH + 'px'
      terminal.style.top    = (startTop + startH - newH) + 'px'
      terminal.style.bottom = 'auto'
      terminal.style.right  = 'auto'
      terminal.style.left   = startLeft + 'px'
      const headerH = terminal.querySelector('.term-header').offsetHeight
      const inputH  = terminal.querySelector('.term-input-wrap').offsetHeight
      termOutput.style.height = (newH - headerH - inputH) + 'px'
    }
  })

  document.addEventListener('mouseup', () => {
    if (resizing) {
      resizing = false
      terminal.style.transition = ''
    }
  })
})()

/* ============================================================
   TERMINAL LOG
   ============================================================ */
window.termLog = function (text, cls = '') {
  const line = document.createElement('div')
  line.className = 'line' + (cls ? ' ' + cls : '')

  /* Capitalize first letter after any [TAG] prefix */
  if (text) {
    const m = text.match(/^(\s*(?:\[.*?\]\s*)*)(.)(.*)?$/)
    if (m && m[2]) text = m[1] + m[2].toUpperCase() + (m[3] || '')
  }

  line.textContent = text
  termOutput.appendChild(line)
  termOutput.scrollTop = termOutput.scrollHeight
  playLogBeep(cls)
}

/* ============================================================
   VIRTUAL FILESYSTEM
   ============================================================ */
let cwd = '/'
const cmdHistory = []
let histIdx = -1

const fs = {
  '/': {
    type: 'dir',
    children: ['about.txt', 'skills.dat', 'experience.log', 'projects', 'contact.cfg', 'secret.enc']
  },
  '/about.txt': {
    type: 'file',
    content: [
      'NAME     : Thomas Monicault',
      'ROLE     : Web Integrator // Developer Front-End // AI Explorer',
      'FOCUS    : Clean code, AI tools, creative problem solving',
      'STATUS   : Freelance — Available',
      'LOCATION : France / Cyberspace',
    ]
  },
  '/skills.dat': {
    type: 'file',
    content: [
      '[CORE TECHNOLOGIES]',
      'HTML5 ............. 95%',
      'CSS3 .............. 92%',
      'JavaScript ........ 82%',
      'WordPress ......... 85%',
      'Git ............... 75%',
      '',
      '[EXTENDED SYSTEMS]',
      'Prompt Engineering  80%',
      'AI Tools .......... 85%',
      'Responsive ........ 90%',
      'Automation ........ 70%',
      'Adobe Suite ....... 65%',
    ]
  },
  '/experience.log': {
    type: 'file',
    content: [
      '[2025-ONGOING] Personal R&D Lab',
      '  > AI agents, automation (OpenClaw), experiments',
      '',
      '[2018-PRESENT] Freelance Web Integrator / Developer Front-End',
      '  > Responsive websites, landing pages, web apps',
      '',
      '[2017] Web Integrator — YES N YOU Digital',
      '  > E-learning modules (Adapt), front-end dev',
      '',
      '[2016-2017] Web Developer — 3V Finance',
      '  > Treasury app web version (React.js)',
      '',
      '[2014-2015] Integrator / Developer — VOLATIL',
      '  > WordPress dev, web integration',
      '',
      '[2014] Intern — IMEX MEDIA',
      '  > Company website & logo creation',
    ]
  },
  '/projects': {
    type: 'dir',
    children: ['scifi-cv.md', 'alfred.md', 'brainrot.md', 'commissions.md', 'lovecraftian-fps.md', 'music-video.md', 'crypto-web.md', 'ai-art.md']
  },
  '/projects/scifi-cv.md': {
    type: 'file',
    content: [
      '# Sci-Fi CV Interface        [LIVE]',
      '',
      'Immersive cyberpunk CV — boot sequence,',
      'terminal, sound design, Easter eggs.',
      'Stack: HTML / CSS / JS / Web Audio / Canvas',
    ]
  },
  '/projects/alfred.md': {
    type: 'file',
    content: [
      '# Alfred — AI Agent Gateway  [WIP]',
      '',
      'Multi-channel AI gateway (Discord, WhatsApp)',
      'with autonomous agents, cron & skill systems.',
      'Stack: Node.js / OpenClaw / AI Agents',
    ]
  },
  '/projects/brainrot.md': {
    type: 'file',
    content: [
      '# Brainrot Factory           [WIP]',
      '',
      'Automated short video generation pipeline.',
      'AI concept, script & video rendering.',
      'Stack: Python / Veo API / AI / Automation',
    ]
  },
  '/projects/commissions.md': {
    type: 'file',
    content: [
      '# Various Website Commissions [LIVE]',
      '',
      'Wide range of websites on WordPress.',
      'Design, integration and development',
      'for craftsmen, artists and merchants.',
      'Stack: HTML / CSS / JS / WordPress / E-Commerce',
    ]
  },
  '/projects/lovecraftian-fps.md': {
    type: 'file',
    content: [
      '# Lovecraftian FPS — UE5     [CONCEPT]',
      '',
      'First-person horror game blending cosmic',
      'dread and dark fascination. Learning UE5.',
      'Stack: UE5 / Blueprints / 3D Modelling',
    ]
  },
  '/projects/music-video.md': {
    type: 'file',
    content: [
      '# Music Video Production     [CONCEPT]',
      '',
      'Video editing and clip production for',
      'self-produced music tracks.',
      'Stack: Adobe Premiere / FL Studio',
    ]
  },
  '/projects/crypto-web.md': {
    type: 'file',
    content: [
      '# Crypto Custom Websites     [OLD]',
      '',
      'Bespoke sites in pure HTML/CSS for',
      'cryptocurrency projects with Web3.',
      'Stack: HTML / CSS / Web3 / Blockchain',
    ]
  },
  '/projects/ai-art.md': {
    type: 'file',
    content: [
      '# AI Art Direction & Gallery [CONCEPT]',
      '',
      'Full artistic accompaniment — from',
      'conceptualisation to visual production.',
      'Stack: Midjourney / Adobe Photoshop',
    ]
  },
  '/contact.cfg': {
    type: 'file',
    content: [
      'EMAIL     = thomas.monicault@gmail.com',
      'LINKEDIN  = linkedin.com/in/thomas-monicault-1aa74964',
      'GITHUB    = github.com/tm-developer',
      'LOCATION  = France / Cyberspace',
    ]
  },
  '/secret.enc': {
    type: 'file',
    content: [
      '[ENCRYPTED FILE — ACCESS LEVEL: OPERATOR]',
      '',
      '  ▄██▄',
      ' ▀▀██▀▀',
      ' ▄▀▄▄▀▄',
      '',
      '"They came from space, and only you can stop them."',
      '...',
      'What are they?',
    ]
  },
}

function resolvePath (p) {
  if (p.startsWith('/')) return p
  let parts = (cwd + '/' + p).split('/').filter(Boolean)
  const resolved = []
  for (const part of parts) {
    if (part === '..') resolved.pop()
    else if (part !== '.') resolved.push(part)
  }
  return '/' + resolved.join('/')
}

/* ============================================================
   NEOFETCH
   ============================================================ */
function neofetch () {
  termLog('', 'info')
  termLog(' ████████╗███╗   ███╗', 'info')
  termLog(' ╚══██╔══╝████╗ ████║', 'info')
  termLog('    ██║   ██╔████╔██║', 'info')
  termLog('    ██║   ██║╚██╔╝██║', 'info')
  termLog('    ██║   ██║ ╚═╝ ██║', 'info')
  termLog('    ╚═╝   ╚═╝     ╚═╝', 'info')
  termLog('', 'info')
  termLog('  T.M  C O R P O R A T I O N', 'info')
  termLog('')
  termLog('  OS       T.M Corp v2.0', 'system')
  termLog('  Shell    Nexus Terminal', 'system')
  termLog('  Screen   ' + innerWidth + 'x' + innerHeight, 'system')
  termLog('  ' + document.getElementById('uptimeCounter').textContent, 'system')
  termLog('  Theme    Cyberpunk Cyan', 'system')
  termLog('  CPU      Neural Engine v4.2', 'system')
  termLog('  GPU      HoloRender Pipeline', 'system')
}

/* ============================================================
   NETWORK SCAN
   ============================================================ */
function runScan () {
  const targets = [
    '192.168.1.1    — [GATEWAY] .... ONLINE',
    '192.168.1.42   — [WORKSTATION] . ONLINE',
    '192.168.1.100  — [SERVER] ..... ONLINE',
    '10.0.0.1       — [FIREWALL] ... ACTIVE',
    '172.16.0.5     — [DATABASE] ... SECURED',
    '0.0.0.0        — [UNKNOWN] .... BLOCKED',
  ]
  termLog('[NET] Initiating network scan...', 'system')
  targets.forEach((t, i) => {
    setTimeout(() => {
      termLog('  ' + t, i === targets.length - 1 ? 'error' : 'success')
      if (i === targets.length - 1) termLog('[NET] Scan complete — 6 nodes found', 'success')
    }, (i + 1) * 400)
  })
}

/* ============================================================
   COMMAND HANDLER
   ============================================================ */
termInput.addEventListener('keydown', e => {
  if (e.key.length === 1 || e.key === 'Backspace') playKey()

  /* History navigation */
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (histIdx < cmdHistory.length - 1) {
      histIdx++
      termInput.value = cmdHistory[cmdHistory.length - 1 - histIdx]
    }
    return
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (histIdx > 0) {
      histIdx--
      termInput.value = cmdHistory[cmdHistory.length - 1 - histIdx]
    } else {
      histIdx = -1
      termInput.value = ''
    }
    return
  }

  if (e.key !== 'Enter') return
  const raw = termInput.value.trim()
  termInput.value = ''
  if (!raw) return
  const cmd = raw.toLowerCase()
  cmdHistory.push(raw)
  histIdx = -1

  termLog('❯ ' + raw)

  /* --- clear --- */
  if (cmd === 'clear') { termOutput.innerHTML = ''; return }

  /* --- help --- */
  if (cmd === 'help') {
    termLog('NAVIGATION  skills, experience, education, projects, interests, contact, overview', 'system')
    termLog('FILESYSTEM  ls, cd, cat, pwd', 'system')
    termLog('SYSTEM      status, whoami, neofetch, date, history, scan, print', 'system')
    termLog('FUN         secret, hack, sudo, ping, reboot', 'system')
    termLog('HIDDEN      ...find them yourself', 'info')
    return
  }

  /* --- Navigation --- */
  if (['skills', 'experience', 'education', 'projects', 'interests', 'contact', 'overview'].includes(cmd)) {
    switchSection(cmd)
    termLog('[NAV] Navigating to ' + cmd.toUpperCase() + '...', 'success')
    return
  }

  /* --- pwd --- */
  if (cmd === 'pwd') { termLog(cwd, 'system'); return }

  /* --- ls --- */
  if (cmd === 'ls' || cmd === 'ls .') {
    const node = fs[cwd === '/' ? '/' : cwd]
    if (node && node.type === 'dir') {
      node.children.forEach(c => {
        const full  = cwd === '/' ? '/' + c : cwd + '/' + c
        const isDir = fs[full] && fs[full].type === 'dir'
        termLog('  ' + (isDir ? c + '/' : c), isDir ? 'info' : '')
      })
    }
    return
  }

  /* --- cd --- */
  if (cmd.startsWith('cd ')) {
    const target = cmd.slice(3).trim()
    if (target === '/' || target === '~') { cwd = '/'; termLog(cwd, 'system'); return }
    const resolved = resolvePath(target)
    if (fs[resolved] && fs[resolved].type === 'dir') {
      cwd = resolved === '' ? '/' : resolved
      termLog(cwd, 'system')
    } else {
      termLog('[ERR] No such directory: ' + target, 'error')
    }
    return
  }

  /* --- cat --- */
  if (cmd.startsWith('cat ')) {
    const target   = cmd.slice(4).trim()
    const resolved = resolvePath(target)
    if (fs[resolved] && fs[resolved].type === 'file') {
      fs[resolved].content.forEach(l => termLog('  ' + l))
    } else {
      termLog('[ERR] No such file: ' + target, 'error')
    }
    return
  }

  /* --- random --- */
  if (cmd === 'random') {
    let count = 0
    const flood = setInterval(() => {
      let line = ''
      for (let i = 0; i < 40; i++) line += String.fromCharCode(33 + Math.floor(Math.random() * 94))
      termLog(line, ['info', 'error', 'success', 'system', ''][Math.floor(Math.random() * 5)])
      count++
      if (count >= 20) {
        clearInterval(flood)
        termLog('[SYS] ^C — stream interrupted', 'error')
      }
    }, 80)
    return
  }

  /* --- neofetch --- */
  if (cmd === 'neofetch') { neofetch(); return }

  /* --- date --- */
  if (cmd === 'date') { termLog(new Date().toString(), 'system'); return }

  /* --- history --- */
  if (cmd === 'history') {
    cmdHistory.slice(-10).forEach((c, i) => termLog('  ' + (i + 1) + ' ' + c, 'system'))
    return
  }

  /* --- scan --- */
  if (cmd === 'scan') { runScan(); return }

  /* --- print --- */
  if (cmd === 'print') {
    termLog('[SYS] Generating PDF...', 'success')
    initRadar()
    setTimeout(() => window.print(), 600)
    return
  }

  /* --- game / invaders --- */
  if (['invader', 'invaders', 'space invaders', 'game'].includes(cmd)) {
    termLog('', 'info')
    termLog('  ▄██▄', 'info')
    termLog(' ▀▀██▀▀', 'info')
    termLog(' ▄▀▄▄▀▄', 'info')
    termLog('', 'info')
    termLog('[GAME] SPACE INVADER LAUNCHED', 'info')
    launchInvader()
    return
  }

  /* --- whoami --- */
  if (cmd === 'whoami') {
    termLog('Thomas Monicault // Freelance Web Integrator // AI Explorer // Interface Architect', 'system')
    return
  }

  /* --- status --- */
  if (cmd === 'status') {
    termLog('[SYS] All systems nominal. Uptime: active. Threat level: LOW.', 'success')
    return
  }

  /* --- ping --- */
  if (cmd === 'ping') {
    termLog('[NET] PONG — latency: 0.42ms — neural link stable', 'success')
    return
  }

  /* --- secret --- */
  if (cmd === 'secret') {
    termLog('', 'info')
    termLog('  ▄██▄', 'info')
    termLog(' ▀▀██▀▀', 'info')
    termLog(' ▄▀▄▄▀▄', 'info')
    termLog('', 'info')
    termLog('[DECRYPT] ... Hidden protocol detected ...', 'info')
    termLog('"They came from space, and only you can stop them."', 'info')
    termLog('What are they?', 'info')
    return
  }

  /* --- hack --- */
  if (cmd === 'hack') { termLog('[SEC] Nice try, Operator. Access denied.', 'error'); return }

  /* --- sudo --- */
  if (cmd.startsWith('sudo')) {
    termLog('[SEC] You are not in the sudoers file. This incident will be reported.', 'error')
    return
  }

  /* --- rm -rf (crash easter egg) --- */
  if (cmd.startsWith('rm ')) {
    termLog('[SYS] FATAL ERROR: Deleting system files...', 'error')
    const crash = document.createElement('div')
    crash.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;'
    document.body.appendChild(crash)
    let step = 0
    const crashIv = setInterval(() => {
      step++
      if (step % 2 === 0) {
        crash.style.background     = 'rgba(255,0,0,0.1)'
        document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(${0.5 + Math.random()}) contrast(${1 + Math.random() * 2})`
        document.body.style.transform = `translate(${(Math.random() - 0.5) * 15}px,${(Math.random() - 0.5) * 10}px) skewX(${(Math.random() - 0.5) * 5}deg)`
      } else {
        crash.style.background     = 'rgba(0,0,0,0.3)'
        document.body.style.filter = `invert(${Math.random() > 0.5 ? 1 : 0}) brightness(${0.3 + Math.random() * 0.7})`
        document.body.style.transform = `translate(${(Math.random() - 0.5) * 10}px,${(Math.random() - 0.5) * 8}px)`
      }
      if (step >= 16) {
        clearInterval(crashIv)
        crash.remove()
        document.body.style.filter    = 'none'
        document.body.style.transform = 'none'
        termLog('[SYS] ...just kidding.', 'success')
      }
    }, 120)
    return
  }

  /* --- reboot --- */
  if (cmd === 'reboot') {
    termLog('[T.M CORP] Rebooting is not recommended during active session.', 'warn')
    return
  }

  /* --- corp / tm --- */
  if (cmd === 'corp' || cmd === 'tm') {
    termLog('', 'info')
    termLog(' ████████╗███╗   ███╗', 'info')
    termLog(' ╚══██╔══╝████╗ ████║', 'info')
    termLog('    ██║   ██╔████╔██║', 'info')
    termLog('    ██║   ██║╚██╔╝██║', 'info')
    termLog('    ██║   ██║ ╚═╝ ██║', 'info')
    termLog('    ╚═╝   ╚═╝     ╚═╝', 'info')
    termLog('', 'info')
    termLog('  T.M  C O R P O R A T I O N', 'info')
    termLog('', 'info')
    termLog('  [ SECURE SYSTEM // AUTHORIZED PERSONNEL ONLY ]', 'info')
    termLog('', 'info')
    return
  }

  /* --- matrix --- */
  if (cmd === 'matrix') { termLog('[VISUAL] Matrix density increased.', 'system'); return }

  /* --- unknown command --- */
  termLog('[ERR] Unknown command: ' + cmd + ' — type "help"', 'error')
})
