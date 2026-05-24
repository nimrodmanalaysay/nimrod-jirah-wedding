import React, { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import './Navbar.css'

/* ============================================================
   Navbar behavior:
   - ALL pages: transparent at top, solid burgundy after scrolling
   - Home page: white text + gold accents (dark hero behind it)
   - Other pages: sage text (light background behind it)
   ============================================================ */

const links = [
  { label: 'Home',      path: '/' },
  { label: 'Our Story', path: '/story' },
  { label: 'Entourage', path: '/entourage' },
  { label: 'RSVP',      path: '/rsvp' },
  { label: 'Gallery',   path: '/gallery' },
]

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

  const closeMenu = () => setMenuOpen(false)

  // Classes applied to <nav>:
  //   navbar--scrolled   → solid burgundy background (on scroll, any page)
  //   navbar--light      → sage text (transparent state on non-home pages)
  const navClass = [
    'navbar',
    scrolled     ? 'navbar--scrolled' : '',
    !scrolled && !isHome ? 'navbar--light' : '',
  ].filter(Boolean).join(' ')

  return (
    <nav className={navClass}>
      <Link to="/" className="navbar__logo" onClick={closeMenu}>
        N <span>&amp;</span> J
      </Link>

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

      <button
        className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      <div className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`}>
        {links.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              'navbar__drawer-link' + (isActive ? ' active' : '')
            }
            onClick={closeMenu}
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
