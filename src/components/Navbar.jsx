import React, { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import './Navbar.css'

/* ============================================================
   Navbar
   - Logo/icon on the left
   - Transparent on all pages at top, solid on scroll
   - Home: white text | Other pages: sage text
   - Mobile drawer closes on any link click (incl. current page)
   ============================================================ */

const links = [
  { label: 'Home',      path: '/' },
  { label: 'Our Story', path: '/story' },
  { label: 'Entourage', path: '/entourage' },
  { label: 'RSVP',      path: '/rsvp' },
  { label: 'Gallery',   path: '/gallery' },
]

/* Wedding rings SVG logo — no external image needed */
function WeddingLogo({ light }) {
  const color = light ? 'var(--sage)' : 'var(--white)'
  const accent = 'var(--gold)'
  return (
    <svg
      className="navbar__logo-icon"
      viewBox="0 0 48 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Wedding rings logo"
    >
      {/* Left ring */}
      <circle cx="16" cy="14" r="11" stroke={color} strokeWidth="2" fill="none" />
      {/* Right ring */}
      <circle cx="32" cy="14" r="11" stroke={color} strokeWidth="2" fill="none" />
      {/* Overlap highlight */}
      <path
        d="M24 6.5 C26.5 9 26.5 19 24 21.5 C21.5 19 21.5 9 24 6.5Z"
        fill={accent}
        opacity="0.55"
      />
    </svg>
  )
}

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const { pathname } = useLocation()

  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // Always close menu on any nav click (including current page)
  const closeMenu = () => setMenuOpen(false)

  const isLight = !scrolled && !isHome

  const navClass = [
    'navbar',
    scrolled ? 'navbar--scrolled' : '',
    isLight  ? 'navbar--light'    : '',
  ].filter(Boolean).join(' ')

  return (
    <nav className={navClass}>

      {/* ── Left: logo mark + couple monogram ── */}
      <Link to="/" className="navbar__brand" onClick={closeMenu}>
        <WeddingLogo light={isLight} />
        <span className="navbar__brand-text">
          N <span className="navbar__brand-amp">&amp;</span> J
        </span>
      </Link>

      {/* ── Desktop links ── */}
      <ul className="navbar__links">
        {links.map(({ label, path }) => (
          <li key={path}>
            <NavLink
              to={path}
              end
              className={({ isActive }) =>
                'navbar__link' + (isActive ? ' navbar__link--active' : '')
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* ── Hamburger ── */}
      <button
        className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      {/* ── Mobile backdrop ── */}
      {menuOpen && (
        <div className="navbar__backdrop" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* ── Mobile drawer ── */}
      <div
        className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`}
        role="dialog"
        aria-label="Navigation menu"
      >
        {/* Drawer header */}
        <div className="navbar__drawer-header">
          <WeddingLogo light={false} />
          <span className="navbar__drawer-monogram">N &amp; J</span>
        </div>

        {links.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              'navbar__drawer-link' + (isActive ? ' active' : '')
            }
            onClick={closeMenu}   // closes on current page too
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
