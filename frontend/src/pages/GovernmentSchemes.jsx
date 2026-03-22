import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function GovernmentSchemes() {
  const navigate = useNavigate()
  const [schemes,      setSchemes]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [lastUpdated,  setLastUpdated]  = useState(null)
  const [stats,        setStats]        = useState({})
  const [newSchemeIds, setNewSchemeIds] = useState(new Set())
  const prevSchemesRef = useRef([])

  const [search, setSearch]               = useState("")
  const [activeFilter, setActiveFilter]   = useState("all")
  const [bookmarks, setBookmarks]         = useState(() => JSON.parse(localStorage.getItem('ak_bookmarks') || '[]'))
  const [showBookmarked, setShowBookmarked] = useState(false)
  const [expandedId, setExpandedId]       = useState(null)
  const [eligibilityScheme, setEligibilityScheme] = useState(null)
  const [eligibilityResult, setEligibilityResult] = useState(null)
  const [eligibilityForm, setEligibilityForm] = useState({
    state: 'Tamil Nadu', landAcres: '', category: 'small', hasCrops: true
  })

  // Fetch schemes from backend
  const fetchSchemes = async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res  = await fetch(`${apiUrl}/api/schemes`)
      const data = await res.json()

      const prevIds  = new Set(prevSchemesRef.current.map(s => s.id))
      const newIds   = new Set(
        data.schemes
          .filter(s => !prevIds.has(s.id) && prevSchemesRef.current.length > 0)
          .map(s => s.id)
      )
      if (newIds.size > 0) setNewSchemeIds(newIds)

      prevSchemesRef.current = data.schemes
      setSchemes(data.schemes)
      setStats({
        total:   data.total,
        active:  data.active_count,
        expired: data.expired_count,
        isNew:   data.new_count
      })
      setLastUpdated(data.last_updated)
      setError(null)
    } catch (err) {
      setError("Could not load schemes. Backend offline.")
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchSchemes(true)
  }, [])

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => fetchSchemes(false), 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Clear new highlight after 5 seconds
  useEffect(() => {
    if (newSchemeIds.size > 0) {
      const t = setTimeout(() => setNewSchemeIds(new Set()), 5000)
      return () => clearTimeout(t)
    }
  }, [newSchemeIds])

  // Countdown timer
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleRefresh = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    await fetch(`${apiUrl}/api/schemes/refresh`, { method: 'POST' })
    setTimeout(() => fetchSchemes(false), 2000)
  }

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ak_bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const toggleBookmark = (id) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    )
  }

  const FILTERS = [
    { key: 'all',            label: 'ALL'           },
    { key: 'insurance',      label: 'INSURANCE'     },
    { key: 'income_support', label: 'INCOME SUPPORT'},
    { key: 'drought_relief', label: 'DROUGHT RELIEF'},
    { key: 'subsidy',        label: 'SUBSIDIES'     },
    { key: 'loan',           label: 'LOANS'         },
  ]

  // FIX: filtered schemes — search + filter both work
  const filtered = useMemo(() => {
    let list = showBookmarked
      ? schemes.filter(s => bookmarks.includes(s.id))
      : schemes.filter(s => !s.is_expired)

    if (activeFilter !== 'all') {
      list = list.filter(s => s.category === activeFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    return list
  }, [schemes, search, activeFilter, showBookmarked, bookmarks])

  const getCountdown = (deadlineStr) => {
    const deadline = new Date(deadlineStr)
    const diff     = deadline - now
    if (diff <= 0) return { label:'EXPIRED', color:'#FF0033', urgent:true, expired:true }
    const days    = Math.floor(diff / 86400000)
    const hours   = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    if (days === 0)  return { label:`${hours}h ${minutes}m ${seconds}s`, color:'#FF0033', urgent:true,  expired:false }
    if (days <= 7)   return { label:`${days}d ${hours}h left`,           color:'#FF0033', urgent:true,  expired:false }
    if (days <= 30)  return { label:`${days} days left`,                 color:'#FFD700', urgent:false, expired:false }
    return              { label:`${days} days left`,                     color:'#00FF41', urgent:false, expired:false }
  }

  const checkEligibility = () => {
    const { state, landAcres, category } = eligibilityForm
    const acres = parseFloat(landAcres) || 0
    const results = []

    schemes.forEach(scheme => {
      let eligible = true
      let reasons  = []

      if (scheme.level === 'STATE' && !scheme.name.toLowerCase().includes('tn') && state !== 'Tamil Nadu') {
        eligible = false
        reasons.push('State-specific scheme')
      }
      if (scheme.category === 'loan' && acres < 0.5) {
        eligible = false
        reasons.push('Minimum 0.5 acres required')
      }
      if (eligible) results.push({ ...scheme, reasons })
    })

    setEligibilityResult(results)
  }

  return (
    <div style={{ padding:24, background:'#0A0A0F', minHeight:'100vh' }}>

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between',
                    alignItems:'flex-start', marginBottom:24,
                    paddingBottom:16, borderBottom:'1px solid #FF660033' }}>
        <div>
          <p style={{ fontFamily:"'Share Tech Mono'", fontSize:9,
                      color:'#FF660066', letterSpacing:4, margin:'0 0 6px' }}>
            // CLEARANCE REQUIRED
          </p>
          <h1 style={{ fontFamily:"'Orbitron'", fontSize:28, fontWeight:900,
                       color:'#FF6600', margin:'0 0 6px', letterSpacing:4,
                       textShadow:'0 0 20px #FF660066' }}>
            FEDERAL DIRECTIVES
          </h1>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <span style={{ background:'#FF000033', border:'1px solid #FF0033',
                           color:'#FF0033', fontFamily:"'Share Tech Mono'",
                           fontSize:9, padding:'2px 8px', letterSpacing:2 }}>
              RESTRICTED
            </span>
            <span style={{ fontFamily:"'Share Tech Mono'", fontSize:10,
                           color:'#666680', letterSpacing:2 }}>
              ARCHIVE OF SUBSIDIES AND SHIELD PROGRAMS
            </span>
          </div>
        </div>

        <div style={{ display:'flex', gap:10 }}>
          {/* Refresh button */}
          <button onClick={handleRefresh} style={{
            padding: '8px 14px', background: 'transparent',
            border: '1px solid #FF660044', borderRadius: 2,
            color: '#FF660066', fontFamily: "'Courier New'",
            fontSize: 9, letterSpacing: 2, cursor: 'pointer',
            display: 'flex', alignItems: 'center'
          }}>
            ↻ REFRESH
          </button>

          {/* Bookmarks toggle */}
          <button onClick={() => setShowBookmarked(!showBookmarked)}
            style={{
              padding:'10px 16px', border:`1px solid ${showBookmarked ? '#FFD700' : '#FF660044'}`,
              background: showBookmarked ? '#FFD70022' : 'transparent',
              color: showBookmarked ? '#FFD700' : '#666680',
              fontFamily:"'Orbitron'", fontSize:10, letterSpacing:2,
              cursor:'pointer', borderRadius:2, display:'flex', alignItems:'center', gap:6
            }}>
            🔖 SAVED ({bookmarks.length})
          </button>

          {/* Verify Clearance — opens eligibility checker */}
          <button onClick={() => setEligibilityScheme('all')}
            style={{
              padding:'10px 20px', border:'1px solid #00FFFF',
              background:'#00FFFF11', color:'#00FFFF',
              fontFamily:"'Orbitron'", fontSize:10, letterSpacing:2,
              cursor:'pointer', borderRadius:2,
              boxShadow:'0 0 15px #00FFFF22'
            }}>
            ⊙ VERIFY CLEARANCE
          </button>
        </div>
      </div>

      {/* Last updated indicator */}
      {lastUpdated && (
        <p style={{ fontFamily: "'Courier New'", fontSize: 8,
                    color: '#444', letterSpacing: 2, margin: '-16px 0 24px' }}>
          // LAST SYNC: {new Date(lastUpdated).toLocaleString('en-IN')}
        </p>
      )}

      {/* Stats bar */}
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        {[
          { label:'TOTAL DIRECTIVES', value:stats.total || 0,                               color:'#FF6600' },
          { label:'ACTIVE SCHEMES',   value:stats.active || 0,                              color:'#00FF41' },
          { label:'NEW THIS SEASON',  value:stats.isNew || 0,                               color:'#FFD700' },
          { label:'EXPIRED',          value:stats.expired || 0,                             color:'#FF0033' },
        ].map(stat => (
          <div key={stat.label} style={{
            background:'#0D0D1A', border:`1px solid ${stat.color}33`,
            borderRadius:2, padding:'10px 16px', flex:1, textAlign:'center'
          }}>
            <p style={{ fontFamily:"'Orbitron'", fontSize:20, fontWeight:900,
                         color:stat.color, margin:'0 0 2px',
                         textShadow:`0 0 10px ${stat.color}66` }}>
              {stat.value}
            </p>
            <p style={{ fontFamily:"'Share Tech Mono'", fontSize:8,
                         color:'#666680', margin:0, letterSpacing:2 }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Search + Filters — FIX: all wired to state */}
      <div style={{ background:'#0D0D1A', border:'1px solid #FF660044',
                    borderLeft:'3px solid #FF6600', borderRadius:2,
                    padding:'16px', marginBottom:20 }}>
        <p style={{ fontFamily:"'Share Tech Mono'", fontSize:9,
                    color:'#FF660066', letterSpacing:3, margin:'0 0 10px' }}>
          // INDEX QUERY
        </p>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          {/* Search input — FIX: onChange wired */}
          <div style={{ flex:1, minWidth:200, display:'flex',
                        alignItems:'center', gap:8,
                        background:'#0A0A0F', border:'1px solid #FF660044',
                        borderRadius:2, padding:'8px 12px' }}>
            <span style={{ color:'#FF660066' }}>⌕</span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH DIRECTIVES..."
              style={{ background:'transparent', border:'none', outline:'none',
                       color:'#E8E8E8', fontFamily:"'Share Tech Mono'",
                       fontSize:12, letterSpacing:1, width:'100%' }} />
            {search && (
              <button onClick={() => setSearch('')}
                style={{ background:'none', border:'none', color:'#FF6600',
                         cursor:'pointer', fontSize:14 }}>×</button>
            )}
          </div>

          {/* Filter buttons — FIX: onClick wired */}
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              style={{
                padding:'8px 14px', border:'1px solid',
                borderColor: activeFilter===f.key ? '#FF6600' : '#FF660033',
                background:  activeFilter===f.key ? '#FF660022' : 'transparent',
                color:       activeFilter===f.key ? '#FF6600'   : '#666680',
                fontFamily:"'Orbitron'", fontSize:9,
                letterSpacing:2, cursor:'pointer', borderRadius:2,
                transition:'all 0.15s'
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p style={{ fontFamily:"'Share Tech Mono'", fontSize:9,
                    color:'#666680', margin:'10px 0 0', letterSpacing:2 }}>
          // {filtered.length} DIRECTIVES FOUND
          {showBookmarked && ' — SHOWING BOOKMARKED ONLY'}
          {search && ` — QUERY: "${search.toUpperCase()}"`}
        </p>
      </div>

      {/* New scheme notification banner */}
      {newSchemeIds.size > 0 && (
        <div style={{
          background: '#00FF4111', border: '1px solid #00FF41',
          borderRadius: 4, padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 10,
          animation: 'fadeIn 0.3s ease'
        }}>
          <span style={{ fontSize: 18 }}>🆕</span>
          <p style={{ fontFamily: "'Orbitron'", fontSize: 12,
                       color: '#00FF41', margin: 0, letterSpacing: 2 }}>
            {newSchemeIds.size} NEW DIRECTIVE{newSchemeIds.size > 1 ? 'S' : ''} ADDED
          </p>
        </div>
      )}

      {/* Expired scheme tombstone */}
      {schemes.filter(s => s.is_expired).length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: "'Courier New'", fontSize: 8,
                       color: '#FF000044', letterSpacing: 3, margin: '0 0 8px' }}>
            // EXPIRED DIRECTIVES — {schemes.filter(s => s.is_expired).length} SCHEMES CLOSED
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {schemes.filter(s => s.is_expired).map(s => (
              <div key={s.id} style={{
                background: '#1A0000', border: '1px solid #FF000022',
                borderRadius: 2, padding: '6px 12px',
                opacity: 0.5
              }}>
                <p style={{ fontFamily: "'Courier New'", fontSize: 9,
                             color: '#FF0033', margin: 0,
                             textDecoration: 'line-through', letterSpacing: 1 }}>
                  {s.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{
              background: '#0D0D1A', border: '1px solid #FF660011',
              borderRadius: 4, padding: 20, height: 280,
              animation: 'shimmer 1.5s infinite'
            }}>
              <div style={{ height: 12, background: '#FF660011', borderRadius: 2, marginBottom: 12 }} />
              <div style={{ height: 20, background: '#FF660011', borderRadius: 2, marginBottom: 8, width: '60%' }} />
              <div style={{ height: 60, background: '#FF660011', borderRadius: 2 }} />
            </div>
          ))}
        </div>
      )}

      {/* Schemes grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <p style={{ fontFamily:"'Orbitron'", fontSize:16,
                      color:'#FF660044', letterSpacing:4 }}>
            // NO DIRECTIVES FOUND
          </p>
          <p style={{ fontFamily:"'Share Tech Mono'", color:'#444',
                      fontSize:12, marginTop:8 }}>
            ADJUST QUERY PARAMETERS
          </p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
          {filtered.map(scheme => {
            const countdown   = getCountdown(scheme.deadline)
            const isBookmarked = bookmarks.includes(scheme.id)
            const isExpanded  = expandedId === scheme.id

            return (
              <div key={scheme.id}
                style={{
                  background:'#0D0D1A',
                  border:`1px solid ${isExpanded ? scheme.color : '#FF660033'}`,
                  borderTop:`2px solid ${scheme.color}`,
                  borderRadius:2, padding:'20px',
                  transition:'all 0.2s', position:'relative',
                  boxShadow: isExpanded ? `0 0 20px ${scheme.color}22` : 'none'
                }}>

                {/* NEW badge */}
                {scheme.is_new && (
                  <div style={{
                    position:'absolute', top:-1, right:40,
                    background:'#00FF41', color:'#000',
                    fontFamily:"'Orbitron'", fontSize:8,
                    padding:'2px 8px', letterSpacing:2
                  }}>
                    NEW
                  </div>
                )}

                {/* Card header */}
                <div style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'flex-start', marginBottom:12 }}>
                  <div style={{
                    width:44, height:44,
                    background:`${scheme.color}22`,
                    border:`1px solid ${scheme.color}44`,
                    borderRadius:2, display:'flex',
                    alignItems:'center', justifyContent:'center',
                    fontSize:22
                  }}>
                    {scheme.icon}
                  </div>

                  {/* Bookmark button — FIX: onClick wired */}
                  <button onClick={() => toggleBookmark(scheme.id)}
                    style={{
                      background: isBookmarked ? '#FFD70022' : 'transparent',
                      border:`1px solid ${isBookmarked ? '#FFD700' : '#FF660033'}`,
                      color: isBookmarked ? '#FFD700' : '#666680',
                      padding:'6px 8px', cursor:'pointer', borderRadius:2,
                      fontSize:14, transition:'all 0.15s'
                    }}>
                    {isBookmarked ? '🔖' : '📌'}
                  </button>
                </div>

                {/* Tags */}
                <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
                  <span style={{
                    background:`${scheme.color}22`, color:scheme.color,
                    fontFamily:"'Share Tech Mono'", fontSize:8,
                    padding:'2px 8px', letterSpacing:2, borderRadius:1
                  }}>
                    [{scheme.level}]
                  </span>
                  {scheme.tags.map(tag => (
                    <span key={tag} style={{
                      background:'#FF660011', color:'#FF660088',
                      fontFamily:"'Share Tech Mono'", fontSize:8,
                      padding:'2px 8px', letterSpacing:2, borderRadius:1
                    }}>
                      [{tag}]
                    </span>
                  ))}
                </div>

                {/* Name */}
                <h3 style={{
                  fontFamily:"'Orbitron'", fontSize:14, fontWeight:700,
                  color:'#E8E8E8', margin:'0 0 8px', letterSpacing:1
                }}>
                  {scheme.name.toUpperCase()}
                </h3>

                <p style={{
                  fontFamily:"'Share Tech Mono'", fontSize:11,
                  color:'#9CA3AF', margin:'0 0 12px', lineHeight:1.6
                }}>
                  {scheme.description}
                </p>

                <div style={{ borderTop:'1px solid #FF660022', paddingTop:12, marginBottom:12 }}>
                  <p style={{ fontFamily:"'Share Tech Mono'", fontSize:8,
                               color:'#666680', margin:'0 0 4px', letterSpacing:2 }}>
                    GRANT AMOUNT
                  </p>
                  <p style={{ fontFamily:"'Orbitron'", fontSize:12, fontWeight:700,
                               color:scheme.color, margin:'0 0 10px',
                               textShadow:`0 0 8px ${scheme.color}66` }}>
                    {scheme.grant.toUpperCase()}
                  </p>

                  {/* Deadline countdown */}
                  <div style={{ display:'flex', justifyContent:'space-between',
                                alignItems:'center' }}>
                    <div>
                      <p style={{ fontFamily:"'Share Tech Mono'", fontSize:8,
                                   color:'#666680', margin:'0 0 2px', letterSpacing:2 }}>
                        DEADLINE
                      </p>
                      <p style={{
                        fontFamily:"'Share Tech Mono'", fontSize:10,
                        color: countdown.color, margin:0,
                        fontWeight: countdown.urgent ? 700 : 400,
                        animation: countdown.urgent ? 'flicker 2s infinite' : 'none'
                      }}>
                        {countdown.urgent && '⚠ '}{countdown.label}
                      </p>
                    </div>

                    {/* Expand toggle */}
                    <button onClick={() => setExpandedId(isExpanded ? null : scheme.id)}
                      style={{
                        background:'transparent',
                        border:`1px solid ${scheme.color}44`,
                        color:scheme.color, padding:'4px 10px',
                        fontFamily:"'Share Tech Mono'", fontSize:10,
                        cursor:'pointer', borderRadius:1, letterSpacing:1
                      }}>
                      {isExpanded ? '▲ LESS' : '▼ MORE'}
                    </button>
                  </div>
                </div>

                {/* EXPANDED DETAIL VIEW */}
                {isExpanded && (
                  <div style={{
                    background:'#0A0A0F', border:`1px solid ${scheme.color}33`,
                    borderRadius:2, padding:'14px', marginBottom:12
                  }}>
                    <div style={{ marginBottom:10 }}>
                      <p style={{ fontFamily:"'Share Tech Mono'", fontSize:8,
                                   color:'#666680', margin:'0 0 4px', letterSpacing:2 }}>
                        ELIGIBILITY REQUIREMENTS
                      </p>
                      <p style={{ fontFamily:"'Share Tech Mono'", fontSize:11,
                                   color:'#00FFFF', margin:0 }}>
                        {scheme.eligibility.toUpperCase()}
                      </p>
                    </div>
                    <div style={{ marginBottom:10 }}>
                      <p style={{ fontFamily:"'Share Tech Mono'", fontSize:8,
                                   color:'#666680', margin:'0 0 4px', letterSpacing:2 }}>
                        DOCUMENTS REQUIRED
                      </p>
                      <p style={{ fontFamily:"'Share Tech Mono'", fontSize:11,
                                   color:'#9CA3AF', margin:0 }}>
                        {scheme.requirements}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontFamily:"'Share Tech Mono'", fontSize:8,
                                   color:'#666680', margin:'0 0 4px', letterSpacing:2 }}>
                        APPLICATION DEADLINE
                      </p>
                      <p style={{ fontFamily:"'Share Tech Mono'", fontSize:11,
                                   color: countdown.color, margin:0 }}>
                        {new Date(scheme.deadline).toLocaleDateString('en-IN', {
                          day:'numeric', month:'long', year:'numeric'
                        }).toUpperCase()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action buttons — FIX: both wired */}
                <div style={{ display:'flex', gap:8 }}>
                  <button
                    onClick={() => window.open(scheme.apply_url, '_blank')}
                    style={{
                      flex:1, padding:'10px 8px',
                      background:`${scheme.color}22`,
                      border:`1px solid ${scheme.color}`,
                      color:scheme.color,
                      fontFamily:"'Orbitron'", fontSize:9,
                      letterSpacing:2, cursor:'pointer', borderRadius:1,
                      transition:'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background=`${scheme.color}44`}
                    onMouseLeave={e => e.currentTarget.style.background=`${scheme.color}22`}>
                    REQUEST AUTHORIZATION
                  </button>
                  <button
                    onClick={() => setEligibilityScheme(scheme)}
                    style={{
                      padding:'10px 12px',
                      background:'transparent',
                      border:'1px solid #FF660044',
                      color:'#FF6600',
                      fontFamily:"'Share Tech Mono'", fontSize:14,
                      cursor:'pointer', borderRadius:1,
                      transition:'all 0.15s'
                    }}
                    title="Check Eligibility">
                    ✓
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ELIGIBILITY CHECKER MODAL */}
      {eligibilityScheme && (
        <div style={{
          position:'fixed', inset:0,
          background:'rgba(0,0,0,0.85)',
          display:'flex', alignItems:'center', justifyContent:'center',
          zIndex:1000, padding:20
        }}
          onClick={e => { if(e.target===e.currentTarget) { setEligibilityScheme(null); setEligibilityResult(null) }}}>

          <div style={{
            background:'#0D0D1A', border:'1px solid #00FFFF',
            borderRadius:4, padding:28, width:'100%', maxWidth:520,
            boxShadow:'0 0 40px #00FFFF22'
          }}>
            <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'center', marginBottom:20 }}>
              <div>
                <p style={{ fontFamily:"'Share Tech Mono'", fontSize:9,
                             color:'#00FFFF88', letterSpacing:3, margin:'0 0 4px' }}>
                  // ELIGIBILITY VERIFICATION SYSTEM
                </p>
                <h2 style={{ fontFamily:"'Orbitron'", fontSize:16, fontWeight:700,
                              color:'#00FFFF', margin:0, letterSpacing:3 }}>
                  VERIFY CLEARANCE
                </h2>
              </div>
              <button onClick={() => { setEligibilityScheme(null); setEligibilityResult(null) }}
                style={{ background:'none', border:'1px solid #FF660044',
                         color:'#FF6600', fontSize:18, cursor:'pointer',
                         width:32, height:32, borderRadius:2 }}>
                ×
              </button>
            </div>

            {!eligibilityResult ? (
              <>
                {[
                  { label:'STATE', key:'state', type:'select',
                    options:['Tamil Nadu','Maharashtra','Punjab','Karnataka','Andhra Pradesh'] },
                  { label:'LAND (ACRES)', key:'landAcres', type:'number', placeholder:'E.G. 2.5' },
                  { label:'FARMER CATEGORY', key:'category', type:'select',
                    options:['small','marginal','large'] },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom:16 }}>
                    <p style={{ fontFamily:"'Share Tech Mono'", fontSize:9,
                                 color:'#FF660088', letterSpacing:3, margin:'0 0 6px' }}>
                      // {field.label}
                    </p>
                    {field.type === 'select' ? (
                      <select value={eligibilityForm[field.key]}
                        onChange={e => setEligibilityForm(p => ({...p, [field.key]:e.target.value}))}
                        style={{ width:'100%', background:'#0A0A0F',
                                 border:'1px solid #FF660066', borderRadius:2,
                                 color:'#E8E8E8', fontFamily:"'Share Tech Mono'",
                                 padding:'10px 12px', outline:'none' }}>
                        {field.options.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                      </select>
                    ) : (
                      <input type={field.type}
                        placeholder={field.placeholder}
                        value={eligibilityForm[field.key]}
                        onChange={e => setEligibilityForm(p => ({...p, [field.key]:e.target.value}))}
                        style={{ width:'100%', background:'#0A0A0F',
                                 border:'1px solid #FF660066', borderRadius:2,
                                 color:'#E8E8E8', fontFamily:"'Share Tech Mono'",
                                 padding:'10px 12px', outline:'none' }} />
                    )}
                  </div>
                ))}

                <button onClick={checkEligibility}
                  style={{ width:'100%', padding:'12px',
                           background:'#00FFFF22', border:'1px solid #00FFFF',
                           color:'#00FFFF', fontFamily:"'Orbitron'",
                           fontSize:11, letterSpacing:3, cursor:'pointer',
                           borderRadius:2, boxShadow:'0 0 15px #00FFFF22' }}>
                  // INITIATE CLEARANCE SCAN ►
                </button>
              </>
            ) : (
              <>
                <div style={{ background:'#00FF4111', border:'1px solid #00FF4133',
                              borderRadius:2, padding:'12px 16px', marginBottom:16 }}>
                  <p style={{ fontFamily:"'Orbitron'", fontSize:13, color:'#00FF41',
                               margin:'0 0 4px', letterSpacing:2 }}>
                    ✓ CLEARANCE GRANTED
                  </p>
                  <p style={{ fontFamily:"'Share Tech Mono'", fontSize:10,
                               color:'#9CA3AF', margin:0 }}>
                    {eligibilityResult.length} DIRECTIVES AVAILABLE FOR YOUR PROFILE
                  </p>
                </div>

                <div style={{ maxHeight:240, overflowY:'auto', marginBottom:16 }}>
                  {eligibilityResult.map(s => (
                    <div key={s.id} style={{
                      display:'flex', justifyContent:'space-between',
                      alignItems:'center', padding:'8px 12px',
                      borderBottom:'1px solid #FF660011'
                    }}>
                      <span style={{ fontFamily:"'Share Tech Mono'", fontSize:11, color:'#E8E8E8' }}>
                        {s.icon} {s.name}
                      </span>
                      <span style={{ fontFamily:"'Share Tech Mono'", fontSize:10,
                                     color:s.color }}>
                        {s.grant.split(' ').slice(0,3).join(' ')}
                      </span>
                    </div>
                  ))}
                </div>

                <button onClick={() => { setEligibilityResult(null); setEligibilityScheme(null) }}
                  style={{ width:'100%', padding:'10px',
                           background:'#FF660022', border:'1px solid #FF6600',
                           color:'#FF6600', fontFamily:"'Orbitron'",
                           fontSize:10, letterSpacing:3, cursor:'pointer', borderRadius:2 }}>
                  CLOSE TERMINAL
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <style>{`
        @keyframes shimmer {
          0%,100%{ opacity:0.4 }
          50%    { opacity:0.7 }
        }
        @keyframes fadeIn {
          from{ opacity:0; transform:translateY(-10px) }
          to  { opacity:1; transform:translateY(0) }
        }
        @keyframes newPulse {
          0%,100%{ box-shadow:0 0 0 0 rgba(0,255,65,0.4) }
          50%    { box-shadow:0 0 0 8px rgba(0,255,65,0) }
        }
      `}</style>
    </div>
  )
}
