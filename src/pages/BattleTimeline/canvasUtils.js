// Pre-rendered SVG-based entity icons for canvas
// Rendered once to offscreen canvas, cached as Image, then drawImage() at runtime

// Polyfill for roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r }
    this.moveTo(x + r.tl, y)
    this.lineTo(x + w - r.tr, y)
    this.quadraticCurveTo(x + w, y, x + w, y + r.tr)
    this.lineTo(x + w, y + h - r.br)
    this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h)
    this.lineTo(x + r.bl, y + h)
    this.quadraticCurveTo(x, y + h, x, y + h - r.bl)
    this.lineTo(x, y + r.tl)
    this.quadraticCurveTo(x, y, x + r.tl, y)
  }
}

const ICON_SIZE = 64
const iconCache = {}

function createOffscreenCanvas(size) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  return c
}

function buildIcon(type, cacheKey) {
  const c = createOffscreenCanvas(ICON_SIZE)
  const ctx = c.getContext('2d')

  switch (type) {
    case 'infantry': drawInfantryIcon(ctx); break
    case 'cavalry': drawCavalryIcon(ctx); break
    case 'artillery': drawArtilleryIcon(ctx); break
    case 'commander': drawCommanderIcon(ctx); break
    case 'base': drawBaseIcon(ctx); break
    case 'tank': drawTankIcon(ctx); break
    case 'flag': drawFlagIcon(ctx); break
    case 'defensive_line': drawWallIcon(ctx); break
  }

  const img = new Image()
  img.src = c.toDataURL()
  iconCache[cacheKey] = img
  return img
}

export function getEntityIcon(type) {
  if (iconCache[type]) return iconCache[type]
  return buildIcon(type, type)
}

// INFANTRY - soldier with helmet, rifle, marching pose
function drawInfantryIcon(ctx) {
  const s = ICON_SIZE
  const cx = s / 2, cy = s / 2
  const r = s * 0.38

  // Legs
  ctx.fillStyle = '#555'
  ctx.beginPath()
  ctx.roundRect(cx - r * 0.35, cy + r * 0.1, r * 0.25, r * 0.45, 3)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(cx + r * 0.08, cy + r * 0.1, r * 0.25, r * 0.45, 3)
  ctx.fill()

  // Boots
  ctx.fillStyle = '#333'
  ctx.fillRect(cx - r * 0.42, cy + r * 0.5, r * 0.38, r * 0.1)
  ctx.fillRect(cx + r * 0.04, cy + r * 0.5, r * 0.38, r * 0.1)

  // Torso
  ctx.fillStyle = '#666'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.4, cy - r * 0.1)
  ctx.lineTo(cx + r * 0.4, cy - r * 0.1)
  ctx.lineTo(cx + r * 0.32, cy + r * 0.15)
  ctx.lineTo(cx - r * 0.32, cy + r * 0.15)
  ctx.closePath()
  ctx.fill()

  // Backpack
  ctx.fillStyle = '#4a4a4a'
  ctx.fillRect(cx - r * 0.42, cy - r * 0.15, r * 0.15, r * 0.35)

  // Head + helmet
  ctx.fillStyle = '#555'
  ctx.beginPath()
  ctx.ellipse(cx, cy - r * 0.35, r * 0.28, r * 0.24, 0, 0, Math.PI * 2)
  ctx.fill()
  // Helmet dome
  ctx.fillStyle = '#3a3a3a'
  ctx.beginPath()
  ctx.ellipse(cx, cy - r * 0.42, r * 0.3, r * 0.16, 0, Math.PI, 0)
  ctx.fill()
  // Helmet brim
  ctx.fillRect(cx - r * 0.35, cy - r * 0.42, r * 0.7, r * 0.06)

  // Rifle
  ctx.strokeStyle = '#444'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.5, cy - r * 0.25)
  ctx.lineTo(cx + r * 0.65, cy + r * 0.1)
  ctx.stroke()
  // Bayonet
  ctx.fillStyle = '#777'
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.65, cy + r * 0.1)
  ctx.lineTo(cx + r * 0.72, cy + r * 0.15)
  ctx.lineTo(cx + r * 0.64, cy + r * 0.18)
  ctx.closePath()
  ctx.fill()
}

// CAVALRY - horse with mounted rider carrying lance
function drawCavalryIcon(ctx) {
  const s = ICON_SIZE
  const cx = s / 2, cy = s / 2
  const r = s * 0.38

  // Horse body
  ctx.fillStyle = '#5a4230'
  ctx.beginPath()
  ctx.ellipse(cx, cy + r * 0.2, r * 0.5, r * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()

  // Horse neck and head
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.35, cy + r * 0.1)
  ctx.quadraticCurveTo(cx + r * 0.55, cy - r * 0.15, cx + r * 0.5, cy - r * 0.3)
  ctx.quadraticCurveTo(cx + r * 0.4, cy - r * 0.15, cx + r * 0.3, cy + r * 0.05)
  ctx.fillStyle = '#5a4230'
  ctx.fill()
  // Horse snout
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.48, cy - r * 0.28, r * 0.1, r * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()
  // Horse ear
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.46, cy - r * 0.38)
  ctx.lineTo(cx + r * 0.5, cy - r * 0.48)
  ctx.lineTo(cx + r * 0.55, cy - r * 0.36)
  ctx.fill()

  // Horse legs
  ctx.strokeStyle = '#4a3225'
  ctx.lineWidth = 3.5
  ctx.lineCap = 'round'
  ;[cx - r * 0.3, cx - r * 0.05, cx + r * 0.1, cx + r * 0.3].forEach(lx => {
    ctx.beginPath()
    ctx.moveTo(lx, cy + r * 0.3)
    ctx.lineTo(lx - r * 0.05, cy + r * 0.55)
    ctx.stroke()
  })
  // Hooves
  ctx.fillStyle = '#2a1a10'
  ;[cx - r * 0.35, cx - r * 0.1, cx + r * 0.05, cx + r * 0.25].forEach(lx => {
    ctx.fillRect(lx - r * 0.1, cy + r * 0.52, r * 0.15, r * 0.07)
  })

  // Horse tail
  ctx.strokeStyle = '#4a3225'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.45, cy + r * 0.15)
  ctx.quadraticCurveTo(cx - r * 0.6, cy + r * 0.3, cx - r * 0.5, cy + r * 0.5)
  ctx.stroke()

  // Rider body
  ctx.fillStyle = '#777'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.15, cy - r * 0.1)
  ctx.lineTo(cx + r * 0.2, cy - r * 0.1)
  ctx.lineTo(cx + r * 0.15, cy + r * 0.15)
  ctx.lineTo(cx - r * 0.1, cy + r * 0.15)
  ctx.closePath()
  ctx.fill()

  // Rider head + helmet
  ctx.fillStyle = '#666'
  ctx.beginPath()
  ctx.arc(cx, cy - r * 0.3, r * 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#3a3a3a'
  ctx.beginPath()
  ctx.ellipse(cx, cy - r * 0.38, r * 0.22, r * 0.12, 0, Math.PI, 0)
  ctx.fill()

  // Lance
  ctx.strokeStyle = '#8a7a6a'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.1, cy - r * 0.15)
  ctx.lineTo(cx + r * 0.7, cy - r * 0.55)
  ctx.stroke()
  // Lance tip
  ctx.fillStyle = '#ccc'
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.7, cy - r * 0.55)
  ctx.lineTo(cx + r * 0.75, cy - r * 0.58)
  ctx.lineTo(cx + r * 0.68, cy - r * 0.6)
  ctx.closePath()
  ctx.fill()

  // Shield
  ctx.fillStyle = '#888'
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.25, cy, r * 0.12, r * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()
}

// ARTILLERY - detailed cannon with wheels, barrel, and muzzle
function drawArtilleryIcon(ctx) {
  const s = ICON_SIZE
  const cx = s / 2, cy = s / 2
  const r = s * 0.38

  // Carriage base
  ctx.fillStyle = '#6b4a2a'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.45, cy + r * 0.15)
  ctx.lineTo(cx + r * 0.45, cy + r * 0.15)
  ctx.lineTo(cx + r * 0.3, cy - r * 0.05)
  ctx.lineTo(cx - r * 0.3, cy - r * 0.05)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#4a3020'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Tail fork
  ctx.fillStyle = '#5a3a20'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.45, cy + r * 0.15)
  ctx.lineTo(cx - r * 0.55, cy + r * 0.4)
  ctx.lineTo(cx - r * 0.35, cy + r * 0.4)
  ctx.lineTo(cx - r * 0.3, cy + r * 0.15)
  ctx.fill()

  // Left wheel
  drawArtilleryWheel(ctx, cx - r * 0.35, cy + r * 0.2, r * 0.22)

  // Carriage upper
  ctx.fillStyle = '#5a3a20'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.15, cy - r * 0.05)
  ctx.lineTo(cx + r * 0.15, cy - r * 0.05)
  ctx.lineTo(cx + r * 0.1, cy - r * 0.25)
  ctx.lineTo(cx - r * 0.1, cy - r * 0.25)
  ctx.closePath()
  ctx.fill()

  // Barrel
  ctx.strokeStyle = '#4a4a4a'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.05, cy - r * 0.15)
  ctx.lineTo(cx + r * 0.55, cy - r * 0.45)
  ctx.stroke()
  // Barrel rings
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ;[0.15, 0.28, 0.4].forEach(t => {
    const bx = cx + r * 0.05 + (r * 0.5) * t
    const by = cy - r * 0.15 - (r * 0.3) * t
    ctx.strokeRect(bx - 2.5, by - 4, 5, 8)
  })
  // Muzzle flare
  ctx.fillStyle = '#F2C66D'
  ctx.beginPath()
  ctx.arc(cx + r * 0.56, cy - r * 0.46, r * 0.08, 0, Math.PI * 2)
  ctx.fill()

  // Right wheel
  drawArtilleryWheel(ctx, cx + r * 0.35, cy + r * 0.2, r * 0.22)
}

function drawArtilleryWheel(ctx, wx, wy, wr) {
  // Outer rim
  ctx.strokeStyle = '#3a2a1a'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(wx, wy, wr, 0, Math.PI * 2)
  ctx.stroke()
  // Hub
  ctx.fillStyle = '#2a1a0a'
  ctx.beginPath()
  ctx.arc(wx, wy, wr * 0.25, 0, Math.PI * 2)
  ctx.fill()
  // Spokes
  ctx.strokeStyle = '#3a2a1a'
  ctx.lineWidth = 1.5
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 / 6) * i
    ctx.beginPath()
    ctx.moveTo(wx + Math.cos(a) * wr * 0.3, wy + Math.sin(a) * wr * 0.3)
    ctx.lineTo(wx + Math.cos(a) * wr * 0.85, wy + Math.sin(a) * wr * 0.85)
    ctx.stroke()
  }
}

// COMMANDER - officer with formal cap, medals, and command baton
function drawCommanderIcon(ctx) {
  const s = ICON_SIZE
  const cx = s / 2, cy = s / 2
  const r = s * 0.38

  // Legs
  ctx.fillStyle = '#3a3a4a'
  ctx.beginPath()
  ctx.roundRect(cx - r * 0.23, cy + r * 0.15, r * 0.2, r * 0.4, 2)
  ctx.fill()
  ctx.beginPath()
  ctx.roundRect(cx + r * 0.03, cy + r * 0.15, r * 0.2, r * 0.4, 2)
  ctx.fill()

  // Boots
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(cx - r * 0.3, cy + r * 0.5, r * 0.28, r * 0.08)
  ctx.fillRect(cx + r * 0.0, cy + r * 0.5, r * 0.28, r * 0.08)

  // Torso
  ctx.fillStyle = '#4a4a5a'
  ctx.beginPath()
  ctx.roundRect(cx - r * 0.35, cy - r * 0.15, r * 0.7, r * 0.35, 4)
  ctx.fill()

  // Belt
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(cx - r * 0.35, cy + r * 0.08, r * 0.7, r * 0.06)
  ctx.fillRect(cx + r * 0.15, cy + r * 0.06, r * 0.08, r * 0.08)

  // Medals
  ctx.fillStyle = '#F2C66D'
  ctx.beginPath()
  ctx.arc(cx - r * 0.1, cy - r * 0.05, r * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#C76A35'
  ctx.beginPath()
  ctx.arc(cx + r * 0.05, cy - r * 0.02, r * 0.05, 0, Math.PI * 2)
  ctx.fill()

  // Epaulettes
  ctx.fillStyle = '#F2C66D'
  ctx.fillRect(cx - r * 0.38, cy - r * 0.18, r * 0.15, r * 0.06)
  ctx.fillRect(cx + r * 0.23, cy - r * 0.18, r * 0.15, r * 0.06)

  // Head
  ctx.fillStyle = '#d4a574'
  ctx.beginPath()
  ctx.arc(cx, cy - r * 0.35, r * 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Officer cap (peaked)
  ctx.fillStyle = '#2a2a3a'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.32, cy - r * 0.38)
  ctx.quadraticCurveTo(cx, cy - r * 0.5, cx + r * 0.32, cy - r * 0.38)
  ctx.lineTo(cx + r * 0.28, cy - r * 0.32)
  ctx.quadraticCurveTo(cx, cy - r * 0.45, cx - r * 0.28, cy - r * 0.32)
  ctx.closePath()
  ctx.fill()
  // Cap visor
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.ellipse(cx + r * 0.12, cy - r * 0.35, r * 0.22, r * 0.05, 0, 0, Math.PI * 2)
  ctx.fill()
  // Cap badge
  ctx.fillStyle = '#F2C66D'
  ctx.beginPath()
  ctx.arc(cx + r * 0.02, cy - r * 0.4, r * 0.05, 0, Math.PI * 2)
  ctx.fill()

  // Command baton (right arm)
  ctx.strokeStyle = '#8a7a6a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.2, cy - r * 0.1)
  ctx.lineTo(cx + r * 0.6, cy - r * 0.35)
  ctx.stroke()
}

// BASE - fortification tower with crenellations and flag
function drawBaseIcon(ctx) {
  const s = ICON_SIZE
  const cx = s / 2, cy = s / 2
  const r = s * 0.38

  // Main tower body
  ctx.fillStyle = '#7a6a5a'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.4, cy + r * 0.4)
  ctx.lineTo(cx - r * 0.4, cy - r * 0.25)
  ctx.lineTo(cx, cy - r * 0.5)
  ctx.lineTo(cx + r * 0.4, cy - r * 0.25)
  ctx.lineTo(cx + r * 0.4, cy + r * 0.4)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#5a4a3a'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Stone lines
  ctx.strokeStyle = '#6a5a4a'
  ctx.lineWidth = 0.8
  for (let i = 0; i < 3; i++) {
    const ly = cy - r * 0.15 + r * 0.2 * i
    ctx.beginPath()
    ctx.moveTo(cx - r * 0.38, ly)
    ctx.lineTo(cx + r * 0.38, ly)
    ctx.stroke()
  }

  // Gate
  ctx.fillStyle = '#3a2a1a'
  ctx.beginPath()
  ctx.ellipse(cx, cy + r * 0.2, r * 0.18, r * 0.2, 0, Math.PI, 0)
  ctx.fill()
  // Gate bars
  ctx.strokeStyle = '#5a4a3a'
  ctx.lineWidth = 1.5
  ;[-1, 0, 1].forEach(i => {
    ctx.beginPath()
    ctx.moveTo(cx + i * r * 0.08, cy + r * 0.05)
    ctx.lineTo(cx + i * r * 0.08, cy + r * 0.35)
    ctx.stroke()
  })

  // Crenellations (battlements)
  ctx.fillStyle = '#7a6a5a'
  ctx.strokeStyle = '#5a4a3a'
  ctx.lineWidth = 1.2
  for (let i = 0; i < 4; i++) {
    const bx = cx - r * 0.36 + r * 0.24 * i
    const bw = r * 0.14
    ctx.beginPath()
    ctx.fillRect(bx, cy - r * 0.5, bw, -r * 0.12)
    ctx.strokeRect(bx, cy - r * 0.5, bw, -r * 0.12)
  }

  // Flag pole
  ctx.strokeStyle = '#8a7a6a'
  ctx.lineWidth = 1.8
  ctx.beginPath()
  ctx.moveTo(cx, cy - r * 0.5)
  ctx.lineTo(cx, cy - r * 0.68)
  ctx.stroke()

  // Flag
  ctx.fillStyle = '#C76A35'
  ctx.beginPath()
  ctx.moveTo(cx, cy - r * 0.68)
  ctx.lineTo(cx + r * 0.3, cy - r * 0.58)
  ctx.lineTo(cx, cy - r * 0.48)
  ctx.closePath()
  ctx.fill()
}

// TANK - armored vehicle in combat profile
function drawTankIcon(ctx) {
  const s = ICON_SIZE
  const cx = s / 2, cy = s / 2
  const r = s * 0.38

  // Track assembly
  ctx.fillStyle = '#2a2a2a'
  ctx.beginPath()
  ctx.roundRect(cx - r * 0.45, cy - r * 0.05, r * 0.9, r * 0.12, 4)
  ctx.fill()
  // Track details
  ctx.strokeStyle = '#444'
  ctx.lineWidth = 1
  for (let i = 0; i < 6; i++) {
    const tx = cx - r * 0.4 + (r * 0.8 / 5) * i
    ctx.beginPath()
    ctx.moveTo(tx, cy - r * 0.02)
    ctx.lineTo(tx, cy + r * 0.05)
    ctx.stroke()
  }

  // Road wheels
  ctx.fillStyle = '#1a1a1a'
  ;[cx - r * 0.35, cx - r * 0.15, cx + r * 0.05, cx + r * 0.25, cx + r * 0.4].forEach(wx => {
    ctx.beginPath()
    ctx.arc(wx, cy + r * 0.02, r * 0.07, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.stroke()
  })

  // Hull
  ctx.fillStyle = '#4a6a3a'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.42, cy - r * 0.05)
  ctx.lineTo(cx + r * 0.42, cy - r * 0.05)
  ctx.lineTo(cx + r * 0.38, cy - r * 0.25)
  ctx.lineTo(cx - r * 0.28, cy - r * 0.25)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#3a5a2a'
  ctx.lineWidth = 1.2
  ctx.stroke()

  // Hull armor details
  ctx.strokeStyle = '#3a5a2a'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.42, cy - r * 0.12)
  ctx.lineTo(cx + r * 0.42, cy - r * 0.12)
  ctx.stroke()

  // Turret
  ctx.fillStyle = '#3a5a2a'
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.05, cy - r * 0.3, r * 0.28, r * 0.14, 0, Math.PI, 0)
  ctx.fill()
  ctx.strokeStyle = '#2a4a1a'
  ctx.lineWidth = 1.2
  ctx.stroke()

  // Turret hatch
  ctx.fillStyle = '#2a4a1a'
  ctx.beginPath()
  ctx.ellipse(cx - r * 0.1, cy - r * 0.36, r * 0.08, r * 0.05, 0, 0, Math.PI * 2)
  ctx.fill()

  // Main gun barrel
  ctx.strokeStyle = '#3a3a3a'
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.15, cy - r * 0.32)
  ctx.lineTo(cx + r * 0.65, cy - r * 0.45)
  ctx.stroke()
  // Barrel highlight
  ctx.strokeStyle = '#4a4a4a'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx + r * 0.18, cy - r * 0.3)
  ctx.lineTo(cx + r * 0.62, cy - r * 0.43)
  ctx.stroke()

  // Muzzle brake
  ctx.fillStyle = '#333'
  ctx.fillRect(cx + r * 0.62, cy - r * 0.48, r * 0.08, r * 0.06)
}

// FLAG - victory banner on pole
function drawFlagIcon(ctx) {
  const s = ICON_SIZE
  const cx = s / 2, cy = s / 2
  const r = s * 0.38

  // Pole
  ctx.strokeStyle = '#a99d8a'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.1, cy + r * 0.5)
  ctx.lineTo(cx - r * 0.1, cy - r * 0.5)
  ctx.stroke()

  // Flag body
  ctx.fillStyle = '#C76A35'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.1, cy - r * 0.5)
  ctx.lineTo(cx + r * 0.45, cy - r * 0.35)
  ctx.lineTo(cx + r * 0.35, cy - r * 0.1)
  ctx.lineTo(cx - r * 0.1, cy - r * 0.2)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#a55a2a'
  ctx.lineWidth = 1
  ctx.stroke()

  // Flag wave line
  ctx.strokeStyle = '#d47a4a'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.08, cy - r * 0.45)
  ctx.quadraticCurveTo(cx + r * 0.1, cy - r * 0.5, cx + r * 0.3, cy - r * 0.4)
  ctx.stroke()

  // Pole finial
  ctx.fillStyle = '#F2C66D'
  ctx.beginPath()
  ctx.arc(cx - r * 0.1, cy - r * 0.52, r * 0.07, 0, Math.PI * 2)
  ctx.fill()
}

// WALL - defensive fortification line
function drawWallIcon(ctx) {
  const s = ICON_SIZE
  const cx = s / 2, cy = s / 2
  const r = s * 0.38

  // Base line
  ctx.strokeStyle = '#7a6a5a'
  ctx.lineWidth = 5
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - r * 0.55, cy + r * 0.2)
  ctx.lineTo(cx + r * 0.55, cy + r * 0.2)
  ctx.stroke()

  // Crenellations
  ctx.fillStyle = '#7a6a5a'
  for (let i = 0; i < 5; i++) {
    const bx = cx - r * 0.5 + r * 0.23 * i
    ctx.fillRect(bx, cy - r * 0.05, r * 0.12, r * 0.25)
  }

  // Shield marks
  ctx.fillStyle = '#5a4a3a'
  ;[cx - r * 0.3, cx, cx + r * 0.3].forEach(sx => {
    ctx.beginPath()
    ctx.ellipse(sx, cy - r * 0.1, r * 0.08, r * 0.1, 0, 0, Math.PI * 2)
    ctx.fill()
  })
}

// === TERRAIN DRAWING ===

export function drawTerrain(ctx, width, height, terrain, mapWidth, mapHeight) {
  const scaleX = width / mapWidth
  const scaleY = height / mapHeight

  // Sky strip (narrow info zone)
  const skyH = height * 0.12
  const skyGrad = ctx.createLinearGradient(0, 0, 0, skyH)
  skyGrad.addColorStop(0, '#1a1e2e')
  skyGrad.addColorStop(1, '#2a3a55')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, width, skyH)

  // Ground - lighter, map-like parchment feel
  const groundY = skyH
  const groundH = height - skyH
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, height)
  groundGrad.addColorStop(0, '#4a5a3a')
  groundGrad.addColorStop(0.3, '#3d4d2e')
  groundGrad.addColorStop(0.7, '#2d3d22')
  groundGrad.addColorStop(1, '#1e2e18')
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, groundY, width, groundH)

  // Visible grid with coordinate labels
  const gridSize = 60
  ctx.strokeStyle = 'rgba(216,162,74,0.08)'
  ctx.lineWidth = 0.5
  ctx.fillStyle = 'rgba(216,162,74,0.25)'
  ctx.font = '8px monospace'
  ctx.textAlign = 'center'

  let col = 0
  for (let x = gridSize; x < width; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x, height); ctx.stroke()
    // Column labels (A, B, C...)
    const label = String.fromCharCode(65 + col)
    ctx.fillText(label, x, groundY - 4)
    // Bottom row labels
    if (col % 2 === 0) ctx.fillText(label, x, height - 2)
    col++
  }

  let row = 0
  for (let y = groundY + gridSize; y < height; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
    // Row labels
    ctx.textAlign = 'right'
    ctx.fillText((row + 1).toString(), gridSize - 6, y + 3)
    ctx.textAlign = 'left'
    ctx.fillText((row + 1).toString(), width - gridSize + 6, y + 3)
    row++
  }

  // Compass rose (top-right)
  const crx = width - 44, cry = skyH + 38, crr = 18
  ctx.fillStyle = 'rgba(216,162,74,0.6)'
  ctx.font = 'bold 12px serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // N arrow
  ctx.fillStyle = '#C76A35'
  ctx.beginPath()
  ctx.moveTo(crx, cry - crr)
  ctx.lineTo(crx - 5, cry - 2)
  ctx.lineTo(crx + 5, cry - 2)
  ctx.closePath(); ctx.fill()
  ctx.fillStyle = 'rgba(216,162,74,0.5)'
  ctx.beginPath()
  ctx.moveTo(crx, cry + crr)
  ctx.lineTo(crx - 5, cry + 2)
  ctx.lineTo(crx + 5, cry + 2)
  ctx.closePath(); ctx.fill()
  ctx.strokeStyle = 'rgba(216,162,74,0.4)'
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(crx, cry - crr); ctx.lineTo(crx, cry + crr); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(crx - crr, cry); ctx.lineTo(crx + crr, cry); ctx.stroke()
  ctx.fillStyle = 'rgba(216,162,74,0.9)'
  ctx.font = 'bold 11px serif'
  ctx.fillText('N', crx, cry - crr - 8)

  // Scale bar (bottom-left)
  const sbx = 24, sby = height - 16, sbw = 80
  ctx.strokeStyle = 'rgba(216,162,74,0.5)'
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(sbx, sby); ctx.lineTo(sbx + sbw, sby); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(sbx, sby - 4); ctx.lineTo(sbx, sby + 4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(sbx + sbw / 2, sby - 4); ctx.lineTo(sbx + sbw / 2, sby + 4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(sbx + sbw, sby - 4); ctx.lineTo(sbx + sbw, sby + 4); ctx.stroke()
  ctx.fillStyle = 'rgba(216,162,74,0.6)'
  ctx.font = '8px monospace'
  ctx.textAlign = 'center'
  ctx.fillText('0', sbx, sby - 6)
  ctx.fillText(Math.round(mapWidth * (sbw / 2) / width) + 'm', sbx + sbw / 2, sby - 6)
  ctx.fillText(Math.round(mapWidth * sbw / width) + 'm', sbx + sbw, sby - 6)

  terrain.forEach((t) => drawTerrainFeature(ctx, t, scaleX, scaleY))
}

function drawTerrainFeature(ctx, terrain, scaleX, scaleY) {
  const x = terrain.x * scaleX
  const y = terrain.y * scaleY
  const w = (terrain.width || 100) * scaleX
  const h = (terrain.height || 60) * scaleY

  ctx.save()
  switch (terrain.type) {
    case 'hill': drawHill(ctx, x, y, w, h, terrain.label); break
    case 'river': drawRiver(ctx, x, y, w, h, terrain.label); break
    case 'forest': drawForest(ctx, x, y, w, h, terrain.label); break
    case 'fortification': drawFortification(ctx, x, y, w, h, terrain.label); break
    case 'town': drawTown(ctx, x, y, w, h, terrain.label); break
  }
  ctx.restore()
}

function drawHill(ctx, x, y, w, h, label) {
  const cx = x + w / 2, cy = y + h / 2
  // Base hill
  ctx.fillStyle = '#3d6b45'
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.quadraticCurveTo(x + w * 0.25, y + h * 0.2, cx, y)
  ctx.quadraticCurveTo(x + w * 0.75, y + h * 0.2, x + w, y + h)
  ctx.closePath()
  ctx.fill()
  // Highlight face (right-lit)
  ctx.fillStyle = '#4a7d52'
  ctx.beginPath()
  ctx.moveTo(cx, y)
  ctx.quadraticCurveTo(x + w * 0.75, y + h * 0.2, x + w, y + h)
  ctx.lineTo(cx, y + h * 0.4)
  ctx.closePath()
  ctx.fill()
  // Contour lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)'
  ctx.lineWidth = 1
  for (let q = 1; q <= 3; q++) {
    ctx.beginPath()
    ctx.moveTo(x + w * 0.1 * q, y + h * (1 - q * 0.25))
    ctx.quadraticCurveTo(cx, y + h * 0.15 * q, x + w - w * 0.1 * q, y + h * (1 - q * 0.25))
    ctx.stroke()
  }
  // Shadow base
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  ctx.beginPath()
  ctx.ellipse(cx, y + h * 0.85, w * 0.4, h * 0.08, 0, 0, Math.PI * 2)
  ctx.fill()
  if (label) {
    ctx.fillStyle = 'rgba(232,221,200,0.9)'
    ctx.font = 'bold 11px serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 2
    ctx.fillText(label, cx, cy + 4)
    ctx.shadowBlur = 0
  }
}

function drawRiver(ctx, x, y, w, h, label) {
  // River bank (wider, darker)
  ctx.strokeStyle = 'rgba(25,55,35,0.7)'
  ctx.lineWidth = Math.max(h * 2.5, 14)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x, y + h / 2)
  ctx.bezierCurveTo(x + w * 0.3, y + h * 0.1, x + w * 0.7, y + h * 0.9, x + w, y + h / 2)
  ctx.stroke()
  // River core (lighter blue-green)
  ctx.strokeStyle = 'rgba(60,130,110,0.55)'
  ctx.lineWidth = Math.max(h * 1.5, 8)
  ctx.beginPath()
  ctx.moveTo(x, y + h / 2)
  ctx.bezierCurveTo(x + w * 0.3, y + h * 0.1, x + w * 0.7, y + h * 0.9, x + w, y + h / 2)
  ctx.stroke()
  // Flow arrows
  ctx.fillStyle = 'rgba(180,220,200,0.5)'
  for (let i = 0; i < 3; i++) {
    const t = 0.15 + (0.3 * i)
    const arrowX = x + w * t
    const arrowY = y + h / 2 - (Math.sin(t * Math.PI * 2) * h * 0.2)
    ctx.beginPath()
    ctx.moveTo(arrowX + 6, arrowY)
    ctx.lineTo(arrowX - 3, arrowY - 3)
    ctx.lineTo(arrowX - 3, arrowY + 3)
    ctx.closePath()
    ctx.fill()
  }
  if (label) {
    ctx.fillStyle = 'rgba(200,220,210,0.7)'
    ctx.font = 'italic 10px serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, x + w / 2, y + h / 2 + h * 0.6)
  }
}

function drawForest(ctx, x, y, w, h, label) {
  // Dark base fill
  ctx.fillStyle = 'rgba(18,52,24,0.45)'
  ctx.fillRect(x, y + h * 0.2, w, h * 0.8)
  // Tree clusters with varied sizes and opacities
  const clusters = [
    { tx: x + w * 0.08, ty: y + h * 0.5, r: h * 0.22 },
    { tx: x + w * 0.25, ty: y + h * 0.35, r: h * 0.28 },
    { tx: x + w * 0.45, ty: y + h * 0.3, r: h * 0.3  },
    { tx: x + w * 0.62, ty: y + h * 0.38, r: h * 0.26 },
    { tx: x + w * 0.78, ty: y + h * 0.42, r: h * 0.24 },
    { tx: x + w * 0.9,  ty: y + h * 0.5,  r: h * 0.2  },
  ]
  clusters.forEach(c => {
    // Dark tree body
    ctx.fillStyle = 'rgba(18,52,24,0.6)'
    ctx.beginPath()
    ctx.arc(c.tx, c.ty, c.r, Math.PI, 0)
    ctx.fill()
    // Highlight
    ctx.fillStyle = 'rgba(30,70,36,0.4)'
    ctx.beginPath()
    ctx.arc(c.tx + 3, c.ty - 3, c.r * 0.8, Math.PI, 0)
    ctx.fill()
    // Trunk
    ctx.strokeStyle = 'rgba(10,25,10,0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(c.tx, c.ty + c.r * 0.6)
    ctx.lineTo(c.tx + 2, c.ty + c.r * 0.9)
    ctx.stroke()
  })
  if (label) {
    ctx.fillStyle = 'rgba(200,220,200,0.7)'
    ctx.font = 'italic 10px serif'
    ctx.textAlign = 'center'
    ctx.fillText(label, x + w / 2, y + h * 0.15)
  }
}

function drawFortification(ctx, x, y, w, h, label) {
  const cx = x + w / 2
  // Outer wall
  ctx.fillStyle = 'rgba(107,90,74,0.85)'
  ctx.strokeStyle = '#3a2a1a'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + h * 0.25)
  ctx.lineTo(x + w * 0.12, y + h * 0.05)
  ctx.lineTo(x + w * 0.25, y)
  ctx.lineTo(x + w * 0.75, y)
  ctx.lineTo(x + w * 0.88, y + h * 0.05)
  ctx.lineTo(x + w, y + h * 0.25)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Inner wall accent
  ctx.fillStyle = 'rgba(130,110,90,0.5)'
  ctx.beginPath()
  ctx.rect(x + w * 0.15, y + h * 0.15, w * 0.7, h * 0.7)
  ctx.fill()

  // Crenellations (more visible)
  ctx.fillStyle = 'rgba(107,90,74,0.85)'
  ctx.strokeStyle = '#3a2a1a'
  ctx.lineWidth = 1.5
  for (let i = 0; i < Math.floor(w / 18); i++) {
    const cwx = x + w * 0.12 + (w * 0.76 / Math.floor(w / 18)) * i
    const cww = Math.min(w * 0.06, 12)
    ctx.fillRect(cwx, y - h * 0.12, cww, h * 0.14)
    ctx.strokeRect(cwx, y - h * 0.12, cww, h * 0.14)
  }

  // Flag on top
  ctx.strokeStyle = '#8a7a6a'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx, y)
  ctx.lineTo(cx, y - h * 0.35)
  ctx.stroke()
  ctx.fillStyle = '#8F1D1D'
  ctx.beginPath()
  ctx.moveTo(cx, y - h * 0.35)
  ctx.lineTo(cx + w * 0.2, y - h * 0.25)
  ctx.lineTo(cx, y - h * 0.15)
  ctx.closePath()
  ctx.fill()

  if (label) {
    ctx.fillStyle = 'rgba(242,198,109,0.95)'
    ctx.font = 'bold 10px serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.7)'
    ctx.shadowBlur = 3
    ctx.fillText(label, cx, y + h + 14)
    ctx.shadowBlur = 0
  }
}

function drawTown(ctx, x, y, w, h, label) {
  // Ground patch
  ctx.fillStyle = 'rgba(138,110,90,0.25)'
  ctx.fillRect(x, y + h * 0.2, w, h * 0.8)
  // Buildings
  const buildings = [
    { bx: x + w * 0.05, by: y + h * 0.1, bw: w * 0.18, bh: h * 0.4 },
    { bx: x + w * 0.26, by: y + h * 0.25, bw: w * 0.14, bh: h * 0.3 },
    { bx: x + w * 0.44, by: y + h * 0.05, bw: w * 0.2, bh: h * 0.5 },
    { bx: x + w * 0.68, by: y + h * 0.2, bw: w * 0.16, bh: h * 0.35 },
    { bx: x + w * 0.86, by: y + h * 0.3, bw: w * 0.12, bh: h * 0.25 },
  ]
  buildings.forEach(b => {
    ctx.fillStyle = 'rgba(107,90,74,0.6)'
    ctx.fillRect(b.bx, b.by, b.bw, b.bh)
    ctx.strokeStyle = 'rgba(0,0,0,0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(b.bx, b.by, b.bw, b.bh)
    // Roof triangle
    ctx.fillStyle = 'rgba(130,50,30,0.5)'
    ctx.beginPath()
    ctx.moveTo(b.bx - 2, b.by)
    ctx.lineTo(b.bx + b.bw / 2, b.by - b.bh * 0.2)
    ctx.lineTo(b.bx + b.bw + 2, b.by)
    ctx.closePath()
    ctx.fill()
  })
  if (label) {
    ctx.fillStyle = 'rgba(232,221,200,0.8)'
    ctx.font = 'bold 10px serif'
    ctx.textAlign = 'center'
    ctx.shadowColor = 'rgba(0,0,0,0.6)'
    ctx.shadowBlur = 2
    ctx.fillText(label, x + w / 2, y + h + 12)
    ctx.shadowBlur = 0
  }
}

// === ENTITY RENDERING ===

// Cache of explosion debris patterns by seed
const debrisCache = {}

function getExplosionDebris(n, seed) {
  if (!debrisCache[seed]) {
    debrisCache[seed] = Array.from({ length: n }, (_, i) => {
      const a = (Math.PI * 2 / n) * i + Math.sin(i * 1.7 + seed) * 0.4
      const r = 16 + Math.sin(i * 2.3 + seed * 2) * 8
      return { angle: a, radius: r }
    })
  }
  return debrisCache[seed]
}

// Formation rows by entity type — number of dots per row (wedge/chevron)
const FORMATION_ROWS = {
  infantry: [3, 5, 7, 9, 11],
  cavalry: [2, 4, 6, 8],
  artillery: [2, 4],
  tank: [2, 4, 6],
  commander: null,
  base: null,
  flag: null,
  defensive_line: null,
}

export function drawEntity(ctx, entity, x, y, size, opacity = 1) {
  const icon = getEntityIcon(entity.type)
  const color = entity.factionColor || '#D8A24A'
  const rows = FORMATION_ROWS[entity.type]

  if (!icon || !icon.complete) {
    ctx.save()
    ctx.globalAlpha = opacity
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    return
  }

  ctx.save()
  ctx.globalAlpha = opacity

  if (!rows) {
    // Single entity — large centered icon with ring
    const s = Math.max(size * 2, 44)
    const hw = s / 2

    ctx.fillStyle = color + '55'
    ctx.beginPath(); ctx.arc(x, y, hw + 4, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = color; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(x, y, hw + 4, 0, Math.PI * 2); ctx.stroke()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(x, y, hw + 2, 0, Math.PI * 2); ctx.stroke()
    ctx.drawImage(icon, x - hw, y - hw, s, s)

    if (entity.label) {
      ctx.font = 'bold 11px serif'; ctx.textAlign = 'center'
      const mw = ctx.measureText(entity.label).width
      ctx.fillStyle = 'rgba(11,10,7,0.75)'
      ctx.fillRect(x - mw / 2 - 4, y + hw + 2, mw + 8, 15)
      ctx.fillStyle = '#F7EFE2'
      ctx.fillText(entity.label, x, y + hw + 13)
    }
  } else {
    // Group: main icon + wedge formation behind it
    const iconS = Math.max(size * 1.8, 40)
    const iconHw = iconS / 2
    const dotR = 3.5
    const dotGap = dotR * 2.5
    const totalDots = rows.reduce((a, b) => a + b, 0)

    // Draw wedge formation behind the main icon (downward-pointing chevron)
    for (let r = 0; r < rows.length; r++) {
      const count = rows[r]
      const rowY = y + iconHw + 8 + r * dotGap * 1.6
      const rowW = (count - 1) * dotGap
      for (let d = 0; d < count; d++) {
        const dx = x - rowW / 2 + d * dotGap
        const dy = rowY
        // Small filled dot with faction color
        ctx.fillStyle = color + '90'
        ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, Math.PI * 2); ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.arc(dx, dy, dotR, 0, Math.PI * 2); ctx.stroke()
      }
    }

    // Formation outline
    const firstRowCount = rows[0]
    const lastRowCount = rows[rows.length - 1]
    const firstRowW = (firstRowCount - 1) * dotGap
    const lastRowW = (lastRowCount - 1) * dotGap
    const topY = y + iconHw + 8
    const botY = topY + (rows.length - 1) * dotGap * 1.6

    ctx.strokeStyle = color + '30'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.moveTo(x - firstRowW / 2, topY)
    ctx.lineTo(x - lastRowW / 2, botY)
    ctx.lineTo(x + lastRowW / 2, botY)
    ctx.lineTo(x + firstRowW / 2, topY)
    ctx.closePath()
    ctx.stroke()
    ctx.setLineDash([])

    // Main icon on top (in front of the wedge)
    ctx.fillStyle = color + '65'
    ctx.beginPath(); ctx.arc(x, y, iconHw + 3, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = color; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(x, y, iconHw + 3, 0, Math.PI * 2); ctx.stroke()
    ctx.drawImage(icon, x - iconHw, y - iconHw, iconS, iconS)

    // Count badge
    const badgeX = x + lastRowW / 2 + dotR + 10
    const badgeY = botY
    ctx.fillStyle = 'rgba(11,10,7,0.85)'
    ctx.strokeStyle = color + '60'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.arc(badgeX, badgeY, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
    ctx.fillStyle = '#F7EFE2'
    ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(totalDots, badgeX, badgeY)

    // Label
    if (entity.label) {
      ctx.font = 'bold 10px serif'; ctx.textAlign = 'center'
      const mw = ctx.measureText(entity.label).width
      ctx.fillStyle = 'rgba(11,10,7,0.75)'
      ctx.fillRect(x - mw / 2 - 4, y - iconHw - 18, mw + 8, 15)
      ctx.fillStyle = '#F7EFE2'
      ctx.fillText(entity.label, x, y - iconHw - 8)
    }
  }

  ctx.restore()
}

// === EFFECTS ===

export function drawEffect(ctx, effect, scaleX, scaleY) {
  const x = effect.x * scaleX
  const y = effect.y * scaleY

  ctx.save()
  switch (effect.type) {
    case 'explosion': drawExplosion(ctx, x, y, effect.seed || 1); break
    case 'smoke': drawSmoke(ctx, x, y); break
    case 'victory_burst': drawVictoryBurst(ctx, x, y); break
    case 'flag_change': drawFlag(ctx, x, y, '#C76A35'); break
  }
  ctx.restore()
}

function drawExplosion(ctx, x, y, seed = 1) {
  const grad = ctx.createRadialGradient(x, y, 3, x, y, 38)
  grad.addColorStop(0, '#F7EFE2')
  grad.addColorStop(0.15, '#F2C66D')
  grad.addColorStop(0.4, '#C76A35')
  grad.addColorStop(0.7, '#8F1D1D')
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, 38, 0, Math.PI * 2)
  ctx.fill()

  // Core
  ctx.fillStyle = '#F7EFE2'
  ctx.beginPath()
  ctx.arc(x, y, 6, 0, Math.PI * 2)
  ctx.fill()

  // Deterministic debris
  const debris = getExplosionDebris(8, seed)
  ctx.strokeStyle = '#C76A35'
  ctx.lineWidth = 1.5
  debris.forEach(d => {
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(d.angle) * d.radius, y + Math.sin(d.angle) * d.radius)
    ctx.stroke()
  })
}

function drawSmoke(ctx, x, y) {
  ctx.fillStyle = 'rgba(169,157,138,0.4)'
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.arc(x + i * 14, y - i * 7, 12 + i * 5, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawVictoryBurst(ctx, x, y) {
  ctx.strokeStyle = '#F2C66D'
  ctx.lineWidth = 2
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 / 10) * i
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(a) * 45, y + Math.sin(a) * 45)
    ctx.stroke()
  }
  drawStar(ctx, x, y, 18, '#F2C66D')
}

function drawStar(ctx, cx, cy, r, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const oa = (Math.PI * 2 / 5) * i - Math.PI / 2
    const ia = oa + Math.PI / 5
    if (i === 0) ctx.moveTo(cx + Math.cos(oa) * r, cy + Math.sin(oa) * r)
    else ctx.lineTo(cx + Math.cos(oa) * r, cy + Math.sin(oa) * r)
    ctx.lineTo(cx + Math.cos(ia) * r * 0.4, cy + Math.sin(ia) * r * 0.4)
  }
  ctx.closePath()
  ctx.fill()
}

function drawFlag(ctx, x, y, color) {
  ctx.strokeStyle = '#A99D8A'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y - 32)
  ctx.stroke()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - 32)
  ctx.lineTo(x + 22, y - 23)
  ctx.lineTo(x, y - 15)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#F2C66D'
  ctx.beginPath()
  ctx.arc(x, y - 34, 4, 0, Math.PI * 2)
  ctx.fill()
}

// === ACTION ARROWS ===

export function drawAction(ctx, action, scaleX, scaleY) {
  const fx = action.from.x * scaleX
  const fy = action.from.y * scaleY
  const tx = action.to.x * scaleX
  const ty = action.to.y * scaleY
  ctx.save()

  switch (action.type) {
    case 'move': drawArrow(ctx, fx, fy, tx, ty, '#D8A24A', true); break
    case 'attack': drawAttackArrow(ctx, fx, fy, tx, ty); break
    case 'bombard': drawArcArrow(ctx, fx, fy, tx, ty, '#C76A35'); break
    case 'retreat': drawArrow(ctx, fx, fy, tx, ty, '#A99D8A', true); break
    case 'capture': drawArrow(ctx, fx, fy, tx, ty, '#F2C66D', false); break
    case 'surround': drawSurround(ctx, tx, ty, 55, '#D8A24A'); break
    case 'victory': drawVictoryBurst(ctx, tx, ty); break
  }

  if (action.label) {
    const mx = (fx + tx) / 2, my = (fy + ty) / 2 - 12
    ctx.font = 'italic 10px serif'
    ctx.textAlign = 'center'
    const mw = ctx.measureText(action.label).width
    ctx.fillStyle = 'rgba(11,10,7,0.7)'
    ctx.fillRect(mx - mw / 2 - 4, my - 8, mw + 8, 16)
    ctx.fillStyle = '#F7EFE2'
    ctx.fillText(action.label, mx, my + 4)
  }

  ctx.restore()
}

function drawArrow(ctx, fx, fy, tx, ty, color, dashed) {
  const dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / len, uy = dy / len
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  if (dashed) ctx.setLineDash([8, 4])
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(tx, ty)
  ctx.lineTo(tx - ux * 11 + uy * 5, ty - uy * 11 - ux * 5)
  ctx.lineTo(tx - ux * 11 - uy * 5, ty - uy * 11 + ux * 5)
  ctx.closePath(); ctx.fill()
}

function drawAttackArrow(ctx, fx, fy, tx, ty) {
  const dx = tx - fx, dy = ty - fy, len = Math.sqrt(dx * dx + dy * dy)
  const ux = dx / len, uy = dy / len
  // Red shaft
  ctx.strokeStyle = '#8F1D1D'
  ctx.lineWidth = 3
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(tx, ty); ctx.stroke()
  // Impact burst
  ctx.fillStyle = '#8F1D1D'
  ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill()
  // Arrowhead
  ctx.fillStyle = '#8F1D1D'
  ctx.beginPath()
  ctx.moveTo(tx, ty)
  ctx.lineTo(tx - ux * 14 + uy * 6, ty - uy * 14 - ux * 6)
  ctx.lineTo(tx - ux * 14 - uy * 6, ty - uy * 14 + ux * 6)
  ctx.closePath(); ctx.fill()
}

function drawArcArrow(ctx, fx, fy, tx, ty, color) {
  const dx = tx - fx, dy = ty - fy
  const dist = Math.sqrt(dx * dx + dy * dy)
  // Control point: arc upward relative to the line direction
  const mx = (fx + tx) / 2
  const my = (fy + ty) / 2
  // Push control point perpendicular to the direction
  const perpX = -dy / dist * dist * 0.35
  const perpY = dx / dist * dist * 0.35
  // Also push upward slightly
  const cpx = mx + perpX
  const cpy = Math.min(my + perpY, Math.min(fy, ty) - dist * 0.3)

  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.setLineDash([7, 4])
  ctx.beginPath()
  ctx.moveTo(fx, fy)
  ctx.quadraticCurveTo(cpx, cpy, tx, ty)
  ctx.stroke()
  ctx.setLineDash([])
  // Impact burst
  ctx.fillStyle = color
  ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill()
}

function drawSurround(ctx, cx, cy, r, color) {
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  ctx.setLineDash([8, 5])
  for (let i = 0; i < 4; i++) {
    const sa = (Math.PI * 2 / 4) * i - Math.PI / 4
    const ea = sa + Math.PI / 3
    ctx.beginPath(); ctx.arc(cx, cy, r, sa, ea); ctx.stroke()
    const ax = cx + Math.cos(ea) * r, ay = cy + Math.sin(ea) * r
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax - 7, ay - 7); ctx.lineTo(ax - 7, ay + 7)
    ctx.fillStyle = color; ctx.fill()
  }
  ctx.setLineDash([])
}
