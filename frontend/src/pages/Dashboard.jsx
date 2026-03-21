import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AnimatedBackground from '../components/AnimatedBackground'

// ── TYPED TEXT HOOK ──────────────────────────────────────────
function useTyped(text, speed = 40, startDelay = 0) {
  const [displayed, setDisplayed] = useState('')
  const [done,      setDone]      = useState(false)

  useEffect(() => {
    let i = 0
    setDisplayed('')
    setDone(false)
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1))
        i++
        if (i >= text.length) { clearInterval(interval); setDone(true) }
      }, speed)
      return () => clearInterval(interval)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [text, speed, startDelay])

  return { displayed, done }
}

// ── COUNTER HOOK ─────────────────────────────────────────────
function useCounter(target, duration = 2000, startCounting = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!startCounting) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, startCounting])
  return count
}

// ── SECTION WRAPPER ──────────────────────────────────────────
function Section({ children, id, style = {} }) {
  return (
    <section id={id} style={{
      minHeight: '100vh', position: 'relative',
      overflow: 'hidden', ...style
    }}>
      {children}
    </section>
  )
}

// ── SCAN LINE ────────────────────────────────────────────────
function ScanLine() {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: '2px', background: 'rgba(255,102,0,0.15)',
      zIndex: 9998, pointerEvents: 'none',
      animation: 'scanPage 4s linear infinite'
    }} />
  )
}

// ── HEX GRID BACKGROUND ──────────────────────────────────────
function HexBg({ opacity = 0.04 }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='48'%3E%3Cpath d='M28 4 L52 16 L52 40 L28 52 L4 40 L4 16Z' fill='none' stroke='%23FF6600' stroke-width='0.5' opacity='0.3'/%3E%3C/svg%3E")`,
      opacity
    }} />
  )
}

// ── GLITCH TEXT ──────────────────────────────────────────────
function GlitchText({ children, size = 48, color = '#FF6600' }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{
        position: 'absolute', top: 0, left: 0,
        fontFamily: "'Orbitron', sans-serif",
        fontSize: size, fontWeight: 900,
        color: '#FF0033', letterSpacing: 6,
        transform: 'translateX(-3px)',
        opacity: 0.5, pointerEvents: 'none'
      }}>{children}</span>
      <span style={{
        position: 'absolute', top: 0, left: 0,
        fontFamily: "'Orbitron', sans-serif",
        fontSize: size, fontWeight: 900,
        color: '#00FFFF', letterSpacing: 6,
        transform: 'translateX(3px)',
        opacity: 0.5, pointerEvents: 'none'
      }}>{children}</span>
      <span style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: size, fontWeight: 900,
        color, letterSpacing: 6,
        textShadow: `0 0 40px ${color}88, 0 0 80px ${color}44`,
        position: 'relative', zIndex: 1,
        animation: 'glitchPulse 4s ease infinite'
      }}>{children}</span>
    </div>
  )
}

// ── NAV DOT ──────────────────────────────────────────────────
function NavDots({ active }) {
  const sections = ['hero','mission','features','stats','tech','demo','enter']
  return (
    <div style={{
      position: 'fixed', right: 24, top: '50%',
      transform: 'translateY(-50%)', zIndex: 100,
      display: 'flex', flexDirection: 'column', gap: 10
    }}>
      {sections.map((s, i) => (
        <a key={s} href={`#${s}`} style={{ textDecoration: 'none' }}>
          <div style={{
            width: active === i ? 10 : 6,
            height: active === i ? 10 : 6,
            borderRadius: '50%',
            background: active === i ? '#FF6600' : '#FF660033',
            border: `1px solid ${active === i ? '#FF6600' : '#FF660022'}`,
            boxShadow: active === i ? '0 0 8px #FF6600' : 'none',
            transition: 'all 0.3s', cursor: 'pointer'
          }} />
        </a>
      ))}
    </div>
  )
}

// ── MAIN COMPONENT ───────────────────────────────────────────
export default function Dashboard() {
  const navigate   = useNavigate()
  const [activeNav, setActiveNav] = useState(0)
  const { scrollY } = useScroll()

  // Parallax transforms
  const heroY    = useTransform(scrollY, [0, 600],    [0, -200])
  const heroOp   = useTransform(scrollY, [0, 500],    [1, 0])
  const missionY = useTransform(scrollY, [400, 1000], [100, -100])

  // Track active section
  useEffect(() => {
    const handleScroll = () => {
      const positions = ['hero','mission','features','stats','tech','demo','enter']
        .map(id => {
          const el = document.getElementById(id)
          return el ? el.getBoundingClientRect().top : Infinity
        })
      const active = positions.findIndex((top, i) =>
        top <= window.innerHeight / 2 &&
        (positions[i + 1] === undefined || positions[i + 1] > window.innerHeight / 2)
      )
      if (active >= 0) setActiveNav(active)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ background: '#0A0A0F', overflowX: 'hidden' }}>
      {/* ADD THIS — sits behind everything */}
      <AnimatedBackground />

      {/* ADD this wrapper around ALL your sections */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScanLine />
        <NavDots active={activeNav} />

        {/* ── SECTION 1: HERO ──────────────────────────────── */}
        <Section id="hero" style={{ background: 'transparent' }}>
        <HexBg opacity={0.06} />

        {/* Parallax container */}
        <motion.div style={{ y: heroY, opacity: heroOp }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}>

          {/* Top bar */}
          <div style={{
            padding: '20px 40px',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #FF660022'
          }}>
            <span style={{ fontFamily:"'Courier New'", fontSize: 9,
                            color: '#FF660066', letterSpacing: 4 }}>
              // NERV AGRICULTURAL DIVISION // CLASSIFIED
            </span>
            <span style={{ fontFamily:"'Courier New'", fontSize: 9,
                            color: '#FF660066', letterSpacing: 4 }}>
              MAGI SYSTEM v2.0 // ONLINE
            </span>
          </div>

          {/* Hero content */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            minHeight: 'calc(100vh - 60px)', padding: '60px 40px',
            textAlign: 'center'
          }}>

            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ fontFamily:"'Courier New'", fontSize: 11,
                       color: '#FF660088', letterSpacing: 6,
                       margin: '0 0 24px', textTransform: 'uppercase' }}>
              // MAGI AGRICULTURAL INTELLIGENCE SYSTEM
            </motion.p>

            {/* Main title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}>
              <GlitchText size={72}>AMRITKRISHI</GlitchText>
            </motion.div>

            {/* Subtitle typed */}
            <HeroSubtitle />

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              style={{ display: 'flex', gap: 16, marginTop: 40 }}>
              <button onClick={() => navigate('/crop')}
                style={{
                  padding: '14px 32px',
                  background: '#FF660022',
                  border: '1px solid #FF6600',
                  borderRadius: 2, color: '#FF6600',
                  fontFamily: "'Orbitron'", fontSize: 11,
                  letterSpacing: 3, cursor: 'pointer',
                  boxShadow: '0 0 20px #FF660033',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FF660044'}
                onMouseLeave={e => e.currentTarget.style.background = '#FF660022'}>
                ENTER SYSTEM ►
              </button>
              <a href="#mission" style={{ textDecoration: 'none' }}>
                <button style={{
                  padding: '14px 32px',
                  background: 'transparent',
                  border: '1px solid #FF660044',
                  borderRadius: 2, color: '#FF660088',
                  fontFamily: "'Orbitron'", fontSize: 11,
                  letterSpacing: 3, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='#FF6600'; e.currentTarget.style.color='#FF6600' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='#FF660044'; e.currentTarget.style.color='#FF660088' }}>
                  LEARN MORE ↓
                </button>
              </a>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ marginTop: 60, color: '#FF660044',
                       fontFamily: "'Courier New'", fontSize: 11 }}>
              ↓ SCROLL TO EXPLORE ↓
            </motion.div>
          </div>
        </motion.div>

        {/* Floating particles */}
        <HeroParticles />
      </Section>

      {/* ── SECTION 2: MISSION ───────────────────────────── */}
      <Section id="mission" style={{ background: 'rgba(13,13,26,0.7)' }}>
        <HexBg opacity={0.04} />
        <motion.div style={{ y: missionY }}
          style={{
            maxWidth: 900, margin: '0 auto',
            padding: '120px 40px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center'
          }}>

          <MissionSection />
        </motion.div>
      </Section>

      {/* ── SECTION 3: FEATURES ──────────────────────────── */}
      <Section id="features" style={{ background: 'rgba(10,10,15,0.6)', padding: '80px 0' }}>
        <HexBg opacity={0.05} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>
          <FeaturesSection navigate={navigate} />
        </div>
      </Section>

      {/* ── SECTION 4: STATS ─────────────────────────────── */}
      <Section id="stats"
        style={{ background: 'rgba(13,13,26,0.75)', minHeight: '60vh' }}>
        <HexBg opacity={0.06} />
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 40px' }}>
          <StatsSection />
        </div>
      </Section>

      {/* ── SECTION 5: TECH STACK ────────────────────────── */}
      <Section id="tech"
        style={{ background: 'rgba(10,10,15,0.65)', minHeight: '70vh' }}>
        <HexBg opacity={0.04} />
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 40px' }}>
          <TechSection />
        </div>
      </Section>

      {/* ── SECTION 6: DEMO ──────────────────────────────── */}
      <Section id="demo"
        style={{ background: 'rgba(13,13,26,0.7)', minHeight: '80vh' }}>
        <HexBg opacity={0.05} />
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '100px 40px' }}>
          <DemoSection />
        </div>
      </Section>

      {/* ── SECTION 7: ENTER ─────────────────────────────── */}
      <Section id="enter"
        style={{ background: 'transparent', minHeight: '80vh' }}>
        <HexBg opacity={0.08} />
        <EnterSection navigate={navigate} />
      </Section>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
        @keyframes scanPage {
          0%  { transform: translateY(-10px) }
          100%{ transform: translateY(100vh)  }
        }
        @keyframes glitchPulse {
          0%,90%,100%{ text-shadow:0 0 40px #FF660088,0 0 80px #FF660044 }
          92%{ text-shadow:4px 0 #FF0033,-4px 0 #00FFFF,0 0 40px #FF660088 }
          94%{ text-shadow:-4px 0 #FF0033,4px 0 #00FFFF,0 0 40px #FF660088 }
          96%{ text-shadow:0 0 40px #FF660088,0 0 80px #FF660044 }
        }
        @keyframes float {
          0%,100%{ transform:translateY(0) }
          50%    { transform:translateY(-20px) }
        }
        @keyframes particleDrift {
          0%  { transform:translateY(100vh) translateX(0)   opacity:0 }
          10% { opacity:1 }
          90% { opacity:1 }
          100%{ transform:translateY(-100px) translateX(40px) opacity:0 }
        }
        @keyframes countUp {
          from{ opacity:0; transform:translateY(20px) }
          to  { opacity:1; transform:translateY(0) }
        }
        html { scroll-behavior: smooth }
      `}</style>
    </div>
  )
}

// ── HERO SUBTITLE ────────────────────────────────────────────
function HeroSubtitle() {
  const lines = [
    "AI-powered crop intelligence for Indian farmers",
    "Real-time disease detection from leaf images",
    "Live market prices from 500+ mandi locations",
    "Available in Tamil | Hindi | English"
  ]
  const [lineIndex, setLineIndex] = useState(0)
  const { displayed, done } = useTyped(lines[lineIndex], 35, 800)

  useEffect(() => {
    if (done) {
      const t = setTimeout(() => {
        setLineIndex(i => (i + 1) % lines.length)
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [done])

  return (
    <div style={{ height: 32, marginTop: 20 }}>
      <p style={{
        fontFamily: "'Courier New'", fontSize: 16,
        color: '#00FFFF', letterSpacing: 2,
        margin: 0
      }}>
        {displayed}
        <span style={{ animation: 'glitchPulse 0.8s infinite',
                        color: '#FF6600' }}>█</span>
      </p>
    </div>
  )
}

// ── HERO PARTICLES ───────────────────────────────────────────
function HeroParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left:     `${5 + Math.random() * 90}%`,
    size:     2 + Math.random() * 4,
    duration: 8 + Math.random() * 12,
    delay:    Math.random() * 8,
    opacity:  0.2 + Math.random() * 0.4
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                  overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', bottom: -10,
          left: p.left,
          width: p.size, height: p.size,
          background: p.id % 3 === 0 ? '#FF6600' :
                      p.id % 3 === 1 ? '#00FFFF' : '#FF0033',
          borderRadius: '50%',
          animation: `particleDrift ${p.duration}s ${p.delay}s linear infinite`,
          opacity: p.opacity
        }} />
      ))}
    </div>
  )
}

// ── MISSION SECTION ──────────────────────────────────────────
function MissionSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const { displayed } = useTyped(
    '> 140 MILLION INDIAN FARMERS. MOST WITHOUT ACCESS TO MODERN AGRICULTURAL INTELLIGENCE. AMRITKRISHI CHANGES THAT.',
    20, inView ? 0 : 99999
  )

  return (
    <div ref={ref}>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        style={{ fontFamily:"'Courier New'", fontSize: 9,
                 color: '#FF660066', letterSpacing: 4,
                 margin: '0 0 20px' }}>
        // MISSION DIRECTIVE
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}>
        <h2 style={{ fontFamily: "'Orbitron'", fontSize: 36,
                     fontWeight: 900, color: '#FF6600',
                     letterSpacing: 4, margin: '0 0 40px',
                     textShadow: '0 0 30px #FF660066' }}>
          THE PROBLEM
        </h2>
      </motion.div>

      {/* Terminal text */}
      <div style={{
        background: '#0A0A0F', border: '1px solid #FF660033',
        borderRadius: 4, padding: '24px 28px', marginBottom: 40,
        textAlign: 'left'
      }}>
        <p style={{ fontFamily:"'Courier New'", fontSize: 14,
                     color: '#00FF41', lineHeight: 1.8,
                     margin: 0, letterSpacing: 1 }}>
          {displayed}
          <span style={{ animation:'glitchPulse 0.8s infinite',
                          color:'#FF6600' }}>█</span>
        </p>
      </div>

      {/* Problem stats */}
      <div style={{ display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { stat: '20-40%',  label: 'Crop yield lost to disease annually',    color: '#FF0033' },
          { stat: '₹2L Cr',  label: 'Govt schemes unclaimed every year',      color: '#FFD700' },
          { stat: '70%',     label: 'Farmers exploited by price middlemen',   color: '#FF6600' },
        ].map((item, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 + i * 0.15 }}
            style={{
              background: 'rgba(13,13,26,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${item.color}33`,
              borderTop: `2px solid ${item.color}`,
              borderRadius: 2, padding: 20, textAlign: 'center'
            }}>
            <p style={{ fontFamily:"'Orbitron'", fontSize: 28,
                         fontWeight: 900, color: item.color,
                         margin: '0 0 8px',
                         textShadow: `0 0 15px ${item.color}66` }}>
              {item.stat}
            </p>
            <p style={{ fontFamily:"'Courier New'", fontSize: 10,
                         color: '#9CA3AF', margin: 0,
                         letterSpacing: 1, lineHeight: 1.5 }}>
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── FEATURES SECTION ─────────────────────────────────────────
function FeaturesSection({ navigate }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  const FEATURES = [
    {
      id: 'crop', icon: '🌾', color: '#FF6600',
      title: 'CROP INTELLIGENCE',
      subtitle: 'AI-powered recommendation',
      desc: 'Select any Indian state and district. Our Random Forest model analyzes real-time soil + weather data and recommends the highest-yield crop with confidence score.',
      stats: ['22 crop types', '93% accuracy', 'All 28 states'],
      path: '/crop'
    },
    {
      id: 'disease', icon: '🔬', color: '#FF0033',
      title: 'BIOLOGICAL THREAT SCAN',
      subtitle: 'CNN disease detection',
      desc: 'Upload a leaf photo. Our MobileNetV2 neural network scans for 38 disease classes across 12 plant species and delivers diagnosis with treatment protocol.',
      stats: ['38 disease classes', '85%+ accuracy', 'Real-time scan'],
      path: '/disease'
    },
    {
      id: 'weather', icon: '🌤️', color: '#00FFFF',
      title: 'ATMOSPHERIC INTELLIGENCE',
      subtitle: 'Live weather + farming alerts',
      desc: 'Real-time weather for every Indian city via OpenWeatherMap. Farming-specific alerts for drought, frost, fungal risk, and optimal sowing windows.',
      stats: ['Live data', '7-day forecast', 'Farming alerts'],
      path: '/weather'
    },
    {
      id: 'market', icon: '📊', color: '#FFD700',
      title: 'MARKET INTEL',
      subtitle: 'Live mandi prices',
      desc: 'Real-time crop prices from Agmarknet across all Indian states. Price trend analytics, best-time-to-sell recommendations, and AI price prediction.',
      stats: ['500+ mandis', 'Live prices', 'Price prediction'],
      path: '/market'
    },
    {
      id: 'chat', icon: '🤖', color: '#8B5CF6',
      title: 'MAGI QUERY INTERFACE',
      subtitle: 'Multilingual AI chatbot',
      desc: 'Powered by Google Gemini. Ask anything about farming in Tamil, Hindi, or English. Context-aware responses tailored to Indian agriculture.',
      stats: ['3 languages', 'Gemini AI', '24/7 available'],
      path: '/chat'
    },
    {
      id: 'schemes', icon: '🏛️', color: '#00FF41',
      title: 'FEDERAL DIRECTIVES',
      subtitle: 'Government scheme finder',
      desc: '15+ government schemes including PM-KISAN, PMFBY, and state-specific programs. Eligibility checker, deadline countdown, and direct application links.',
      stats: ['15+ schemes', 'Eligibility check', 'Direct apply'],
      path: '/schemes'
    },
  ]

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ fontFamily:"'Courier New'", fontSize: 9,
                     color: '#FF660066', letterSpacing: 4,
                     margin: '0 0 12px' }}>
          // SYSTEM CAPABILITIES
        </p>
        <h2 style={{ fontFamily: "'Orbitron'", fontSize: 36,
                     fontWeight: 900, color: '#FF6600',
                     letterSpacing: 4, margin: 0,
                     textShadow: '0 0 30px #FF660066' }}>
          FEATURES
        </h2>
      </motion.div>

      <div style={{ display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {FEATURES.map((feat, i) => (
          <motion.div key={feat.id}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(feat.path)}
            style={{
              background: 'rgba(13,13,26,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${feat.color}22`,
              borderTop: `2px solid ${feat.color}`,
              borderRadius: 4, padding: 24,
              cursor: 'pointer', transition: 'all 0.2s',
              position: 'relative', overflow: 'hidden'
            }}
            whileHover={{
              borderColor: feat.color,
              boxShadow: `0 0 30px ${feat.color}22`,
              y: -4
            }}>

            {/* Background glow */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 60,
              background: `linear-gradient(180deg, ${feat.color}08, transparent)`,
              pointerEvents: 'none'
            }} />

            <div style={{ fontSize: 36, marginBottom: 12 }}>{feat.icon}</div>

            <p style={{ fontFamily:"'Courier New'", fontSize: 8,
                         color: `${feat.color}88`, letterSpacing: 3,
                         margin: '0 0 4px' }}>
              // {feat.subtitle.toUpperCase()}
            </p>
            <h3 style={{ fontFamily:"'Orbitron'", fontSize: 14,
                          fontWeight: 700, color: feat.color,
                          margin: '0 0 12px', letterSpacing: 2 }}>
              {feat.title}
            </h3>
            <p style={{ fontFamily:"'Courier New'", fontSize: 11,
                         color: '#9CA3AF', margin: '0 0 16px',
                         lineHeight: 1.7, letterSpacing: 0.5 }}>
              {feat.desc}
            </p>

            {/* Stat pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {feat.stats.map(stat => (
                <span key={stat} style={{
                  fontFamily:"'Courier New'", fontSize: 9,
                  color: feat.color, letterSpacing: 1,
                  background: `${feat.color}11`,
                  border: `1px solid ${feat.color}33`,
                  padding: '3px 8px', borderRadius: 1
                }}>
                  {stat}
                </span>
              ))}
            </div>

            {/* Arrow */}
            <div style={{
              position: 'absolute', bottom: 16, right: 16,
              color: `${feat.color}44`,
              fontFamily:"'Courier New'", fontSize: 16
            }}>
              ►
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── STATS SECTION ────────────────────────────────────────────
function StatsSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const STATS = [
    { value: 140,    suffix: 'M+', label: 'Indian Farmers', color: '#FF6600',   desc: 'potential users across India' },
    { value: 93,     suffix: '%',  label: 'Crop Accuracy',  color: '#00FF41',   desc: 'on test dataset' },
    { value: 85,     suffix: '%',  label: 'Disease Detect', color: '#FF0033',   desc: 'MobileNetV2 accuracy' },
    { value: 38,     suffix: '',   label: 'Disease Classes', color: '#00FFFF',  desc: 'plant diseases detected' },
    { value: 22,     suffix: '',   label: 'Crop Types',     color: '#FFD700',   desc: 'recommendation supported' },
    { value: 3,      suffix: '',   label: 'Languages',      color: '#8B5CF6',   desc: 'Tamil, Hindi, English' },
    { value: 500,    suffix: '+',  label: 'Mandi Locations',color: '#FF6600',   desc: 'live price coverage' },
    { value: 15,     suffix: '+',  label: 'Govt Schemes',   color: '#00FF41',   desc: 'discoverable schemes' },
  ]

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ fontFamily:"'Courier New'", fontSize: 9,
                     color: '#FF660066', letterSpacing: 4,
                     margin: '0 0 12px' }}>
          // SYSTEM METRICS
        </p>
        <h2 style={{ fontFamily:"'Orbitron'", fontSize: 36,
                     fontWeight: 900, color: '#FF6600',
                     letterSpacing: 4, margin: 0,
                     textShadow: '0 0 30px #FF660066' }}>
          BY THE NUMBERS
        </h2>
      </motion.div>

      <div style={{ display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {STATS.map((stat, i) => {
          const count = useCounter(stat.value, 2000, inView)
          return (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.08 }}
              style={{
                background: 'rgba(13,13,26,0.8)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: `1px solid ${stat.color}22`,
                borderRadius: 4, padding: '20px 16px',
                textAlign: 'center'
              }}>
              <p style={{ fontFamily:"'Orbitron'", fontSize: 32,
                           fontWeight: 900, color: stat.color,
                           margin: '0 0 4px',
                           textShadow: `0 0 15px ${stat.color}66` }}>
                {count}{stat.suffix}
              </p>
              <p style={{ fontFamily:"'Orbitron'", fontSize: 10,
                           color: '#E8E8E8', margin: '0 0 4px',
                           letterSpacing: 2 }}>
                {stat.label}
              </p>
              <p style={{ fontFamily:"'Courier New'", fontSize: 9,
                           color: '#444', margin: 0, letterSpacing: 1 }}>
                {stat.desc}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ── TECH SECTION ─────────────────────────────────────────────
function TechSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const TECHS = [
    { name: 'React + Vite',       role: 'Frontend',       color: '#00FFFF', icon: '⚛️'  },
    { name: 'FastAPI',            role: 'Backend',        color: '#FF6600', icon: '⚡'  },
    { name: 'Random Forest',      role: 'Crop ML Model',  color: '#00FF41', icon: '🌳'  },
    { name: 'MobileNetV2',        role: 'Disease CNN',    color: '#FF0033', icon: '🧠'  },
    { name: 'Google Gemini',      role: 'AI Chatbot',     color: '#8B5CF6', icon: '🤖'  },
    { name: 'OpenWeatherMap',     role: 'Weather API',    color: '#00FFFF', icon: '🌤️'  },
    { name: 'MongoDB Atlas',      role: 'Database',       color: '#00FF41', icon: '🗄️'  },
    { name: 'Framer Motion',      role: 'Animations',     color: '#FFD700', icon: '✨'  },
    { name: 'TensorFlow / Keras', role: 'Deep Learning',  color: '#FF6600', icon: '🔥'  },
    { name: 'Agmarknet API',      role: 'Market Prices',  color: '#FFD700', icon: '📊'  },
    { name: 'Tailwind CSS',       role: 'Styling',        color: '#00FFFF', icon: '🎨'  },
    { name: 'Vercel + Render',    role: 'Deployment',     color: '#E8E8E8', icon: '🚀'  },
  ]

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ fontFamily:"'Courier New'", fontSize: 9,
                     color: '#FF660066', letterSpacing: 4,
                     margin: '0 0 12px' }}>
          // SYSTEM ARCHITECTURE
        </p>
        <h2 style={{ fontFamily:"'Orbitron'", fontSize: 36,
                     fontWeight: 900, color: '#FF6600',
                     letterSpacing: 4, margin: 0,
                     textShadow: '0 0 30px #FF660066' }}>
          TECH STACK
        </h2>
      </motion.div>

      <div style={{ display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {TECHS.map((tech, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.07 }}
            style={{
              background: 'rgba(13,13,26,0.8)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${tech.color}22`,
              borderLeft: `3px solid ${tech.color}`,
              borderRadius: '0 4px 4px 0',
              padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 10
            }}>
            <span style={{ fontSize: 20 }}>{tech.icon}</span>
            <div>
              <p style={{ fontFamily:"'Orbitron'", fontSize: 11,
                           fontWeight: 700, color: tech.color,
                           margin: '0 0 2px', letterSpacing: 1 }}>
                {tech.name}
              </p>
              <p style={{ fontFamily:"'Courier New'", fontSize: 9,
                           color: '#666680', margin: 0, letterSpacing: 1 }}>
                {tech.role}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ── DEMO SECTION ─────────────────────────────────────────────
function DemoSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [step,  setStep]  = useState(0)

  const DEMO_STEPS = [
    { title: 'Select State',    desc: 'Click Tamil Nadu on the interactive India map',               icon: '🗺️', color: '#FF6600' },
    { title: 'Pick District',   desc: 'Choose Chennai from the district grid',                       icon: '📍', color: '#00FFFF' },
    { title: 'AI Analyzes',     desc: 'MAGI fetches live weather + soil data and runs ML model',     icon: '🧠', color: '#8B5CF6' },
    { title: 'Get Result',      desc: 'Rice recommended with 92% confidence + full farming guide',   icon: '🌾', color: '#00FF41' },
    { title: 'Detect Disease',  desc: 'Upload leaf photo → CNN scans 38 diseases in 2 seconds',     icon: '🔬', color: '#FF0033' },
    { title: 'Ask AI in Tamil', desc: 'Type question in Tamil → Gemini responds in Tamil instantly', icon: '💬', color: '#FFD700' },
  ]

  useEffect(() => {
    if (!inView) return
    const t = setInterval(() => setStep(s => (s + 1) % DEMO_STEPS.length), 2500)
    return () => clearInterval(t)
  }, [inView])

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{ fontFamily:"'Courier New'", fontSize: 9,
                     color: '#FF660066', letterSpacing: 4,
                     margin: '0 0 12px' }}>
          // SYSTEM DEMONSTRATION
        </p>
        <h2 style={{ fontFamily:"'Orbitron'", fontSize: 36,
                     fontWeight: 900, color: '#FF6600',
                     letterSpacing: 4, margin: 0,
                     textShadow: '0 0 30px #FF660066' }}>
          HOW IT WORKS
        </h2>
      </motion.div>

      <div style={{ display: 'grid',
                    gridTemplateColumns: '1fr 1fr', gap: 40,
                    alignItems: 'center' }}>

        {/* Step list */}
        <div>
          {DEMO_STEPS.map((s, i) => (
            <motion.div key={i}
              onClick={() => setStep(i)}
              animate={{
                borderColor: i === step ? s.color : `${s.color}22`,
                background:  i === step ? `${s.color}11` : 'transparent'
              }}
              style={{
                display: 'flex', gap: 14, padding: '14px 16px',
                marginBottom: 8, borderRadius: 4,
                border: '1px solid', cursor: 'pointer',
                transition: 'all 0.3s'
              }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</span>
              <div>
                <p style={{ fontFamily:"'Orbitron'", fontSize: 11,
                             fontWeight: 700,
                             color: i === step ? s.color : '#666680',
                             margin: '0 0 3px', letterSpacing: 2,
                             transition: 'color 0.3s' }}>
                  {String(i + 1).padStart(2,'0')} — {s.title}
                </p>
                <p style={{ fontFamily:"'Courier New'", fontSize: 10,
                             color: i === step ? '#9CA3AF' : '#444',
                             margin: 0, letterSpacing: 0.5,
                             transition: 'color 0.3s' }}>
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Active step showcase */}
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'rgba(13,13,26,0.8)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: `1px solid ${DEMO_STEPS[step].color}`,
            borderRadius: 8, padding: 40,
            textAlign: 'center',
            boxShadow: `0 0 40px ${DEMO_STEPS[step].color}22`
          }}>
          <span style={{ fontSize: 64, display: 'block', marginBottom: 20 }}>
            {DEMO_STEPS[step].icon}
          </span>
          <p style={{ fontFamily:"'Courier New'", fontSize: 8,
                       color: `${DEMO_STEPS[step].color}88`,
                       letterSpacing: 3, margin: '0 0 8px' }}>
            // STEP {step + 1} OF {DEMO_STEPS.length}
          </p>
          <p style={{ fontFamily:"'Orbitron'", fontSize: 18,
                       fontWeight: 700,
                       color: DEMO_STEPS[step].color,
                       letterSpacing: 3, margin: '0 0 12px',
                       textShadow: `0 0 15px ${DEMO_STEPS[step].color}66` }}>
            {DEMO_STEPS[step].title.toUpperCase()}
          </p>
          <p style={{ fontFamily:"'Courier New'", fontSize: 12,
                       color: '#9CA3AF', margin: 0, lineHeight: 1.7 }}>
            {DEMO_STEPS[step].desc}
          </p>

          {/* Step dots */}
          <div style={{ display:'flex', justifyContent:'center',
                         gap: 6, marginTop: 24 }}>
            {DEMO_STEPS.map((_, i) => (
              <div key={i}
                onClick={() => setStep(i)}
                style={{
                  width: i === step ? 20 : 6,
                  height: 6, borderRadius: 3,
                  background: i === step
                    ? DEMO_STEPS[step].color
                    : '#FF660022',
                  transition: 'all 0.3s', cursor: 'pointer'
                }} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── ENTER SECTION ────────────────────────────────────────────
function EnterSection({ navigate }) {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const { displayed } = useTyped(
    '> MAGI SYSTEM FULLY OPERATIONAL\n> ALL MODULES ONLINE\n> AWAITING OPERATOR INPUT...',
    25, inView ? 0 : 99999
  )

  const QUICK_LINKS = [
    { label:'CROP ANALYSIS',     icon:'🌾', path:'/crop',     color:'#FF6600' },
    { label:'DISEASE SCAN',      icon:'🔬', path:'/disease',  color:'#FF0033' },
    { label:'WEATHER INTEL',     icon:'🌤️', path:'/weather',  color:'#00FFFF' },
    { label:'MARKET PRICES',     icon:'📊', path:'/market',   color:'#FFD700' },
    { label:'MAGI QUERY',        icon:'🤖', path:'/chat',     color:'#8B5CF6' },
    { label:'FEDERAL DIRECTIVES',icon:'🏛️', path:'/schemes',  color:'#00FF41' },
  ]

  return (
    <div ref={ref} style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', padding: '80px 40px',
      textAlign: 'center'
    }}>
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        style={{ fontFamily:"'Courier New'", fontSize: 9,
                 color: '#FF660066', letterSpacing: 4,
                 margin: '0 0 20px' }}>
        // SYSTEM READY
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.2 }}>
        <GlitchText size={52}>ENTER AMRITKRISHI</GlitchText>
      </motion.div>

      {/* Terminal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.5 }}
        style={{
          background: '#0A0A0F', border: '1px solid #FF660033',
          borderRadius: 4, padding: '20px 28px',
          margin: '32px 0', textAlign: 'left',
          width: '100%', maxWidth: 500
        }}>
        <p style={{ fontFamily:"'Courier New'", fontSize: 13,
                     color: '#00FF41', margin: 0, whiteSpace: 'pre-line',
                     lineHeight: 1.8 }}>
          {displayed}
          <span style={{ animation:'glitchPulse 0.8s infinite',
                          color:'#FF6600' }}>█</span>
        </p>
      </motion.div>

      {/* Main CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.8 }}
        onClick={() => navigate('/crop')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        style={{
          padding: '18px 48px', marginBottom: 40,
          background: '#FF660022',
          border: '2px solid #FF6600',
          borderRadius: 2, color: '#FF6600',
          fontFamily: "'Orbitron'", fontSize: 14,
          fontWeight: 700, letterSpacing: 4,
          cursor: 'pointer',
          boxShadow: '0 0 40px #FF660044',
          transition: 'all 0.2s'
        }}>
        // INITIALIZE SYSTEM ►
      </motion.button>

      {/* Quick links grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 1 }}
        style={{ display: 'grid',
                 gridTemplateColumns: 'repeat(3, 1fr)',
                 gap: 10, width: '100%', maxWidth: 600 }}>
        {QUICK_LINKS.map((link, i) => (
          <motion.button key={i}
            onClick={() => navigate(link.path)}
            whileHover={{ y: -3 }}
            style={{
              padding: '12px 8px',
              background: `${link.color}11`,
              border: `1px solid ${link.color}33`,
              borderRadius: 2, cursor: 'pointer',
              textAlign: 'center', transition: 'all 0.2s'
            }}>
            <span style={{ fontSize: 18, display: 'block', marginBottom: 4 }}>
              {link.icon}
            </span>
            <span style={{ fontFamily:"'Courier New'", fontSize: 8,
                            color: link.color, letterSpacing: 1 }}>
              {link.label}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Footer */}
      <p style={{ fontFamily:"'Courier New'", fontSize: 9,
                   color: '#FF660022', letterSpacing: 3,
                   margin: '48px 0 0' }}>
        AMRITKRISHI 2.0 // NERV AGRI DIVISION // CLASSIFIED LEVEL 3 // 2026
      </p>
    </div>
  )
}
