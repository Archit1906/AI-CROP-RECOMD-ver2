import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3-geo'

export default function IndiaMap({ onStateSelect, selectedState, activeStates = [] }) {
  const svgRef     = useRef(null)
  const [tooltip,  setTooltip]  = useState(null)
  const [geoData,  setGeoData]  = useState(null)
  const [proj,     setProj]     = useState(null)
  const [pathGen,  setPathGen]  = useState(null)

  const MAP_SIZE = window.innerWidth < 768 ? 320 : 420

  useEffect(() => {
    fetch('/india-states.geojson')
      .then(r => r.json())
      .then(data => {
        setGeoData(data)

        const projection = d3.geoMercator()
          .center([82, 22])
          .scale(MAP_SIZE === 320 ? 650 : 900)
          .translate([MAP_SIZE / 2, (MAP_SIZE === 320 ? 400 : 520) / 2])

        setProj(() => projection)
        setPathGen(() => d3.geoPath().projection(projection))
      })
  }, [MAP_SIZE])

  const getStateName = (feature) => {
    return feature.properties.NAME_1 ||
           feature.properties.name   ||
           feature.properties.ST_NM  ||
           feature.properties.state  || ''
  }

  const getStateColor = (name) => {
    if (name === selectedState)           return '#FF6600'
    if (activeStates.includes(name))      return '#FF660033'
    return '#162116'
  }

  const getStateBorder = (name) => {
    if (name === selectedState) return '#FF6600'
    return '#2D4A2D'
  }

  if (!geoData || !pathGen) return (
    <div style={{ width:MAP_SIZE, height:MAP_SIZE === 320 ? 400 : 520, display:'flex',
                  alignItems:'center', justifyContent:'center' }}>
      <p style={{ fontFamily:"'Courier New'", color:'#FF660044',
                  letterSpacing:3, fontSize:10 }}>
        // LOADING MAP DATA...
      </p>
    </div>
  )

  const H = MAP_SIZE === 320 ? 400 : 520

  return (
    <div style={{ position:'relative', width:MAP_SIZE, height:H }}>
      <svg ref={svgRef} width={MAP_SIZE} height={H}
        style={{ overflow:'visible' }}>

        {/* Hex grid background */}
        <defs>
          <pattern id="hexPat" x="0" y="0" width="28" height="24"
            patternUnits="userSpaceOnUse">
            <polygon points="14,2 26,8 26,16 14,22 2,16 2,8"
              fill="none" stroke="#FF660008" strokeWidth="0.5" />
          </pattern>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={MAP_SIZE} height={H} fill="url(#hexPat)" />

        {/* States */}
        {geoData.features.map((feature, i) => {
          const name    = getStateName(feature)
          const d       = pathGen(feature)
          const isSelected = name === selectedState

          return (
            <g key={i}>
              <path
                d={d}
                fill={getStateColor(name)}
                stroke={getStateBorder(name)}
                strokeWidth={isSelected ? 2 : 0.8}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  filter: isSelected
                    ? 'drop-shadow(0 0 8px #FF6600)'
                    : 'none'
                }}
                onMouseEnter={(e) => {
                  if (name !== selectedState) {
                    e.currentTarget.setAttribute('fill', '#FF660022')
                    e.currentTarget.setAttribute('stroke', '#FF660088')
                  }
                  const rect = svgRef.current.getBoundingClientRect()
                  setTooltip({
                    name,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top - 30
                  })
                }}
                onMouseLeave={(e) => {
                  if (name !== selectedState) {
                    e.currentTarget.setAttribute('fill', getStateColor(name))
                    e.currentTarget.setAttribute('stroke', getStateBorder(name))
                  }
                  setTooltip(null)
                }}
                onClick={() => onStateSelect(name)}
              />
              {/* Selected state pulse ring */}
              {isSelected && (
                <path
                  d={d}
                  fill="none"
                  stroke="#FF6600"
                  strokeWidth={3}
                  opacity={0.4}
                  style={{ animation:'mapPulse 1.5s ease infinite' }}
                />
              )}
            </g>
          )
        })}

        {/* Scan line animation */}
        <rect
          x={0} y={0} width={MAP_SIZE} height={4}
          fill="rgba(255,102,0,0.15)"
          style={{ animation:`scanLine${MAP_SIZE} 3s linear infinite` }}
        />
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'absolute',
          left: tooltip.x, top: tooltip.y,
          background: '#0D0D1A',
          border: '1px solid #FF6600',
          borderRadius: 2, padding: '4px 10px',
          pointerEvents: 'none', zIndex: 10,
          transform: 'translateX(-50%)'
        }}>
          <p style={{ fontFamily:"'Courier New'", fontSize:10,
                       color:'#FF6600', letterSpacing:2, margin:0 }}>
            {tooltip.name.toUpperCase()}
          </p>
        </div>
      )}

      <style>{`
        @keyframes mapPulse {
          0%,100%{ opacity:0.4; stroke-width:3 }
          50%    { opacity:0.1; stroke-width:6 }
        }
        @keyframes scanLine420 {
          0%  { transform:translateY(-10px) }
          100%{ transform:translateY(530px) }
        }
        @keyframes scanLine320 {
          0%  { transform:translateY(-10px) }
          100%{ transform:translateY(410px) }
        }
      `}</style>
    </div>
  )
}
