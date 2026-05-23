import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

/* ============================================================
   Footer — couple names, nav links, and credit line
   ✏️ Edit the links array to add/remove pages.
   ============================================================ */

const links = [
  { label: 'Home',      path: '/' },
  { label: 'Our Story', path: '/story' },
  { label: 'Entourage', path: '/entourage' },
  { label: 'RSVP',      path: '/rsvp' },
  { label: 'Gallery',   path: '/gallery' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__names">Nimrod &amp; Jirah</p>
      <p className="footer__date">November 7, 2026</p>

      <div className="footer__rule" />

      <nav className="footer__nav">
        {links.map(({ label, path }) => (
          <Link key={path} to={path} className="footer__link">
            {label}
          </Link>
        ))}
      </nav>

      <div className="footer__rule" />

      <p className="footer__copy">Made with love ♥</p>
    </footer>
  )
}
