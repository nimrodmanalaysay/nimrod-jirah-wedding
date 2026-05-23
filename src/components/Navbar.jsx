import React, { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import './Navbar.css'

/* ============================================================
   Navbar
   - Transparent at top of Home page only
   - Always solid (burgundy) on all other pages
   - Becomes solid after scrolling 60px on Home
   - Hamburger menu on mobile
   - Edit nav links in the `links` array below
   ============================================================ */

// Navigation links — edit label & path here
const links = [
  { label: 'Home',      path: '/' },
  { label: 'Our Story', path: '/story' },
  { label: 'Entourage', path: '/entourage' },
  { label: 'RSVP',      path: '/rsvp' },
  { label: 'Gallery',   path: '/gallery' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Only the Home page (/) gets a transparent navbar
  const isHome = pathname === '/'

  // Listen for scroll — only relevant on Home page
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    // Reset scroll state when route changes
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  // Navbar is solid when: scrolled past threshold OR not on the Home page
  const isSolid = scrolled || !isHome

  // Close mobile menu when a link is clicked
  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`navbar ${isSolid ? 'navbar--scrolled' : ''}`}>
      {/* Logo / Couple Name */}
      <Link to="/" className="navbar__logo" onClick={closeMenu}>
        N <span>&amp;</span> J
      </Link>

      {/* Desktop links */}
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

      {/* Hamburger (mobile) */}
      <button
        className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {/* Mobile drawer */}
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
