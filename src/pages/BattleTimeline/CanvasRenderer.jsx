import { useRef, useEffect, useCallback, useState } from 'react'
import { drawEntity, drawAction, getEntityIcon } from './canvasUtils'

const STATUS_OPACITY = {
  idle: 1, moving: 1, attacking: 1, defending: 1, retreating: 0.5, destroyed: 0.25
}

const STATUS_COLORS = {
  attacking: '#8F1D1D',
  defending: '#D8A24A',
  retreating: '#A99D8A',
  destroyed: '#8F1D1D',
  idle: '#6FAE8D',
  moving: '#6FAE8D'
}

const ICON_TYPES = ['infantry', 'cavalry', 'artillery', 'commander', 'base', 'tank', 'flag', 'defensive_line']

// Isometric constants
const ISO_TILT = 0.5236  // 30 degree tilt (perspective)
const MIN_ZOOM = 0.4
const MAX_ZOOM = 2.5

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

// Convert world X,Y (normalized 0-1) to screen coordinates with camera rotation
function worldToIso(wx, wy, w, h, cx, cy, zoom, angle) {
  const ix = (wx - 0.5) * w
  const iy = (wy - 0.5) * h
  // Base isometric projection
  const sx = (ix - iy) * Math.cos(ISO_TILT)
  const sy = (ix + iy) * Math.sin(ISO_TILT)
  // Rotate by camera angle
  const cosA = Math.cos(angle)
  const sinA = Math.sin(angle)
  const rx = sx * cosA - sy * sinA
  const ry = sx * sinA + sy * cosA
  return {
    x: cx + rx * zoom,
    y: cy + ry * zoom
  }
}

// Perspective Y scalar: entities higher on the map appear smaller
function perspectiveScale(wy, zoom) {
  return zoom * (1 - wy * 0.35)
}

export default function CanvasRenderer({ timeline, currentStep, animProgress }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  // Camera state
  const cameraRef = useRef({ ox: 0, oy: 0, zoom: 1, angle: 0 })
  const dragRef = useRef({ active: false, mode: null, sx: 0, sy: 0, startOx: 0, startOy: 0, startAngle: 0 })
  const [cameraHint, setCameraHint] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all(ICON_TYPES.map(t => {
      const img = getEntityIcon(t)
      if (img.complete) return Promise.resolve()
      return new Promise(resolve => { img.onload = resolve })
    })).then(() => {
      if (!cancelled) setLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  // Mouse drag handlers
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onDown = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return
      if (e.button === 2) {
        e.preventDefault()
        dragRef.current = {
          active: true, mode: 'rotate',
          sx: e.clientX, sy: e.clientY,
          startOx: cameraRef.current.ox, startOy: cameraRef.current.oy,
          startAngle: cameraRef.current.angle
        }
        container.style.cursor = 'grabbing'
      } else if (e.button === 0) {
        dragRef.current = {
          active: true, mode: 'pan',
          sx: e.clientX, sy: e.clientY,
          startOx: cameraRef.current.ox, startOy: cameraRef.current.oy,
          startAngle: cameraRef.current.angle
        }
        setCameraHint(false)
        container.style.cursor = 'grabbing'
      }
    }
    const onContextMenu = (e) => e.preventDefault()
    const onMove = (e) => {
      if (!dragRef.current.active) return
      const dx = e.clientX - dragRef.current.sx
      const dy = e.clientY - dragRef.current.sy
      if (dragRef.current.mode === 'rotate') {
        cameraRef.current.angle = dragRef.current.startAngle + dx * 0.005
      } else {
        cameraRef.current.ox = dragRef.current.startOx + dx
        cameraRef.current.oy = dragRef.current.startOy + dy
      }
      render()
    }
    const onUp = () => {
      dragRef.current.active = false
      container.style.cursor = 'grab'
    }
    const onWheel = (e) => {
      e.preventDefault()
      const rect = container.getBoundingClientRect()
      const mx = e.clientX - rect.left - rect.width / 2
      const my = e.clientY - rect.top - rect.height / 2
      const prevZoom = cameraRef.current.zoom
      const delta = e.deltaY > 0 ? -0.15 : 0.15
      cameraRef.current.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom + delta))
      // Zoom toward cursor
      const scale = cameraRef.current.zoom / prevZoom
      cameraRef.current.ox = mx + (cameraRef.current.ox - mx) * scale
      cameraRef.current.oy = my + (cameraRef.current.oy - my) * scale
      render()
    }
    const onDblClick = () => {
      cameraRef.current = { ox: 0, oy: 0, zoom: 1, angle: 0 }
      render()
    }

    container.addEventListener('mousedown', onDown)
    container.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    container.addEventListener('wheel', onWheel, { passive: false })
    container.addEventListener('dblclick', onDblClick)
    container.style.cursor = 'grab'

    return () => {
      container.removeEventListener('mousedown', onDown)
      container.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      container.removeEventListener('wheel', onWheel)
      container.removeEventListener('dblclick', onDblClick)
    }
  }, [timeline, currentStep, animProgress, loaded])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !timeline || !loaded) return

    const ctx = canvas.getContext('2d')
    const container = containerRef.current
    if (!container) return

    const dpr = window.devicePixelRatio || 1
    const w = container.clientWidth
    const h = container.clientHeight
    if (w === 0 || h === 0) return

    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const { ox, oy, zoom, angle } = cameraRef.current
    const cx = w / 2 + ox
    const cy = h / 2 + oy

    // Draw terrain first (uses its own coordinate system with camera applied)
    const mapWidth = timeline.map?.width || 900
    const mapHeight = timeline.map?.height || 600

    // Clear background
    ctx.fillStyle = '#0f120f'
    ctx.fillRect(0, 0, w, h)

    // Draw isometric ground plane
    ctx.save()
    ctx.beginPath()
    // Calculate isometric ground plane corners
    const corners = [
      worldToIso(0, 0, mapWidth, mapHeight, cx, cy, zoom, angle),
      worldToIso(1, 0, mapWidth, mapHeight, cx, cy, zoom, angle),
      worldToIso(1, 1, mapWidth, mapHeight, cx, cy, zoom, angle),
      worldToIso(0, 1, mapWidth, mapHeight, cx, cy, zoom, angle),
    ]

    // Sky area above the isometric plane
    const topYs = corners.map(c => c.y)
    const minYs = Math.min(...topYs)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, Math.max(minYs, 1))
    skyGrad.addColorStop(0, '#1a1e2e')
    skyGrad.addColorStop(1, '#2a3a55')
    ctx.fillStyle = skyGrad
    ctx.fillRect(0, 0, w, Math.max(minYs, 1))

    // Ground plane (isometric)
    ctx.fillStyle = '#3d4d2e'
    ctx.beginPath()
    corners.forEach((c, i) => i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y))
    ctx.closePath()
    ctx.fill()

    // Ground gradient overlay
    const groundGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h))
    groundGrad.addColorStop(0, 'rgba(61,77,46,0)')
    groundGrad.addColorStop(0.5, 'rgba(45,61,34,0.3)')
    groundGrad.addColorStop(1, 'rgba(30,46,24,0.6)')
    ctx.fillStyle = groundGrad
    ctx.beginPath()
    corners.forEach((c, i) => i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y))
    ctx.closePath()
    ctx.fill()

    // Isometric grid lines
    ctx.strokeStyle = 'rgba(216,162,74,0.07)'
    ctx.lineWidth = 0.5
    const gridSize = 0.08
    for (let gx = 0; gx <= 1; gx += gridSize) {
      const a = worldToIso(gx, 0, mapWidth, mapHeight, cx, cy, zoom, angle)
      const b = worldToIso(gx, 1, mapWidth, mapHeight, cx, cy, zoom, angle)
      const ca = worldToIso(gx, 0, mapWidth, mapHeight, cx, cy, zoom, angle)
      const cb = worldToIso(gx, 1, mapWidth, mapHeight, cx, cy, zoom, angle)
      ctx.beginPath(); ctx.moveTo(ca.x, ca.y); ctx.lineTo(cb.x, cb.y); ctx.stroke()
    }
    for (let gy = 0; gy <= 1; gy += gridSize) {
      const a = worldToIso(0, gy, mapWidth, mapHeight, cx, cy, zoom, angle)
      const b = worldToIso(1, gy, mapWidth, mapHeight, cx, cy, zoom, angle)
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
    }

    // Edge border
    ctx.strokeStyle = 'rgba(216,162,74,0.3)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    corners.forEach((c, i) => i === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y))
    ctx.closePath()
    ctx.stroke()

    // Draw terrain features
    if (timeline.map?.terrain) {
      const scaleX = mapWidth / mapWidth
      const scaleY = mapHeight / mapHeight
      timeline.map.terrain.forEach((t) => {
        const pos = worldToIso(t.x / mapWidth, t.y / mapHeight, mapWidth, mapHeight, cx, cy, zoom, angle)
        const tw = t.width || 100
        const th = t.height || 60
        const twScaled = tw * zoom * 0.7
        const thScaled = th * zoom * 0.7 * (1 - (t.y / mapHeight) * 0.3)
        drawTerrainFeature(ctx, t, pos.x - twScaled / 2, pos.y - thScaled / 2, twScaled, thScaled)
      })
    }

    const step = timeline.steps[currentStep]
    if (!step) { ctx.restore(); return }

    const entities = timeline.entities || []
    const factions = timeline.factions || []
    const states = step.entity_states || []

    let nextStates = []
    if (currentStep < timeline.steps.length - 1 && animProgress > 0) {
      nextStates = timeline.steps[currentStep + 1]?.entity_states || []
    }

    const easedProgress = easeInOutCubic(animProgress)

    // Apply isometric transform for actions and effects
    ctx.save()
    // Temporarily reset transform to draw actions in screen space
    // but we need them in iso space too

    // Draw effects
    step.effects?.forEach((effect) => {
      const pos = worldToIso(effect.x / mapWidth, effect.y / mapHeight, mapWidth, mapHeight, cx, cy, zoom, angle)
      const pSize = perspectiveScale(effect.y / mapHeight, zoom)
      drawEffectScaled(ctx, effect, pos.x, pos.y, pSize)
    })

    // Draw action arrows
    step.actions?.forEach((action) => {
      const from = worldToIso(action.from.x / mapWidth, action.from.y / mapHeight, mapWidth, mapHeight, cx, cy, zoom, angle)
      const to = worldToIso(action.to.x / mapWidth, action.to.y / mapHeight, mapWidth, mapHeight, cx, cy, zoom, angle)
      const isoAction = {
        ...action,
        from: { x: from.x, y: from.y },
        to: { x: to.x, y: to.y }
      }
      drawAction(ctx, isoAction, 1, 1)
    })

    // Draw entities (with isometric projection + perspective scaling)
    states.forEach((state) => {
      if (!state.visible) return

      const entity = entities.find((e) => e.id === state.entity_id)
      const faction = factions.find((f) => f.id === entity?.faction_id)
      const color = faction?.color || '#D8A24A'

      let wx = state.x / mapWidth
      let wy = state.y / mapHeight

      if (easedProgress > 0 && nextStates.length > 0) {
        const nextState = nextStates.find((ns) => ns.entity_id === state.entity_id)
        if (nextState) {
          wx = (state.x + (nextState.x - state.x) * easedProgress) / mapWidth
          wy = (state.y + (nextState.y - state.y) * easedProgress) / mapHeight
        }
      }

      const pos = worldToIso(wx, wy, mapWidth, mapHeight, cx, cy, zoom, angle)
      const eSize = Math.max(38, 55 * perspectiveScale(wy, zoom))
      const opacity = STATUS_OPACITY[state.status] || 1

      // Status overlay circle
      const statusColor = STATUS_COLORS[state.status]
      if (statusColor && state.status !== 'idle') {
        ctx.save()
        ctx.globalAlpha = opacity * (state.status === 'defending' ? 0.2 : 0.15)
        ctx.fillStyle = statusColor
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, eSize * 0.9, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      drawEntity(ctx, { ...entity, factionColor: color, label: entity?.label }, pos.x, pos.y, eSize * 0.7, opacity)

      // Status overlays
      if (state.status === 'attacking') {
        const pulse = 0.3 + Math.sin(Date.now() / 350) * 0.15
        ctx.save()
        ctx.globalAlpha = pulse
        ctx.strokeStyle = '#8F1D1D'
        ctx.lineWidth = 2.5
        ctx.setLineDash([4, 3])
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, eSize * 0.95, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }
      if (state.status === 'retreating') {
        ctx.save()
        ctx.globalAlpha = 0.4
        ctx.strokeStyle = '#A99D8A'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, eSize * 0.9, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#A99D8A'
        ctx.beginPath()
        ctx.moveTo(pos.x - 16, pos.y)
        ctx.lineTo(pos.x - 8, pos.y - 4)
        ctx.lineTo(pos.x - 8, pos.y + 4)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
      if (state.status === 'destroyed') {
        ctx.save()
        ctx.globalAlpha = 0.65
        ctx.strokeStyle = '#8F1D1D'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(pos.x - 11, pos.y - 11)
        ctx.lineTo(pos.x + 11, pos.y + 11)
        ctx.moveTo(pos.x + 11, pos.y - 11)
        ctx.lineTo(pos.x - 11, pos.y + 11)
        ctx.stroke()
        ctx.restore()
      }
    })

    ctx.restore()

    // Overlay: step indicator (fixed in screen space, not affected by camera)
    ctx.save()
    ctx.fillStyle = 'rgba(11,10,7,0.7)'
    ctx.beginPath()
    ctx.roundRect(10, 10, 170, 28, 6)
    ctx.fill()
    ctx.fillStyle = '#F2C66D'
    ctx.font = 'bold 11px serif'
    ctx.textAlign = 'left'
    ctx.fillText(`Step ${step.step}/${timeline.steps.length}: ${step.title}`, 18, 28)
    ctx.restore()

    // Zoom indicator
    ctx.save()
    ctx.fillStyle = 'rgba(11,10,7,0.6)'
    ctx.beginPath()
    ctx.roundRect(w - 80, 10, 70, 22, 6)
    ctx.fill()
    ctx.fillStyle = 'rgba(216,162,74,0.7)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(`${Math.round(zoom * 100)}%`, w - 45, 25)
    ctx.restore()

    // Camera hint
    if (cameraHint && zoom === 1 && ox === 0 && oy === 0 && angle === 0) {
      ctx.save()
      ctx.fillStyle = 'rgba(11,10,7,0.55)'
      const hintW = 340, hintH = 36
      ctx.beginPath()
      ctx.roundRect(cx - hintW / 2, cy - hintH / 2, hintW, hintH, 8)
      ctx.fill()
      ctx.fillStyle = 'rgba(216,162,74,0.7)'
      ctx.font = '12px serif'
      ctx.textAlign = 'center'
      ctx.fillText('Drag to pan \u00b7 Right-drag to rotate \u00b7 Scroll to zoom \u00b7 Dbl-click to reset', cx, cy + 4)
      ctx.restore()
    }

    // Pulse loop
    if (step.entity_states?.some(s => s.status === 'attacking')) {
      rafRef.current = requestAnimationFrame(render)
    }
  }, [timeline, currentStep, animProgress, loaded, cameraHint])

  // Render triggers
  useEffect(() => {
    if (!loaded) return
    render()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [render])

  useEffect(() => {
    const hasAttacking = timeline?.steps[currentStep]?.entity_states?.some(
      (s) => s.status === 'attacking'
    )
    if (hasAttacking) {
      const interval = setInterval(render, 100)
      return () => clearInterval(interval)
    }
  }, [timeline, currentStep, render])

  // ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(render)
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [render])

  if (!loaded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-museum-charcoal gap-2">
        <div className="text-museum-gold/60 font-display text-sm animate-pulse">Loading battlefield map...</div>
        <div className="text-museum-muted/40 text-xs">Rendering terrain and unit icons</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full relative select-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}

// Scaled effect drawing for isometric
function drawEffectScaled(ctx, effect, x, y, scale) {
  ctx.save()
  switch (effect.type) {
    case 'explosion':
      const grad = ctx.createRadialGradient(x, y, 2 * scale, x, y, 32 * scale)
      grad.addColorStop(0, '#F7EFE2')
      grad.addColorStop(0.15, '#F2C66D')
      grad.addColorStop(0.4, '#C76A35')
      grad.addColorStop(0.7, '#8F1D1D')
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, 32 * scale, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#F7EFE2'
      ctx.beginPath()
      ctx.arc(x, y, 5 * scale, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'smoke':
      ctx.fillStyle = 'rgba(169,157,138,0.4)'
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.arc(x + i * 12 * scale, y - i * 6 * scale, (10 + i * 4) * scale, 0, Math.PI * 2)
        ctx.fill()
      }
      break
    case 'victory_burst':
      ctx.strokeStyle = '#F2C66D'
      ctx.lineWidth = 2
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI * 2 / 8) * i
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(a) * 40 * scale, y + Math.sin(a) * 40 * scale)
        ctx.stroke()
      }
      break
    case 'flag_change':
      ctx.strokeStyle = '#A99D8A'
      ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 28 * scale); ctx.stroke()
      ctx.fillStyle = '#C76A35'
      ctx.beginPath(); ctx.moveTo(x, y - 28 * scale); ctx.lineTo(x + 18 * scale, y - 20 * scale); ctx.lineTo(x, y - 13 * scale); ctx.closePath(); ctx.fill()
      break
  }
  ctx.restore()
}

// We need a local terrain feature renderer that doesn't use the old coordinate system
function drawTerrainFeature(ctx, terrain, x, y, w, h) {
  ctx.save()
  switch (terrain.type) {
    case 'hill':
      const cx = x + w / 2
      ctx.fillStyle = '#3d6b45'
      ctx.beginPath()
      ctx.moveTo(x, y + h)
      ctx.quadraticCurveTo(x + w * 0.25, y + h * 0.2, cx, y)
      ctx.quadraticCurveTo(x + w * 0.75, y + h * 0.2, x + w, y + h)
      ctx.closePath()
      ctx.fill()
      ctx.fillStyle = '#4a7d52'
      ctx.beginPath()
      ctx.moveTo(cx, y)
      ctx.quadraticCurveTo(x + w * 0.75, y + h * 0.2, x + w, y + h)
      ctx.lineTo(cx, y + h * 0.4)
      ctx.closePath()
      ctx.fill()
      if (terrain.label) {
        ctx.fillStyle = 'rgba(232,221,200,0.9)'
        ctx.font = `${Math.max(9, w * 0.1)}px serif`
        ctx.textAlign = 'center'
        ctx.fillText(terrain.label, cx, y + h * 0.5) // Keep label
      }
      break
    case 'river':
      ctx.strokeStyle = 'rgba(25,55,35,0.7)'
      ctx.lineWidth = Math.max(h * 1.5, 8)
      ctx.beginPath()
      ctx.moveTo(x, y + h / 2)
      ctx.bezierCurveTo(x + w * 0.3, y + h * 0.1, x + w * 0.7, y + h * 0.9, x + w, y + h / 2)
      ctx.stroke()
      ctx.strokeStyle = 'rgba(60,130,110,0.5)'
      ctx.lineWidth = Math.max(h, 5)
      ctx.beginPath()
      ctx.moveTo(x, y + h / 2)
      ctx.bezierCurveTo(x + w * 0.3, y + h * 0.1, x + w * 0.7, y + h * 0.9, x + w, y + h / 2)
      ctx.stroke()
      break
    case 'forest':
      ctx.fillStyle = 'rgba(18,52,24,0.5)'
      ctx.fillRect(x, y + h * 0.2, w, h * 0.8)
      for (let i = 0; i < 5; i++) {
        const tx = x + w * (0.1 + i * 0.18)
        ctx.fillStyle = 'rgba(18,52,24,0.6)'
        ctx.beginPath()
        ctx.arc(tx, y + h * 0.4, h * 0.25, Math.PI, 0)
        ctx.fill()
      }
      break
    case 'fortification':
      ctx.fillStyle = 'rgba(107,90,74,0.85)'
      ctx.strokeStyle = '#3a2a1a'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x, y + h)
      ctx.lineTo(x, y + h * 0.3)
      ctx.lineTo(x + w * 0.15, y)
      ctx.lineTo(x + w * 0.85, y)
      ctx.lineTo(x + w, y + h * 0.3)
      ctx.lineTo(x + w, y + h)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
      ctx.strokeStyle = '#8a7a6a'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(x + w / 2, y)
      ctx.lineTo(x + w / 2, y - h * 0.3)
      ctx.stroke()
      ctx.fillStyle = '#8F1D1D'
      ctx.beginPath()
      ctx.moveTo(x + w / 2, y - h * 0.3)
      ctx.lineTo(x + w / 2 + w * 0.15, y - h * 0.22)
      ctx.lineTo(x + w / 2, y - h * 0.12)
      ctx.closePath()
      ctx.fill()
      break
    case 'town':
      ctx.fillStyle = 'rgba(138,110,90,0.3)'
      ctx.fillRect(x, y + h * 0.2, w, h * 0.8)
      const blds = [
        { bx: x + w * 0.05, by: y + h * 0.15, bw: w * 0.18, bh: h * 0.35 },
        { bx: x + w * 0.28, by: y + h * 0.25, bw: w * 0.14, bh: h * 0.28 },
        { bx: x + w * 0.48, by: y + h * 0.08, bw: w * 0.18, bh: h * 0.42 },
        { bx: x + w * 0.72, by: y + h * 0.2, bw: w * 0.14, bh: h * 0.3 },
      ]
      blds.forEach(b => {
        ctx.fillStyle = 'rgba(107,90,74,0.6)'
        ctx.fillRect(b.bx, b.by, b.bw, b.bh)
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 1
        ctx.strokeRect(b.bx, b.by, b.bw, b.bh)
        ctx.fillStyle = 'rgba(130,50,30,0.5)'
        ctx.beginPath()
        ctx.moveTo(b.bx - 2, b.by)
        ctx.lineTo(b.bx + b.bw / 2, b.by - b.bh * 0.18)
        ctx.lineTo(b.bx + b.bw + 2, b.by)
        ctx.closePath()
        ctx.fill()
      })
      break
  }
  ctx.restore()
}
