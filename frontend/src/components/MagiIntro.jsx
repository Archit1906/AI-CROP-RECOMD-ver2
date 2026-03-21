import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'

const MAGI_SYSTEMS = [
  { name: 'MAGI-01', subtitle: 'MELCHIOR', color: '#FF6600', status: 'CROP ANALYSIS SYSTEM' },
  { name: 'MAGI-02', subtitle: 'BALTHASAR', color: '#00FFFF', status: 'THREAT DETECTION SYSTEM' },
  { name: 'MAGI-03', subtitle: 'CASPAR',    color: '#FF0033', status: 'WEATHER INTEL SYSTEM'   },
]

const BOOT_LOGS = [
  '> INITIALIZING MAGI AGRICULTURAL SYSTEM...',
  '> LOADING NEURAL NETWORK CORES...',
  '> CONNECTING TO NERV AGRI DIVISION...',
  '> CALIBRATING SOIL SENSOR ARRAY...',
  '> ESTABLISHING SATELLITE UPLINK...',
  '> CROSS-REFERENCING PATHOGEN DATABASE...',
  '> LOADING MARKET INTELLIGENCE MODULE...',
  '> MULTILINGUAL PROTOCOL: TAMIL // HINDI // ENGLISH',
  '> MAGI CONSENSUS ACHIEVED...',
  '> ALL SYSTEMS NOMINAL.',
  '> AMRITKRISHI 2.0 ONLINE.',
]

export default function MagiIntro({ onComplete }) {
  const canvasRef   = useRef(null)
  const overlayRef  = useRef(null)
  const [logs,      setLogs]      = useState([])
  const [magiState, setMagiState] = useState([false, false, false])
  const [showLogo,  setShowLogo]  = useState(false)
  const [showSkip,  setShowSkip]  = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [phase,     setPhase]     = useState('booting')
  const doneRef     = useRef(false)

  const handleComplete = () => {
    if (doneRef.current) return
    doneRef.current = true
    gsap.to(overlayRef.current, {
      opacity: 0, duration: 0.8, ease: 'power2.in',
      onComplete: onComplete
    })
  }

  useEffect(() => {
    // Show skip button after 1s
    const skipTimer = setTimeout(() => setShowSkip(true), 1000)

    // THREE.JS SETUP
    const canvas = canvasRef.current
    const W = canvas.clientWidth  || window.innerWidth
    const H = canvas.clientHeight || window.innerHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100)
    camera.position.set(0, 0, 5)

    // Hexagon geometry helper
    const makeHex = (radius, color) => {
      const shape = new THREE.Shape()
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6
        const x = radius * Math.cos(angle)
        const y = radius * Math.sin(angle)
        i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)
      }
      shape.closePath()

      // Outer hex (wireframe ring)
      const points   = shape.getPoints(6)
      const geomLine = new THREE.BufferGeometry().setFromPoints(
        [...points, points[0]]
      )
      const matLine   = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 })
      const hexLine   = new THREE.Line(geomLine, matLine)

      // Inner fill plane
      const geomFill  = new THREE.ShapeGeometry(shape)
      const matFill   = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0, side: THREE.DoubleSide
      })
      const hexFill   = new THREE.Mesh(geomFill, matFill)

      return { hexLine, hexFill, matLine, matFill }
    }

    // Create 3 hexagons
    const hexagons = MAGI_SYSTEMS.map((sys, i) => {
      const hex = makeHex(0.9, sys.color)
      const xPos = (i - 1) * 2.4
      hex.hexLine.position.set(xPos, 0, 0)
      hex.hexFill.position.set(xPos, 0, -0.1)
      hex.hexLine.rotation.z = Math.PI / 6
      hex.hexFill.rotation.z = Math.PI / 6
      hex.hexLine.scale.set(0, 0, 0)
      hex.hexFill.scale.set(0, 0, 0)
      scene.add(hex.hexLine)
      scene.add(hex.hexFill)
      return hex
    })

    // Particle field background
    const particleCount = 800
    const positions     = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2
    }
    const pGeo  = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const pMat  = new THREE.PointsMaterial({ color: '#FF6600', size: 0.02, transparent: true, opacity: 0.4 })
    const particles = new THREE.Points(pGeo, pMat)
    scene.add(particles)

    // Grid plane
    const gridHelper = new THREE.GridHelper(20, 30, '#FF660022', '#FF660011')
    gridHelper.position.y = -2
    gridHelper.material.transparent = true
    gridHelper.material.opacity     = 0
    scene.add(gridHelper)

    // Animation loop
    let frameId
    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Rotate hexagons slowly
      hexagons.forEach((hex, i) => {
        hex.hexLine.rotation.z = Math.PI / 6 + t * 0.3 * (i % 2 === 0 ? 1 : -1)
        hex.hexFill.rotation.z = Math.PI / 6 + t * 0.3 * (i % 2 === 0 ? 1 : -1)
      })

      // Drift particles
      particles.rotation.y = t * 0.02
      particles.rotation.x = t * 0.01

      // Pulse grid
      gridHelper.material.opacity = 0.3 + Math.sin(t * 2) * 0.1

      renderer.render(scene, camera)
    }
    animate()

    // BOOT SEQUENCE TIMELINE
    const tl = gsap.timeline()

    // Fade in grid
    tl.to(gridHelper.material, { opacity: 0.4, duration: 0.8 }, 0.3)

    // Boot each hexagon one by one
    MAGI_SYSTEMS.forEach((sys, i) => {
      const delay  = 0.5 + i * 1.2
      const hex    = hexagons[i]

      // Scale in
      tl.to(hex.hexLine.scale, {
        x: 1, y: 1, z: 1, duration: 0.6,
        ease: 'back.out(1.7)'
      }, delay)
      tl.to(hex.hexFill.scale, {
        x: 1, y: 1, z: 1, duration: 0.6,
        ease: 'back.out(1.7)'
      }, delay)

      // Fade in line
      tl.to(hex.matLine, { opacity: 1, duration: 0.4 }, delay)

      // Pulse fill opacity
      tl.to(hex.matFill, { opacity: 0.12, duration: 0.4 }, delay + 0.2)

      // Update React state — mark this MAGI as online
      tl.call(() => {
        setMagiState(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
        setProgress((i + 1) / 3 * 60)
      }, null, delay + 0.5)
    })

    // Camera pull back
    tl.to(camera.position, { z: 7, duration: 1.5, ease: 'power2.inOut' }, 3.5)

    // Boot logs phase
    tl.call(() => setPhase('logging'), null, 4.2)

    BOOT_LOGS.forEach((log, i) => {
      tl.call(() => {
        setLogs(prev => [...prev, log])
        setProgress(60 + (i / BOOT_LOGS.length) * 35)
      }, null, 4.5 + i * 0.22)
    })

    // Show logo
    tl.call(() => {
      setShowLogo(true)
      setProgress(100)
      setPhase('complete')
    }, null, 4.5 + BOOT_LOGS.length * 0.22 + 0.3)

    // Camera zoom forward on complete
    tl.to(camera.position, { z: 4, duration: 1, ease: 'power2.in' },
      4.5 + BOOT_LOGS.length * 0.22 + 0.3)

    // Auto complete after logo shows
    tl.call(() => handleComplete(), null,
      4.5 + BOOT_LOGS.length * 0.22 + 2.5)

    // Resize handler
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      clearTimeout(skipTimer)
      cancelAnimationFrame(frameId)
      renderer.dispose()
      window.removeEventListener('resize', onResize)
      tl.kill()
    }
  }, [])

  return (
    <div ref={overlayRef} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#0A0A0F', overflow: 'hidden'
    }}>
      {/* Three.js canvas */}
      <canvas ref={canvasRef} style={{ position:'absolute', inset:0,
                                        width:'100%', height:'100%' }} />

      {/* Scanline overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)'
      }} />

      {/* MAGI status panels */}
      <div style={{
        position: 'absolute', top: '12%', left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 32,
        pointerEvents: 'none'
      }}>
        {MAGI_SYSTEMS.map((sys, i) => (
          <div key={i} style={{
            textAlign: 'center', opacity: magiState[i] ? 1 : 0.15,
            transition: 'opacity 0.5s', width: 140
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: magiState[i] ? sys.color : '#333',
              boxShadow: magiState[i] ? `0 0 12px ${sys.color}` : 'none',
              margin: '0 auto 6px',
              animation: magiState[i] ? 'pulse 1.5s infinite' : 'none'
            }} />
            <p style={{ fontFamily:"'Courier New'", fontSize:11,
                         color: sys.color, fontWeight:700,
                         letterSpacing:3, margin:'0 0 2px' }}>
              {sys.name}
            </p>
            <p style={{ fontFamily:"'Courier New'", fontSize:8,
                         color:'#666680', letterSpacing:2, margin:'0 0 4px' }}>
              {sys.subtitle}
            </p>
            <p style={{ fontFamily:"'Courier New'", fontSize:8,
                         color: magiState[i] ? '#00FF41' : '#333',
                         letterSpacing:1, margin:0 }}>
              {magiState[i] ? '● ONLINE' : '○ OFFLINE'}
            </p>
            <p style={{ fontFamily:"'Courier New'", fontSize:7,
                         color:'#444', letterSpacing:1, margin:'4px 0 0' }}>
              {sys.status}
            </p>
          </div>
        ))}
      </div>

      {/* Terminal boot logs */}
      <div style={{
        position: 'absolute', bottom: 180, left: '50%',
        transform: 'translateX(-50%)',
        width: '60%', maxHeight: 160,
        overflow: 'hidden', pointerEvents: 'none'
      }}>
        {logs.map((log, i) => (
          <p key={i} style={{
            fontFamily: "'Courier New'", fontSize: 11,
            color: i === logs.length - 1 ? '#00FF41' : '#FF660066',
            letterSpacing: 1, margin: '2px 0',
            animation: i === logs.length - 1 ? 'flicker 0.3s' : 'none'
          }}>
            {log}
          </p>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 140, left: '50%',
        transform: 'translateX(-50%)', width: '60%'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
          <span style={{ fontFamily:"'Courier New'", fontSize:9,
                          color:'#FF660066', letterSpacing:2 }}>
            // SYSTEM INITIALIZATION
          </span>
          <span style={{ fontFamily:"'Courier New'", fontSize:9,
                          color:'#FF6600', letterSpacing:2 }}>
            {Math.round(progress)}%
          </span>
        </div>
        <div style={{ height:3, background:'#FF660011', borderRadius:1 }}>
          <div style={{
            height:'100%', borderRadius:1,
            width:`${progress}%`,
            background:'linear-gradient(90deg, #FF660044, #FF6600)',
            boxShadow:'0 0 8px #FF660088',
            transition:'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* AMRITKRISHI Logo — shows at end */}
      {showLogo && (
        <div style={{
          position:'absolute', bottom:60, left:0, right:0,
          textAlign:'center',
          animation:'logoIn 0.8s ease forwards'
        }}>
          <p className="logo-glitch-in" style={{
            fontFamily:"'Courier New'", fontSize:32, fontWeight:900,
            color:'#FF6600', letterSpacing:12, margin:'0 0 4px',
            textShadow:'0 0 30px #FF660088, 0 0 60px #FF660044'
          }}>
            AMRITKRISHI
          </p>
          <p style={{ fontFamily:"'Courier New'", fontSize:11,
                       color:'#666680', letterSpacing:6, margin:0 }}>
            MAGI AGRICULTURAL INTELLIGENCE SYSTEM v2.0
          </p>
        </div>
      )}

      {/* Skip button */}
      {showSkip && (
        <button onClick={handleComplete} style={{
          position:'absolute', top:20, right:20,
          background:'transparent', border:'1px solid #FF660044',
          color:'#FF660066', fontFamily:"'Courier New'",
          fontSize:10, letterSpacing:3, padding:'6px 14px',
          cursor:'pointer', borderRadius:2,
          transition:'all 0.2s'
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor='#FF6600'; e.currentTarget.style.color='#FF6600' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor='#FF660044'; e.currentTarget.style.color='#FF660066' }}>
          SKIP ►
        </button>
      )}

      {/* CSS keyframes */}
      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1}
          50%{opacity:0.4}
        }
        @keyframes flicker {
          0%{opacity:0}25%{opacity:1}50%{opacity:0.5}75%{opacity:1}100%{opacity:1}
        }
        @keyframes logoIn {
          from{opacity:0;transform:translateY(20px)}
          to{opacity:1;transform:translateY(0)}
        }
      `}</style>
    </div>
  )
}
