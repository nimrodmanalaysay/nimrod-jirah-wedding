import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

/* ============================================================
   Footer — all nav links including new pages
   ✏️ Edit the columns array to add/remove links.
   ============================================================ */

const columns = [
  {
    heading: 'Navigate',
    links: [
      { label: 'Home',      path: '/' },
      { label: 'Our Story', path: '/story' },
      { label: 'Entourage', path: '/entourage' },
      { label: 'Gallery',   path: '/gallery' },
    ],
  },
  {
    /* Heading is "Program" to match the navbar group — with Overview gone the
       first link is "Ceremony", and a "Ceremony" heading above it read as a
       stutter. */
    heading: 'Program',
    links: [
      { label: 'Ceremony',   path: '/ceremony/wedding' },
      { label: 'Reception',  path: '/ceremony/reception' },
      { label: 'Dress Code', path: '/ceremony/dresscode' },
    ],
  },
  {
    heading: 'More',
    links: [
      { label: 'RSVP',   path: '/rsvp' },
      { label: 'FAQs',   path: '/faqs' },
      { label: 'Gifts',  path: '/gifts' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      {/* Grouped nav. Each group's links sit in two sub-columns, so a group is
          two rows tall instead of four. Both dividers went with the couple
          names and date — the upper one had nothing left to divide, and the
          lower one is replaced by the copyright's own top border. */}
      <div className="footer__columns">
        {columns.map(col => (
          <div key={col.heading} className="footer__col">
            <p className="footer__col-heading">{col.heading}</p>
            <div className="footer__col-links">
              {col.links.map(({ label, path }) => (
                <Link key={path} to={path} className="footer__link">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="footer__copy">Made with love ♥</p>
    </footer>
  )
}
