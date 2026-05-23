import React, { useState, useEffect } from 'react'
import { NavLink, Link } from 'react-router-dom'
import './Navbar.css'

/* ============================================================
   Navbar
   - Transparent at top of page
   - Becomes solid (burgundy) after scrolling 60px
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

  // Listen for scroll to toggle solid background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when a link is clicked
  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
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
