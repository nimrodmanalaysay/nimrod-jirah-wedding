import React, { useState, useEffect, useRef } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import './Navbar.css'

const CEREMONY_CHILDREN = [
  { label: 'Overview',         path: '/ceremony'            },
  { label: 'Wedding Ceremony', path: '/ceremony/wedding'    },
  { label: 'Reception',        path: '/ceremony/reception'  },
  { label: 'Dress Code',       path: '/ceremony/dresscode'  },
]

const FLAT_LINKS = [
  { label: 'Home',      path: '/'          },
  { label: 'Our Story', path: '/story'     },
  { label: 'Entourage', path: '/entourage' },
  { label: 'FAQs',      path: '/faqs'      },
  { label: 'RSVP',      path: '/rsvp'      },
  { label: 'Gallery',   path: '/gallery'   },
  { label: 'Gifts',     path: '/gifts'     },
]

function WeddingLogo({ light }) {
  const color = light ? 'var(--sage)' : 'var(--white)'
  return (
    <svg className="navbar__logo-icon" viewBox="0 0 48 28" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-label="Wedding rings logo">
      <circle cx="16" cy="14" r="11" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="32" cy="14" r="11" stroke={color} strokeWidth="2" fill="none" />
      <path d="M24 6.5 C26.5 9 26.5 19 24 21.5 C21.5 19 21.5 9 24 6.5Z"
        fill="var(--gold)" opacity="0.55" />
    </svg>
  )
}

/* ── Desktop Ceremony dropdown ──
   Uses a plain <li> + <NavLink> identical to all other tabs.
   Dropdown opens on click, closes on outside click.         */
function CeremonyDropdown({ closeMenu }) {
  const [open, setOpen]  = useState(false)
  const ref              = useRef(null)
  const { pathname }     = useLocation()
  const isActive         = pathname.startsWith('/ceremony')

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <li className="navbar__dropdown-wrap" ref={ref}>
      {/* Rendered exactly like every other tab — same tag, same class */}
      <NavLink
        to="/ceremony"
        className={({ isActive }) =>
          'navbar__link navbar__link--has-dropdown' +
          (isActive || open ? ' navbar__link--active' : '')
        }
        onClick={e => {
          e.preventDefault()       // don't navigate on click — open dropdown instead
          setOpen(o => !o)
        }}
      >
        Ceremony
        <span className={`navbar__dropdown-chevron ${open ? 'open' : ''}`}>▾</span>
      </NavLink>

      {open && (
        <ul className="navbar__dropdown">
          {CEREMONY_CHILDREN.map(({ label, path }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === '/ceremony'}
                className={({ isActive }) =>
                  'navbar__dropdown-item' + (isActive ? ' active' : '')
                }
                onClick={() => { setOpen(false); closeMenu() }}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export default function Navbar() {
  const [scrolled,         setScrolled]         = useState(false)
  const [menuOpen,         setMenuOpen]         = useState(false)
  const [ceremonyExpanded, setCeremonyExpanded] = useState(false)
  const { pathname } = useLocation()

  const isHome  = pathname === '/'
  const isLight = !scrolled && !isHome

  // Reset ceremony submenu whenever route changes
  useEffect(() => {
    setCeremonyExpanded(false)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  const closeMenu = () => {
    setMenuOpen(false)
    setCeremonyExpanded(false)
  }

  const navClass = [
    'navbar',
    scrolled ? 'navbar--scrolled' : '',
    isLight  ? 'navbar--light'    : '',
  ].filter(Boolean).join(' ')

  return (
    <nav className={navClass}>

      {/* Brand */}
      <Link to="/" className="navbar__brand" onClick={closeMenu}>
        <WeddingLogo light={isLight} />
        <span className="navbar__brand-text">
          N <span className="navbar__brand-amp">&amp;</span> J
        </span>
      </Link>

      {/* Desktop links — all items rendered uniformly */}
      <ul className="navbar__links">
        {FLAT_LINKS.slice(0, 3).map(({ label, path }) => (
          <li key={path}>
            <NavLink to={path} end
              className={({ isActive }) =>
                'navbar__link' + (isActive ? ' navbar__link--active' : '')
              }
            >{label}</NavLink>
          </li>
        ))}

        {/* Ceremony — same visual as other tabs, with dropdown */}
        <CeremonyDropdown closeMenu={closeMenu} />

        {FLAT_LINKS.slice(3).map(({ label, path }) => (
          <li key={path}>
            <NavLink to={path} end
              className={({ isActive }) =>
                'navbar__link' + (isActive ? ' navbar__link--active' : '')
              }
            >{label}</NavLink>
          </li>
        ))}
      </ul>

      {/* Hamburger */}
      <button
        className={`navbar__hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      {/* Mobile backdrop */}
      {menuOpen && (
        <div className="navbar__backdrop" onClick={closeMenu} aria-hidden="true" />
      )}

      {/* Mobile drawer */}
      <div
        className={`navbar__drawer ${menuOpen ? 'navbar__drawer--open' : ''}`}
        role="dialog"
        aria-label="Navigation menu"
      >
        <div className="navbar__drawer-header">
          <WeddingLogo light={false} />
          <span className="navbar__drawer-monogram">N &amp; J</span>
        </div>

        {FLAT_LINKS.slice(0, 3).map(({ label, path }) => (
          <NavLink key={path} to={path} end
            className={({ isActive }) =>
              'navbar__drawer-link' + (isActive ? ' active' : '')
            }
            onClick={closeMenu}
          >{label}</NavLink>
        ))}

        {/* Ceremony accordion in mobile drawer */}
        <div className="navbar__drawer-group">
          <button
            className={`navbar__drawer-group-toggle ${pathname.startsWith('/ceremony') ? 'active' : ''}`}
            onClick={() => setCeremonyExpanded(o => !o)}
            aria-expanded={ceremonyExpanded}
          >
            Ceremony
            <span className={`navbar__drawer-chevron ${ceremonyExpanded ? 'open' : ''}`}>›</span>
          </button>

          {/* Submenu — outer div handles grid animation,
              inner div provides the overflow:hidden boundary */}
          <div className={`navbar__drawer-sub ${ceremonyExpanded ? 'navbar__drawer-sub--open' : ''}`}>
            <div className="navbar__drawer-sub-inner">
              {CEREMONY_CHILDREN.map(({ label, path }) => (
                <NavLink key={path} to={path}
                  end={path === '/ceremony'}
                  className={({ isActive }) =>
                    'navbar__drawer-sublink' + (isActive ? ' active' : '')
                  }
                  onClick={closeMenu}
                >{label}</NavLink>
              ))}
            </div>
          </div>
        </div>

        {FLAT_LINKS.slice(3).map(({ label, path }) => (
          <NavLink key={path} to={path} end
            className={({ isActive }) =>
              'navbar__drawer-link' + (isActive ? ' active' : '')
            }
            onClick={closeMenu}
          >{label}</NavLink>
        ))}
      </div>
    </nav>
  )
}
