import { useEffect, useRef, useCallback } from 'react'

export default function ATFieldCrack({ onShatterComplete }) {
  const canvasRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W   = canvas.width  = window.innerWidth
    const H   = canvas.height = window.innerHeight

    // ── HEXAGONAL GRID ──────────────────────────────────────
    // Draw the AT-Field hex grid that will crack
    const HEX_SIZE  = 48
    const HEX_W     = HEX_SIZE * 2
    const HEX_H     = Math.sqrt(3) * HEX_SIZE
    const COLS      = Math.ceil(W / (HEX_W * 0.75)) + 2
    const ROWS      = Math.ceil(H / HEX_H) + 2

    const hexPath = (cx, cy, size) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = cx + size * Math.cos(angle)
        const y = cy + size * Math.sin(angle)
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.closePath()
    }

    // Store hex centers for crack emanation
    const hexes = []
    for (let row = -1; row < ROWS; row++) {
      for (let col = -1; col < COLS; col++) {
        const cx = col * HEX_W * 0.75 + HEX_SIZE
        const cy = row * HEX_H + (col % 2 === 0 ? 0 : HEX_H / 2) + HEX_H / 2
        hexes.push({ cx, cy, row, col,
          distFromCenter: Math.hypot(cx - W/2, cy - H/2)
        })
      }
    }

    // Sort by distance from center — crack spreads outward
    hexes.sort((a, b) => a.distFromCenter - b.distFromCenter)

    // Animation state per hex
    const hexState = hexes.map(() => ({
      crackProgress: 0,    // 0-1 how cracked
      glowIntensity: 0,    // 0-1 orange glow
      shatterProgress: 0,  // 0-1 shattering away
      shatterDx: 0,
      shatterDy: 0,
      shatterRot: 0,
      delay: 0,
      active: false
    }))

    // Phase timing
    let phase          = 'grid'      // grid → crack → glow → shatter → done
    let phaseStart     = performance.now()
    let crackWaveStart = 0
    let frameId

    // PHASE DURATIONS (ms)
    const GRID_HOLD    = 300
    const CRACK_SPREAD = 800
    const GLOW_HOLD    = 400
    const SHATTER_DUR  = 700

    const render = (now) => {
      frameId = requestAnimationFrame(render)
      ctx.clearRect(0, 0, W, H)

      const elapsed = now - phaseStart

      // ── PHASE: GRID ────────────────────────────────────────
      if (phase === 'grid') {
        // Draw clean AT-Field hex grid
        hexes.forEach(({ cx, cy }) => {
          hexPath(cx, cy, HEX_SIZE - 2)
          ctx.strokeStyle = 'rgba(255,102,0,0.5)'
          ctx.lineWidth   = 1
          ctx.stroke()
          ctx.fillStyle   = 'rgba(255,102,0,0.04)'
          ctx.fill()
        })

        if (elapsed > GRID_HOLD) {
          phase          = 'crack'
          phaseStart     = now
          crackWaveStart = now

          // Assign delays based on distance from center
          const maxDist = hexes[hexes.length - 1].distFromCenter
          hexState.forEach((s, i) => {
            s.delay  = (hexes[i].distFromCenter / maxDist) * CRACK_SPREAD * 0.8
            s.active = false
          })
        }
      }

      // ── PHASE: CRACK ───────────────────────────────────────
      else if (phase === 'crack') {
        const waveElapsed = now - crackWaveStart

        hexState.forEach((s, i) => {
          if (waveElapsed > s.delay) {
            s.crackProgress = Math.min(1,
              (waveElapsed - s.delay) / (CRACK_SPREAD * 0.4)
            )
            s.glowIntensity = s.crackProgress
          }
        })

        hexes.forEach(({ cx, cy }, i) => {
          const s    = hexState[i]
          const prog = s.crackProgress

          // Base hex fill — darkens as it cracks
          hexPath(cx, cy, HEX_SIZE - 2)
          ctx.fillStyle = `rgba(10,10,15,${0.95 - prog * 0.5})`
          ctx.fill()

          // Orange glow seeping through cracks
          if (prog > 0) {
            hexPath(cx, cy, HEX_SIZE - 2)
            ctx.fillStyle = `rgba(255,${80 + prog * 80},0,${prog * 0.6})`
            ctx.fill()

            // Bright center glow
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, HEX_SIZE)
            grad.addColorStop(0,   `rgba(255,160,0,${prog * 0.8})`)
            grad.addColorStop(0.4, `rgba(255,80,0,${prog * 0.4})`)
            grad.addColorStop(1,   'rgba(255,40,0,0)')
            ctx.fillStyle = grad
            ctx.fill()
          }

          // Hex border — cracks appear as bright orange lines
          hexPath(cx, cy, HEX_SIZE - 2)
          ctx.strokeStyle = prog > 0
            ? `rgba(255,${100 + prog * 155},0,${0.4 + prog * 0.6})`
            : 'rgba(255,102,0,0.3)'
          ctx.lineWidth = prog > 0.5 ? 1.5 + prog * 2 : 1
          ctx.stroke()

          // Crack lines radiating from hex center
          if (prog > 0.3) {
            const crackCount = 3 + Math.floor(prog * 3)
            for (let c = 0; c < crackCount; c++) {
              const angle  = (c / crackCount) * Math.PI * 2 +
                             (i * 0.7) // offset per hex
              const length = (HEX_SIZE * 0.6) * prog
              const sx = cx + Math.cos(angle) * length * 0.2
              const sy = cy + Math.sin(angle) * length * 0.2
              const ex = cx + Math.cos(angle) * length
              const ey = cy + Math.sin(angle) * length

              ctx.beginPath()
              ctx.moveTo(sx, sy)
              ctx.lineTo(ex, ey)
              ctx.strokeStyle = `rgba(255,${150 + prog * 105},0,${prog * 0.8})`
              ctx.lineWidth   = 0.5 + prog
              ctx.stroke()
            }
          }
        })

        // All hexes cracked — move to glow
        const allCracked = hexState.every(s => s.crackProgress >= 0.9)
        if (allCracked) {
          phase      = 'glow'
          phaseStart = now
        }
      }

      // ── PHASE: GLOW ────────────────────────────────────────
      else if (phase === 'glow') {
        const glowPulse = 0.7 + Math.sin(elapsed / 80) * 0.3

        hexes.forEach(({ cx, cy }, i) => {
          hexPath(cx, cy, HEX_SIZE - 2)

          // Pulsing orange fill
          ctx.fillStyle = `rgba(255,100,0,${0.3 * glowPulse})`
          ctx.fill()

          // Bright border
          ctx.strokeStyle = `rgba(255,180,0,${0.8 * glowPulse})`
          ctx.lineWidth   = 2
          ctx.stroke()

          // Inner glow
          const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, HEX_SIZE)
          grad.addColorStop(0,   `rgba(255,200,100,${0.6 * glowPulse})`)
          grad.addColorStop(0.5, `rgba(255,100,0,${0.3 * glowPulse})`)
          grad.addColorStop(1,   'rgba(255,50,0,0)')
          ctx.fillStyle = grad
          ctx.fill()

          // Crack lines stay visible
          const crackCount = 5
          for (let c = 0; c < crackCount; c++) {
            const angle  = (c / crackCount) * Math.PI * 2 + (i * 0.7)
            const length = HEX_SIZE * 0.7
            ctx.beginPath()
            ctx.moveTo(
              cx + Math.cos(angle) * length * 0.15,
              cy + Math.sin(angle) * length * 0.15
            )
            ctx.lineTo(
              cx + Math.cos(angle) * length,
              cy + Math.sin(angle) * length
            )
            ctx.strokeStyle = `rgba(255,220,100,${0.6 * glowPulse})`
            ctx.lineWidth   = 1.5
            ctx.stroke()
          }
        })

        // Full white flash overlay at peak glow
        if (elapsed > GLOW_HOLD * 0.7 && elapsed < GLOW_HOLD * 0.85) {
          const flashProg = (elapsed - GLOW_HOLD * 0.7) / (GLOW_HOLD * 0.15)
          ctx.fillStyle   = `rgba(255,200,100,${flashProg * 0.9})`
          ctx.fillRect(0, 0, W, H)
        }

        if (elapsed > GLOW_HOLD) {
          phase      = 'shatter'
          phaseStart = now

          // Assign shatter velocities — fly outward from center
          hexState.forEach((s, i) => {
            const { cx, cy } = hexes[i]
            const dx    = cx - W / 2
            const dy    = cy - H / 2
            const dist  = Math.hypot(dx, dy) || 1
            const speed = 3 + Math.random() * 4
            s.shatterDx  = (dx / dist) * speed +
                           (Math.random() - 0.5) * 2
            s.shatterDy  = (dy / dist) * speed +
                           (Math.random() - 0.5) * 2 + 1
            s.shatterRot = (Math.random() - 0.5) * 0.3
            s.shatterDelay = hexes[i].distFromCenter /
                             (hexes[hexes.length-1].distFromCenter) * 200
          })
        }
      }

      // ── PHASE: SHATTER ─────────────────────────────────────
      else if (phase === 'shatter') {
        // White flash at start of shatter
        if (elapsed < 100) {
          const flashAmt = 1 - elapsed / 100
          ctx.fillStyle  = `rgba(255,200,100,${flashAmt})`
          ctx.fillRect(0, 0, W, H)
        }

        hexes.forEach(({ cx, cy }, i) => {
          const s         = hexState[i]
          const pieceTime = Math.max(0, elapsed - s.shatterDelay)
          const prog      = Math.min(1, pieceTime / SHATTER_DUR)

          if (prog <= 0) {
            // Still in place
            hexPath(cx, cy, HEX_SIZE - 2)
            ctx.fillStyle   = 'rgba(255,120,0,0.4)'
            ctx.fill()
            ctx.strokeStyle = 'rgba(255,180,0,0.8)'
            ctx.lineWidth   = 1.5
            ctx.stroke()
            return
          }

          // Ease out — fast start slow end
          const ease    = 1 - Math.pow(1 - prog, 3)
          const offsetX = s.shatterDx * ease * HEX_SIZE * 4
          const offsetY = s.shatterDy * ease * HEX_SIZE * 4 +
                          ease * ease * 200  // gravity
          const rot     = s.shatterRot * ease * 8
          const opacity = 1 - ease * ease

          if (opacity <= 0.01) return

          ctx.save()
          ctx.translate(cx + offsetX, cy + offsetY)
          ctx.rotate(rot)

          hexPath(0, 0, (HEX_SIZE - 2) * (1 - ease * 0.3))

          // Color shifts from orange to white as it flies
          const r = 255
          const g = Math.round(120 + ease * 135)
          const b = Math.round(ease * 100)
          ctx.fillStyle   = `rgba(${r},${g},${b},${opacity * 0.5})`
          ctx.fill()
          ctx.strokeStyle = `rgba(${r},${g},${b},${opacity * 0.9})`
          ctx.lineWidth   = 1 + (1 - ease)
          ctx.stroke()

          ctx.restore()
        })

        // All shattered — done
        const allGone = hexState.every((s, i) => {
          const pieceTime = Math.max(0, elapsed - s.shatterDelay)
          return pieceTime / SHATTER_DUR >= 1
        })

        if (allGone || elapsed > SHATTER_DUR + 300) {
          cancelAnimationFrame(frameId)
          if (onShatterComplete) onShatterComplete()
        }
      }
    }

    frameId = requestAnimationFrame(render)

    return () => cancelAnimationFrame(frameId)
  }, [onShatterComplete])

  useEffect(() => {
    const cleanup = draw()
    const onResize = () => draw()
    window.addEventListener('resize', onResize)
    return () => {
      cleanup?.()
      window.removeEventListener('resize', onResize)
    }
  }, [draw])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      width: '100%', height: '100%',
      pointerEvents: 'none'
    }} />
  )
}
