/* ============================================================
   CUSTOM CURSOR — Dot + Ring with smooth follow
   T.M CORP — Cyberpunk CV
   ============================================================ */

const cursorDot  = document.getElementById('cursorDot')
const cursorRing = document.getElementById('cursorRing')
let cursorMouseX = 0, cursorMouseY = 0, ringX = 0, ringY = 0

document.addEventListener('mousemove', e => {
  cursorMouseX = e.clientX
  cursorMouseY = e.clientY
  cursorDot.style.left = cursorMouseX + 'px'
  cursorDot.style.top  = cursorMouseY + 'px'
})

;(function animRing () {
  ringX += (cursorMouseX - ringX) * 0.15
  ringY += (cursorMouseY - ringY) * 0.15
  cursorRing.style.left = ringX + 'px'
  cursorRing.style.top  = ringY + 'px'
  requestAnimationFrame(animRing)
})()
