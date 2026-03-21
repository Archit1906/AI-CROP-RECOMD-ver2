import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import ATFieldCrack from './ATFieldCrack'

export default function EvaLaunch({ onComplete }) {
  const canvasRef    = useRef(null)
  const overlayRef   = useRef(null)
  const flashRef     = useRef(null)
  const shakeRef     = useRef(null)
  const doneRef      = useRef(false)

  const [countdown,  setCountdown]  = useState(3)
  const [showCount,  setShowCount]  = useState(true)
  const [phase,      setPhase]      = useState('standby')
  const [warning,    setWarning]    = useState(false)
  const [logLines,   setLogLines]   = useState([])
  const [showLogo,   setShowLogo]   = useState(false)
  const [logoText,   setLogoText]   = useState('')
  const [showSkip,   setShowSkip]   = useState(false)
  const [redBorder,  setRedBorder]  = useState(false)
  const [showSub,    setShowSub]    = useState(false)
  const [showCrack,  setShowCrack]  = useState(false)
  const [crackDone,  setCrackDone]  = useState(false)

  const FULL_LOGO   = 'AMRITKRISHI'
  const LOGO_SUB    = 'MAGI AGRICULTURAL INTELLIGENCE SYSTEM // v2.0'

  const handleComplete = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.8, ease: 'power2.in',
      onComplete
    })
  }, [onComplete])

  const handleShatterComplete = useCallback(() => {
    setCrackDone(true)
    handleComplete()
  }, [handleComplete])

  // Type out logo letter by letter
  const typeLogo = useCallback(() => {
    let i = 0
    const interval = setInterval(() => {
      setLogoText(FULL_LOGO.slice(0, i + 1))
      i++
      if (i >= FULL_LOGO.length) {
        clearInterval(interval)
        setTimeout(() => setShowSub(true), 200)
      }
    }, 60)
  }, [])

  useEffect(() => {
    setTimeout(() => setShowSkip(true), 1000)

    // ── THREE.JS SETUP ────────────────────────────────────────
    const canvas   = canvasRef.current
    const W        = window.innerWidth
    const H        = window.innerHeight
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x050508, 1)

    const scene  = new THREE.Scene()
    scene.fog    = new THREE.Fog(0x050508, 10, 80)

    const camera = new THREE.PerspectiveCamera(90, W / H, 0.1, 300)
    camera.position.set(0, 120, 0)
    camera.lookAt(0, 0, 0)

    // ── TUNNEL ────────────────────────────────────────────────
    const TUNNEL_RADIUS = 8
    const SHAFT_COUNT   = 32
    const shaftGroup    = new THREE.Group()

    // Vertical shaft lines
    for (let i = 0; i < SHAFT_COUNT; i++) {
      const angle  = (i / SHAFT_COUNT) * Math.PI * 2
      const x      = Math.cos(angle) * TUNNEL_RADIUS
      const z      = Math.sin(angle) * TUNNEL_RADIUS
      const points = [
        new THREE.Vector3(x, -300, z),
        new THREE.Vector3(x,  300, z),
      ]
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      const mat = new THREE.LineBasicMaterial({
        color: i % 4 === 0 ? '#FF6600' : '#FF330011',
        transparent: true,
        opacity: i % 4 === 0 ? 0.9 : 0.3
      })
      shaftGroup.add(new THREE.Line(geo, mat))
    }
    scene.add(shaftGroup)

    // Dense horizontal rings — more rings = more speed sensation
    const RING_COUNT  = 120
    const ringMeshes  = []
    for (let r = 0; r < RING_COUNT; r++) {
      const ringPts = []
      const segs    = 48
      const yPos    = -300 + r * (600 / RING_COUNT)
      const isMajor = r % 8 === 0
      const rad     = isMajor ? TUNNEL_RADIUS + 0.3 : TUNNEL_RADIUS

      for (let s = 0; s <= segs; s++) {
        const a = (s / segs) * Math.PI * 2
        ringPts.push(new THREE.Vector3(
          Math.cos(a) * rad, yPos, Math.sin(a) * rad
        ))
      }
      const geo = new THREE.BufferGeometry().setFromPoints(ringPts)
      const mat = new THREE.LineBasicMaterial({
        color: isMajor ? '#FF6600' : '#FF660044',
        transparent: true,
        opacity: isMajor ? 1.0 : 0.4
      })
      const ring = new THREE.Line(geo, mat)
      ringMeshes.push({ mesh: ring, mat, isMajor })
      scene.add(ring)
    }

    // Inner tunnel glow cylinder
    const cylGeo = new THREE.CylinderGeometry(
      TUNNEL_RADIUS - 0.5, TUNNEL_RADIUS - 0.5, 600, 32, 1, true
    )
    const cylMat = new THREE.MeshBasicMaterial({
      color: '#FF3300',
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide
    })
    scene.add(new THREE.Mesh(cylGeo, cylMat))

    // ── SPARK PARTICLES ───────────────────────────────────────
    const SPARK_N  = 3000
    const sPos     = new Float32Array(SPARK_N * 3)
    const sVel     = new Float32Array(SPARK_N)
    const sColors  = new Float32Array(SPARK_N * 3)

    for (let i = 0; i < SPARK_N; i++) {
      const angle  = Math.random() * Math.PI * 2
      const r      = 1 + Math.random() * (TUNNEL_RADIUS - 2)
      sPos[i*3]    = Math.cos(angle) * r
      sPos[i*3+1]  = (Math.random() - 0.5) * 600
      sPos[i*3+2]  = Math.sin(angle) * r
      sVel[i]      = 1 + Math.random() * 3
      // Color: mix orange and red
      sColors[i*3]   = 1.0
      sColors[i*3+1] = 0.2 + Math.random() * 0.2
      sColors[i*3+2] = 0
    }

    const sGeo = new THREE.BufferGeometry()
    sGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3))
    sGeo.setAttribute('color',    new THREE.BufferAttribute(sColors, 3))
    const sMat = new THREE.PointsMaterial({
      size: 0.06, vertexColors: true,
      transparent: true, opacity: 0.9
    })
    const sparks = new THREE.Points(sGeo, sMat)
    scene.add(sparks)

    // ── IMPACT SHOCKWAVE RINGS ────────────────────────────────
    const makeShockRing = (radius, color) => {
      const pts = []
      for (let i = 0; i <= 64; i++) {
        const a = (i / 64) * Math.PI * 2
        pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
      }
      const geo  = new THREE.BufferGeometry().setFromPoints(pts)
      const mat  = new THREE.LineBasicMaterial({
        color, transparent: true, opacity: 0
      })
      const ring = new THREE.Line(geo, mat)
      ring.position.y = 0.5
      scene.add(ring)
      return { ring, mat }
    }

    const shock1 = makeShockRing(0.1, '#FF6600')
    const shock2 = makeShockRing(0.1, '#FF0033')
    const shock3 = makeShockRing(0.1, '#FFFFFF')

    // ── POINT LIGHT AT BOTTOM ─────────────────────────────────
    const bottomLight = new THREE.PointLight('#FF6600', 0, 40)
    bottomLight.position.set(0, 1, 0)
    scene.add(bottomLight)

    // ── ANIMATION STATE ───────────────────────────────────────
    let camSpeed   = 0
    let sparkSpeed = 1
    let rotating   = false
    let frameId

    const clock = new THREE.Clock()

    const animLoop = () => {
      frameId = requestAnimationFrame(animLoop)
      const delta = clock.getDelta()
      const elapsed = clock.getElapsedTime()

      // Move rings downward — speed sensation
      ringMeshes.forEach(({ mesh }) => {
        mesh.position.y -= camSpeed * delta * 80
        if (mesh.position.y < -300) mesh.position.y += 600
      })

      // Sparks stream upward
      const pos = sparks.geometry.attributes.position.array
      for (let i = 0; i < SPARK_N; i++) {
        pos[i*3+1] += sVel[i] * sparkSpeed * delta * 25
        if (pos[i*3+1] > 300) pos[i*3+1] = -300
      }
      sparks.geometry.attributes.position.needsUpdate = true

      // Rotate shaft
      shaftGroup.rotation.y += delta * (rotating ? 0.8 : 0.15)

      // Bottom light pulse
      bottomLight.intensity = Math.max(0, Math.sin(elapsed * 6) * 2)

      renderer.render(scene, camera)
    }
    animLoop()

    // ── SCREEN SHAKE ──────────────────────────────────────────
    const shake = (intensity, duration) => {
      if (!shakeRef.current) return
      const el = shakeRef.current
      const start = performance.now()
      const shakeLoop = (now) => {
        const t = (now - start) / (duration * 1000)
        if (t >= 1) { el.style.transform = 'translate(0,0)'; return }
        const decay = 1 - t
        const x = (Math.random() - 0.5) * intensity * decay * 2
        const y = (Math.random() - 0.5) * intensity * decay * 2
        el.style.transform = `translate(${x}px, ${y}px)`
        requestAnimationFrame(shakeLoop)
      }
      requestAnimationFrame(shakeLoop)
    }

    // ── WHITE FLASH ───────────────────────────────────────────
    const whiteFlash = (duration = 0.15) => {
      if (!flashRef.current) return
      gsap.to(flashRef.current, { opacity: 1, duration: 0.04 })
      gsap.to(flashRef.current, { opacity: 0, duration, delay: 0.04 })
    }

    // ── MAIN TIMELINE ─────────────────────────────────────────
    const tl = gsap.timeline()

    // PHASE 1 — Countdown (0 to 3s)
    tl.call(() => setCountdown(3), null, 0)
    tl.call(() => { setCountdown(2); setWarning(true) }, null, 1.0)
    tl.call(() => { setCountdown(1); setRedBorder(true) }, null, 2.0)
    tl.call(() => {
      setCountdown(0)
      setShowCount(false)
      setPhase('launch')
      setWarning(false)
      setRedBorder(false)
    }, null, 3.0)

    // PHASE 2 — Initial movement (3.0s)
    tl.call(() => {
      camSpeed   = 0.2
      sparkSpeed = 2
      setLogLines(['> LAUNCH SYSTEM ARMED'])
    }, null, 3.0)

    // Accelerate hard
    tl.to({}, {
      duration: 0.8,
      onUpdate: function() {
        const p    = this.progress()
        camSpeed   = 0.2 + p * 3
        sparkSpeed = 2   + p * 15
        bottomLight.intensity = p * 5
      }
    }, 3.0)

    // Add logs during rush
    tl.call(() => setLogLines(p => [...p, '> CATAPULT AT FULL POWER']), null, 3.3)
    tl.call(() => setLogLines(p => [...p, '> EJECTION IN 3..2..1..']), null, 3.6)

    // PHASE 3 — Hyperspeed (3.8s)
    tl.call(() => {
      setPhase('rush')
      rotating   = true
      camSpeed   = 8
      sparkSpeed = 30
      setRedBorder(true)
    }, null, 3.8)

    tl.call(() => setLogLines(p => [...p, '> ████████████████ 100%']), null, 3.9)

    // Camera screams downward
    tl.to(camera.position, {
      y: 1, duration: 0.7,
      ease: 'power4.in'
    }, 3.8)

    // PHASE 4 — IMPACT (4.5s)
    tl.call(() => {
      setPhase('impact')
      camSpeed   = 0
      sparkSpeed = 0
      rotating   = false
      setRedBorder(false)

      // White flash
      whiteFlash(0.3)

      // Screen shake
      shake(25, 0.6)

      // Bottom light burst
      gsap.to(bottomLight, { intensity: 20, duration: 0.05 })
      gsap.to(bottomLight, { intensity: 0,  duration: 0.5, delay: 0.05 })

      // Shockwave rings expand
      const expandShock = (shock, delay, scale, color) => {
        gsap.to(shock.mat, { opacity: 0.9, duration: 0.05, delay })
        gsap.to(shock.ring.scale, { x: scale, z: scale, duration: 1.2, delay, ease: 'power2.out' })
        gsap.to(shock.mat, { opacity: 0, duration: 1.0, delay: delay + 0.1 })
      }
      expandShock(shock1, 0,    80, '#FF6600')
      expandShock(shock2, 0.08, 60, '#FF0033')
      expandShock(shock3, 0.04, 40, '#FFFFFF')

      setLogLines(p => [...p, '> IMPACT DETECTED // UNIT ONLINE'])
    }, null, 4.5)

    // Camera bounce
    tl.to(camera.position, { y: 0.3, duration: 0.08, ease: 'power4.out' }, 4.5)
    tl.to(camera.position, { y: 4,   duration: 0.6,  ease: 'elastic.out(1,0.4)' }, 4.58)

    // Camera tilt to face forward
    tl.to(camera.rotation, {
      x: -Math.PI / 2 + 0.15,
      duration: 0.8, ease: 'power2.out'
    }, 4.6)

    // Second smaller shake
    tl.call(() => shake(10, 0.3), null, 4.7)

    // Red border flash on impact
    tl.call(() => {
      setRedBorder(true)
      setTimeout(() => setRedBorder(false), 200)
    }, null, 4.5)

    // PHASE 5 — Logo reveal (5.3s)
    tl.call(() => {
      setPhase('reveal')
      setShowLogo(true)
      whiteFlash(0.05)
      shake(8, 0.2)
      typeLogo()
    }, null, 5.3)

    // After logo types out — trigger AT-Field crack
    tl.call(() => {
      setShowCrack(true)
    }, null, 5.3 + FULL_LOGO.length * 0.06 + 0.8)

    // Slow camera rotation for dramatic hold
    tl.to(camera.rotation, {
      y: 0.08, duration: 4, ease: 'power1.inOut'
    }, 5.3)

    // Auto complete as fallback in case shatter takes too long
    // The shatter will trigger completion earlier but this ensures no infinite hangs
    tl.call(() => handleComplete(), null, 12.0)

    // Resize
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      renderer.dispose()
      window.removeEventListener('resize', onResize)
      tl.kill()
    }
  }, [handleComplete, typeLogo])

  return (
    <div ref={overlayRef} style={{
      position:'fixed', inset:0, zIndex:9999,
      background:'#050508', overflow:'hidden'
    }}>
      {/* Three.js canvas */}
      <canvas ref={canvasRef} style={{
        position:'absolute', inset:0,
        width:'100%', height:'100%'
      }} />

      {/* Screen shake wrapper */}
      <div ref={shakeRef} style={{
        position:'absolute', inset:0, pointerEvents:'none'
      }}>

        {/* Scanlines */}
        <div style={{
          position:'absolute', inset:0,
          background:'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)',
          pointerEvents:'none'
        }} />

        {/* Red warning border */}
        {redBorder && (
          <div style={{
            position:'absolute', inset:0,
            border:'4px solid #FF0033',
            boxShadow:'inset 0 0 40px #FF003333, 0 0 40px #FF003333',
            pointerEvents:'none',
            animation:'borderFlash 0.1s infinite'
          }} />
        )}

        {/* COUNTDOWN */}
        {showCount && (
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            textAlign:'center'
          }}>
            <p style={{
              fontFamily:"'Courier New'", fontSize:9,
              color:'#FF660066', letterSpacing:4, margin:'0 0 12px'
            }}>
              // LAUNCH AUTHORIZATION REQUIRED
            </p>
            <div style={{
              fontFamily:"'Courier New'", fontSize:120, fontWeight:900,
              color: countdown <= 1 ? '#FF0033' : countdown <= 2 ? '#FFD700' : '#FF6600',
              lineHeight:1, margin:'0 0 8px',
              textShadow:`0 0 40px ${countdown <= 1 ? '#FF0033' : '#FF6600'}`,
              animation:'countPulse 0.9s ease infinite'
            }}>
              {countdown}
            </div>
            <p style={{
              fontFamily:"'Courier New'", fontSize:11,
              color:'#FF660044', letterSpacing:6, margin:0
            }}>
              {countdown === 3 && 'STANDBY'}
              {countdown === 2 && 'CHARGING'}
              {countdown === 1 && 'LAUNCH IMMINENT'}
            </p>
          </div>
        )}

        {/* Phase label top left */}
        {!showCount && (
          <div style={{ position:'absolute', top:24, left:24 }}>
            <p style={{ fontFamily:"'Courier New'", fontSize:8,
                         color:'#FF660044', letterSpacing:4, margin:'0 0 4px' }}>
              // NERV LAUNCH CONTROL
            </p>
            <p style={{
              fontFamily:"'Courier New'", fontSize:14, fontWeight:700,
              color:'#FF6600', letterSpacing:3, margin:0,
              textShadow:'0 0 10px #FF660088',
              animation: phase === 'rush' ? 'glitchText 0.15s infinite' : 'none'
            }}>
              {phase === 'launch' && '▶ CATAPULT CHARGING'}
              {phase === 'rush'   && '▶▶▶ LAUNCH ACTIVE'}
              {phase === 'impact' && '█ IMPACT DETECTED'}
              {phase === 'reveal' && '● UNIT ONLINE'}
            </p>
          </div>
        )}

        {/* Log lines bottom left */}
        <div style={{
          position:'absolute', bottom:80, left:24,
          pointerEvents:'none'
        }}>
          {logLines.map((line, i) => (
            <p key={i} style={{
              fontFamily:"'Courier New'", fontSize:10,
              color: i === logLines.length - 1 ? '#FF6600' : '#FF660033',
              letterSpacing:1, margin:'2px 0',
              fontWeight: i === logLines.length - 1 ? 700 : 400
            }}>
              {line}
            </p>
          ))}
        </div>

        {/* AMRITKRISHI Logo */}
        {showLogo && (
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:'translate(-50%,-50%)',
            textAlign:'center', width:'90%'
          }}>
            {/* Chromatic aberration layers */}
            <div style={{ position:'relative', display:'inline-block' }}>
              {/* Red layer offset left */}
              <p style={{
                position:'absolute', top:0, left:0,
                fontFamily:"'Courier New'", fontSize:'clamp(28px,5vw,60px)',
                fontWeight:900, color:'#FF0033',
                letterSpacing:12, margin:0,
                transform:'translateX(-4px)',
                opacity:0.5, pointerEvents:'none',
                whiteSpace:'nowrap'
              }}>
                {logoText}
              </p>
              {/* Cyan layer offset right */}
              <p style={{
                position:'absolute', top:0, left:0,
                fontFamily:"'Courier New'", fontSize:'clamp(28px,5vw,60px)',
                fontWeight:900, color:'#00FFFF',
                letterSpacing:12, margin:0,
                transform:'translateX(4px)',
                opacity:0.5, pointerEvents:'none',
                whiteSpace:'nowrap'
              }}>
                {logoText}
              </p>
              {/* Main white layer */}
              <p style={{
                fontFamily:"'Courier New'",
                fontSize:'clamp(28px,5vw,60px)',
                fontWeight:900,
                color:'#FF6600',
                letterSpacing:12, margin:0,
                textShadow:'0 0 40px #FF6600, 0 0 80px #FF660066',
                position:'relative', zIndex:1,
                whiteSpace:'nowrap'
              }}>
                {logoText}
                {/* Blinking cursor while typing */}
                {logoText.length < FULL_LOGO.length && (
                  <span style={{ animation:'blink 0.4s infinite', color:'#FF6600' }}>█</span>
                )}
              </p>
            </div>

            {/* Divider line */}
            <div style={{
              width:'80%', height:1, margin:'12px auto',
              background:'linear-gradient(90deg, transparent, #FF6600, transparent)',
              animation:'lineExpand 0.6s ease forwards'
            }} />

            {showSub && (
              <>
                <p style={{
                  fontFamily:"'Courier New'", fontSize:10,
                  color:'#666680', letterSpacing:4, margin:'0 0 20px',
                  animation:'fadeUp 0.4s ease forwards'
                }}>
                  {LOGO_SUB}
                </p>

                {/* Feature grid */}
                <div style={{
                  display:'grid', gridTemplateColumns:'repeat(4,1fr)',
                  gap:8, maxWidth:600, margin:'0 auto',
                  animation:'fadeUp 0.5s ease 0.1s both'
                }}>
                  {[
                    { icon:'🌾', label:'CROP AI',     color:'#FF6600' },
                    { icon:'🔬', label:'BIODETECT',   color:'#FF0033' },
                    { icon:'🌤️', label:'WEATHER',     color:'#00FFFF' },
                    { icon:'📊', label:'MARKET',      color:'#FFD700' },
                  ].map(f => (
                    <div key={f.label} style={{
                      border:`1px solid ${f.color}33`,
                      background:`${f.color}11`,
                      borderRadius:2, padding:'8px 4px',
                      textAlign:'center'
                    }}>
                      <div style={{ fontSize:16, marginBottom:4 }}>{f.icon}</div>
                      <p style={{
                        fontFamily:"'Courier New'", fontSize:8,
                        color:f.color, letterSpacing:2, margin:0
                      }}>
                        {f.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Enter prompt */}
                <p style={{
                  fontFamily:"'Courier New'", fontSize:10,
                  color:'#FF660066', letterSpacing:3,
                  margin:'20px 0 0',
                  animation:'blink 1.2s infinite'
                }}>
                  ▶ PRESS ANY KEY TO ENTER SYSTEM
                </p>
              </>
            )}
          </div>
        )}

        {/* Progress bar */}
        <div style={{
          position:'absolute', bottom:0, left:0, right:0, height:3,
          background:'#FF660011'
        }}>
          <div style={{
            height:'100%', background:'#FF6600',
            boxShadow:'0 0 8px #FF6600',
            animation:'progressFill 9.5s linear forwards'
          }} />
        </div>

        {/* Skip */}
        {showSkip && (
          <button onClick={handleComplete} style={{
            position:'absolute', top:20, right:20,
            background:'transparent', border:'1px solid #FF660044',
            color:'#FF660066', fontFamily:"'Courier New'",
            fontSize:10, letterSpacing:3, padding:'6px 14px',
            cursor:'pointer', borderRadius:2, transition:'all 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#FF6600'; e.currentTarget.style.color='#FF6600' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#FF660044'; e.currentTarget.style.color='#FF660066' }}>
            SKIP ►
          </button>
        )}
      </div>

      {/* White flash overlay */}
      <div ref={flashRef} style={{
        position:'absolute', inset:0,
        background:'white', opacity:0,
        pointerEvents:'none', zIndex:10
      }} />

      {/* AT-Field Crack */}
      {showCrack && !crackDone && (
        <ATFieldCrack onShatterComplete={handleShatterComplete} />
      )}

      {/* Burst Particles */}
      {showCrack && (
        <div style={{
          position:'fixed', inset:0, zIndex:10001,
          pointerEvents:'none', overflow:'hidden'
        }}>
          {Array.from({length:20}).map((_, i) => (
            <div key={i} style={{
              position:'absolute',
              top:'50%', left:'50%',
              width: 4 + Math.random() * 6,
              height: 4 + Math.random() * 6,
              background:'#FF6600',
              borderRadius:'50%',
              boxShadow:'0 0 8px #FF6600',
              animation:`burst${i} 1s ease-out forwards`,
              '--tx': `${(Math.random()-0.5)*200}vw`,
              '--ty': `${(Math.random()-0.5)*200}vh`,
            }} />
          ))}
          <style>{`
            ${Array.from({length:20}).map((_, i) => `
              @keyframes burst${i} {
                0%  { transform:translate(-50%,-50%) scale(1); opacity:1 }
                100%{ transform:translate(
                        calc(-50% + ${(Math.random()-0.5)*100}vw),
                        calc(-50% + ${(Math.random()-0.5)*100}vh)
                      ) scale(0); opacity:0 }
              }
            `).join('')}
          `}</style>
        </div>
      )}

      <style>{`
        @keyframes countPulse {
          0%,100%{ transform:scale(1) }
          50%    { transform:scale(1.05) }
        }
        @keyframes glitchText {
          0%  { transform:translateX(3px);  color:#FF6600 }
          25% { transform:translateX(-3px); color:#FF0033 }
          50% { transform:translateX(2px);  color:#FF6600 }
          75% { transform:translateX(-2px); color:#FFD700 }
          100%{ transform:translateX(0);    color:#FF6600 }
        }
        @keyframes borderFlash {
          0%,100%{ opacity:1 }
          50%    { opacity:0.5 }
        }
        @keyframes blink {
          0%,100%{ opacity:1 }
          50%    { opacity:0 }
        }
        @keyframes fadeUp {
          from{ opacity:0; transform:translateY(10px) }
          to  { opacity:1; transform:translateY(0) }
        }
        @keyframes lineExpand {
          from{ transform:scaleX(0) }
          to  { transform:scaleX(1) }
        }
        @keyframes progressFill {
          from{ width:0% }
          to  { width:100% }
        }
      `}</style>
    </div>
  )
}
