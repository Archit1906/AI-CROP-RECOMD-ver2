import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const SCHEMES = [
  {
    id: 1,
    name: "PM-KISAN",
    icon: "💰",
    category: "income_support",
    level: "CENTRAL",
    tags: ["DIRECT TRANSFER"],
    description: "₹6,000/year direct financial support to all farmer families in 3 installments.",
    grant: "₹6,000 Annually (3 Cycles)",
    eligibility: "All small & marginal farmers with cultivable land",
    requirements: "Aadhaar card, Bank account, Land records",
    applyUrl: "https://pmkisan.gov.in",
    deadline: "2025-03-31",
    isNew: false,
    color: "#FF6600"
  },
  {
    id: 2,
    name: "Fasal Bima Yojana (PMFBY)",
    icon: "🛡️",
    category: "insurance",
    level: "CENTRAL",
    tags: ["SHIELD PROTOCOL"],
    description: "Crop insurance scheme providing financial support against crop loss due to natural calamities.",
    grant: "Full Asset Coverage",
    eligibility: "All farmers growing notified crops",
    requirements: "Land records, Bank account, Crop sowing certificate",
    applyUrl: "https://pmfby.gov.in",
    deadline: "2025-06-30",
    isNew: false,
    color: "#00FFFF"
  },
  {
    id: 3,
    name: "TN Drought Relief",
    icon: "🏜️",
    category: "drought_relief",
    level: "STATE",
    tags: ["EMERGENCY"],
    description: "Emergency support funds for Tamil Nadu farmers in drought-declared districts.",
    grant: "₹5,000 Per Acre Compensated",
    eligibility: "TN farmers in drought-declared districts",
    requirements: "Aadhaar, Land records, District drought certificate",
    applyUrl: "https://www.tn.gov.in",
    deadline: "2025-04-15",
    isNew: false,
    color: "#FF0033"
  },
  {
    id: 4,
    name: "Kisan Credit Card (KCC)",
    icon: "💳",
    category: "loan",
    level: "CENTRAL",
    tags: ["CREDIT LINE"],
    description: "Short-term credit for farmers to meet agricultural needs at low interest rates of 4%.",
    grant: "Up to ₹3 Lakh at 4% interest",
    eligibility: "All farmers, sharecroppers, tenant farmers",
    requirements: "Aadhaar, Land records or lease agreement, Bank account",
    applyUrl: "https://www.nabard.org",
    deadline: "2025-12-31",
    isNew: false,
    color: "#FFD700"
  },
  {
    id: 5,
    name: "PM Kusum Yojana",
    icon: "☀️",
    category: "subsidy",
    level: "CENTRAL",
    tags: ["SOLAR PROTOCOL"],
    description: "Solar pump installation subsidy — 60% government subsidy on solar pumps for irrigation.",
    grant: "60% Subsidy on Solar Pump",
    eligibility: "All farmers with irrigated land",
    requirements: "Aadhaar, Land records, Electricity connection details",
    applyUrl: "https://pmkusum.mnre.gov.in",
    deadline: "2025-09-30",
    isNew: true,
    color: "#FFD700"
  },
  {
    id: 6,
    name: "Soil Health Card Scheme",
    icon: "🧪",
    category: "subsidy",
    level: "CENTRAL",
    tags: ["ANALYSIS PROTOCOL"],
    description: "Free soil testing and health card providing crop-wise nutrient recommendations.",
    grant: "Free Soil Testing + Recommendations",
    eligibility: "All farmers across India",
    requirements: "Aadhaar card, Land details",
    applyUrl: "https://soilhealth.dac.gov.in",
    deadline: "2025-12-31",
    isNew: false,
    color: "#8B5CF6"
  },
  {
    id: 7,
    name: "NABARD Farm Loan",
    icon: "🏦",
    category: "loan",
    level: "CENTRAL",
    tags: ["TERM CREDIT"],
    description: "Long-term agricultural investment loans for land development, irrigation, machinery.",
    grant: "Up to ₹10 Lakh",
    eligibility: "Farmers with land ownership documents",
    requirements: "Aadhaar, Land records, Income certificate, Bank account",
    applyUrl: "https://www.nabard.org",
    deadline: "2025-12-31",
    isNew: false,
    color: "#3B82F6"
  },
  {
    id: 8,
    name: "TN Chief Minister Farm Relief",
    icon: "🌾",
    category: "income_support",
    level: "STATE",
    tags: ["TN EXCLUSIVE"],
    description: "Additional income support for Tamil Nadu farmers — ₹2,000 per season direct transfer.",
    grant: "₹2,000 Per Season",
    eligibility: "TN farmers registered in e-District portal",
    requirements: "TN ration card, Aadhaar, Land records, Bank account",
    applyUrl: "https://www.tn.gov.in",
    deadline: "2025-05-31",
    isNew: true,
    color: "#FF6600"
  },
  {
    id: 9,
    name: "Pradhan Mantri Fasal Bima",
    icon: "🌧️",
    category: "insurance",
    level: "CENTRAL",
    tags: ["WEATHER SHIELD"],
    description: "Weather-based crop insurance protecting against unseasonal rainfall and temperature.",
    grant: "Based on crop loss assessment",
    eligibility: "Farmers in notified areas with loanee farmers",
    requirements: "Crop loan account, Land records, Aadhaar",
    applyUrl: "https://pmfby.gov.in",
    deadline: "2025-07-31",
    isNew: false,
    color: "#00FFFF"
  },
  {
    id: 10,
    name: "e-NAM Market Linkage",
    icon: "🏪",
    category: "subsidy",
    level: "CENTRAL",
    tags: ["MARKET ACCESS"],
    description: "Online national agriculture market — sell crops directly to buyers across India.",
    grant: "Free Market Access + Better Prices",
    eligibility: "All farmers with produce to sell",
    requirements: "Aadhaar, Bank account, Mobile number",
    applyUrl: "https://enam.gov.in",
    deadline: "2025-12-31",
    isNew: true,
    color: "#00FF41"
  },
  {
    id: 11,
    name: "Rashtriya Krishi Vikas Yojana",
    icon: "📈",
    category: "subsidy",
    level: "CENTRAL",
    tags: ["DEVELOPMENT"],
    description: "Infrastructure development grants for farm mechanization and storage facilities.",
    grant: "Up to ₹25 Lakh for infrastructure",
    eligibility: "Farmer groups, FPOs, cooperatives",
    requirements: "Group registration, Project proposal, Land documents",
    applyUrl: "https://rkvy.nic.in",
    deadline: "2025-08-31",
    isNew: false,
    color: "#FF6600"
  },
  {
    id: 12,
    name: "TN Horticulture Subsidy",
    icon: "🍅",
    category: "subsidy",
    level: "STATE",
    tags: ["TN HORTICULTURE"],
    description: "Tamil Nadu government subsidy for vegetable and fruit crop cultivation inputs.",
    grant: "50% subsidy on seeds and inputs",
    eligibility: "TN farmers growing notified horticulture crops",
    requirements: "TN farmer ID, Land records, Crop declaration",
    applyUrl: "https://www.tn.gov.in/horticulture",
    deadline: "2025-06-30",
    isNew: true,
    color: "#00FF41"
  },
  {
    id: 13,
    name: "Agri Infrastructure Fund",
    icon: "🏗️",
    category: "loan",
    level: "CENTRAL",
    tags: ["INFRASTRUCTURE"],
    description: "Low-interest loans for post-harvest management infrastructure like cold storage.",
    grant: "Loans up to ₹2 Crore at 3% subsidy",
    eligibility: "Farmers, FPOs, Agri-entrepreneurs",
    requirements: "Business plan, Land documents, Bank account",
    applyUrl: "https://agriinfra.dac.gov.in",
    deadline: "2025-10-31",
    isNew: false,
    color: "#8B5CF6"
  },
  {
    id: 14,
    name: "Drought Prone Area Programme",
    icon: "💧",
    category: "drought_relief",
    level: "CENTRAL",
    tags: ["WATER PROTOCOL"],
    description: "Watershed development and water conservation grants for drought-prone regions.",
    grant: "₹12,000 per hectare",
    eligibility: "Farmers in drought-prone districts",
    requirements: "Land records, District certification, Bank account",
    applyUrl: "https://dolr.gov.in",
    deadline: "2025-05-15",
    isNew: false,
    color: "#3B82F6"
  },
  {
    id: 15,
    name: "PM Kisan Samman Nidhi",
    icon: "🤝",
    category: "income_support",
    level: "CENTRAL",
    tags: ["INCOME BOOST"],
    description: "Additional ₹4,000 bonus for farmers who adopt organic farming practices.",
    grant: "₹4,000 Organic Farming Bonus",
    eligibility: "Farmers certified under Paramparagat Krishi Vikas Yojana",
    requirements: "Organic certification, Aadhaar, Land records",
    applyUrl: "https://pgsindia-ncof.gov.in",
    deadline: "2025-04-30",
    isNew: true,
    color: "#00FF41"
  }
]

export default function GovernmentSchemes() {
  const navigate = useNavigate()
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
      ? SCHEMES.filter(s => bookmarks.includes(s.id))
      : SCHEMES

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
  }, [search, activeFilter, showBookmarked, bookmarks])

  // Countdown timer
  const getCountdown = (deadlineStr) => {
    const now      = new Date()
    const deadline = new Date(deadlineStr)
    const diff     = deadline - now
    if (diff <= 0) return { label: 'EXPIRED', color: '#FF0033', urgent: true }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days <= 7)  return { label: `${days}D LEFT`, color: '#FF0033', urgent: true  }
    if (days <= 30) return { label: `${days}D LEFT`, color: '#FFD700', urgent: false }
    return { label: `${days}D LEFT`, color: '#00FF41', urgent: false }
  }

  const checkEligibility = () => {
    const { state, landAcres, category } = eligibilityForm
    const acres = parseFloat(landAcres) || 0
    const results = []

    SCHEMES.forEach(scheme => {
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

      {/* Stats bar */}
      <div style={{ display:'flex', gap:12, marginBottom:20 }}>
        {[
          { label:'TOTAL DIRECTIVES', value:SCHEMES.length,                               color:'#FF6600' },
          { label:'ACTIVE SCHEMES',   value:SCHEMES.filter(s=>new Date(s.deadline)>new Date()).length, color:'#00FF41' },
          { label:'NEW THIS SEASON',  value:SCHEMES.filter(s=>s.isNew).length,            color:'#FFD700' },
          { label:'BOOKMARKED',       value:bookmarks.length,                              color:'#00FFFF' },
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
                {scheme.isNew && (
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
                    onClick={() => window.open(scheme.applyUrl, '_blank')}
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
    </div>
  )
}
