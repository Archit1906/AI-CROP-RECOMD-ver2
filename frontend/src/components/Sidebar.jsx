import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Sprout,
  Bug,
  Cloud,
  TrendingUp,
  MessageSquare,
  FileText
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Sidebar = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/crop', icon: Sprout, label: t('nav.crop') },
    { path: '/disease', icon: Bug, label: t('nav.disease') },
    { path: '/weather', icon: Cloud, label: t('nav.weather') },
    { path: '/market', icon: TrendingUp, label: t('nav.market') },
    { path: '/chat', icon: MessageSquare, label: t('nav.chatbot') },
    { path: '/schemes', icon: FileText, label: t('nav.schemes') },
  ];

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#0D0D1A',
      borderRight: '1px solid #FF6600',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '0 0 24px',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Hex background */}
      <div className="hex-bg" style={{ position:'absolute', inset:0, opacity:0.3 }} />

      {/* NERV Logo Header */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid #FF660044',
          background: 'linear-gradient(180deg, #1A0A00 0%, transparent 100%)'
        }}>
          {/* NERV-style logo */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{
              width: 36, height: 36,
              background: '#FF6600',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize:16, color: '#0A0A0F' }}>🌾</span>
            </div>
            <div>
              <p style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 14, fontWeight: 900,
                color: '#FF6600', margin: 0,
                letterSpacing: 2,
                textShadow: '0 0 10px #FF660088'
              }}>
                AMRITKRISHI
              </p>
              <p style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 9, color: '#666680', margin: 0, letterSpacing: 2
              }}>
                MAGI AGRICULTURAL SYSTEM
              </p>
            </div>
          </div>

          {/* System status bar */}
          <div style={{
            background: '#0A0A0F', border: '1px solid #FF660044',
            borderRadius: 2, padding: '4px 8px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontFamily:"'Share Tech Mono'", fontSize:9,
                           color:'#00FF41', letterSpacing:1 }}>
              ● SYSTEM ONLINE
            </span>
            <span style={{ fontFamily:"'Share Tech Mono'", fontSize:9, color:'#666680' }}>
              v2.0.0
            </span>
          </div>
        </div>

        {/* Nav section label */}
        <p style={{ fontFamily:"'Share Tech Mono'", fontSize:9, color:'#FF660088',
                    letterSpacing:3, padding:'12px 16px 4px', margin:0 }}>
          // NAVIGATION SYSTEMS
        </p>

        {/* Nav items */}
        <nav style={{ padding:'0 8px' }}>
          {navItems.map(item => (
            <NavLink key={item.path} to={item.path}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', marginBottom: 2,
                borderRadius: 2, textDecoration: 'none',
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: 13, fontWeight: 600, letterSpacing: 2,
                textTransform: 'uppercase',
                transition: 'all 0.15s',
                background: isActive ? '#FF660022' : 'transparent',
                color: isActive ? '#FF6600' : '#666680',
                borderLeft: isActive ? '2px solid #FF6600' : '2px solid transparent',
                boxShadow: isActive ? 'inset 0 0 20px #FF660011' : 'none'
              })}>
              {({ isActive }) => (
                <>
                  <item.icon size={15} />
                  {item.label}
                  {/* Active indicator */}
                  {isActive && (
                    <span style={{ marginLeft:'auto', fontFamily:"'Share Tech Mono'",
                                   fontSize:8, color:'#FF6600' }}>
                      ◄
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom section */}
      <div style={{ padding:'0 12px', position: 'relative', zIndex: 10 }}>
        {/* Divider */}
        <div style={{ borderTop:'1px solid #FF660033', marginBottom:12 }} />

        {/* Dark mode toggle */}
        <button onClick={toggleDarkMode}
          style={{
            width:'100%', padding:'8px 12px', marginBottom:8,
            background: '#0A0A0F', border:'1px solid #FF660044',
            borderRadius:2, color:'#666680', cursor:'pointer',
            fontFamily:"'Share Tech Mono'", fontSize:10,
            letterSpacing:2, textAlign:'left',
            display:'flex', justifyContent:'space-between',
            alignItems: 'center'
          }}>
          <span>// DISPLAY MODE</span>
          <span style={{ color:'#FF6600' }}>{isDarkMode ? 'DARK' : 'LIGHT'}</span>
        </button>

        {/* Language selector */}
        <div style={{ background:'#0A0A0F', border:'1px solid #FF660044',
                      borderRadius:2, padding:'8px 12px' }}>
          <p style={{ fontFamily:"'Share Tech Mono'", fontSize:9, color:'#FF660088',
                      margin:'0 0 8px', letterSpacing:2 }}>
            // LANGUAGE PROTOCOL
          </p>
          <div style={{ display:'flex', gap:6 }}>
            {[
              { code:'en', label:'ENG' },
              { code:'ta', label:'தமிழ்' },
              { code:'hi', label:'हिंदी' }
            ].map(lang => (
              <button key={lang.code}
                onClick={() => { i18n.changeLanguage(lang.code); localStorage.setItem('lang', lang.code) }}
                style={{
                  flex:1, padding:'4px 2px', border:'1px solid',
                  borderColor: i18n.language===lang.code ? '#FF6600' : '#FF660033',
                  background: i18n.language===lang.code ? '#FF660022' : 'transparent',
                  color: i18n.language===lang.code ? '#FF6600' : '#666680',
                  fontFamily:"'Share Tech Mono'", fontSize:10,
                  cursor:'pointer', borderRadius:2,
                  transition:'all 0.15s'
                }}>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Replay Intro button */}
        <button
          onClick={() => {
            sessionStorage.removeItem('intro_shown')
            window.location.reload()
          }}
          style={{
            width:'100%', padding:'6px',
            background:'transparent',
            border:'1px solid #FF660022',
            color:'#FF660044', fontFamily:"'Courier New'",
            fontSize:8, letterSpacing:2, cursor:'pointer',
            borderRadius:1, marginTop:8
          }}>
          // REPLAY INTRO
        </button>

        {/* NERV footer stamp */}
        <p style={{ fontFamily:"'Share Tech Mono'", fontSize:8, color:'#FF660033',
                    textAlign:'center', margin:'12px 0 0', letterSpacing:2 }}>
          NERV AGRI DIVISION // CLASSIFIED
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
