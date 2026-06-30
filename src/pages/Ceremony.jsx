import React from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import './Ceremony.css'

/* ============================================================
   Ceremony Hub Page — landing page for all ceremony sub-pages
   Acts as a visual directory with cards linking to:
   • /ceremony/wedding   — Wedding Ceremony details
   • /ceremony/reception — Reception details
   • /ceremony/dresscode — Dress Code guide
   ============================================================ */

const subPages = [
  {
    path:    '/ceremony/wedding',
    icon:    '⛪',
    title:   'Wedding Service',
    desc:    'Order of service, venue, arrival guide, and what to expect.',
    color:   'var(--blush)',
    textCol: 'var(--burgundy)',
  },
  {
    path:    '/ceremony/reception',
    icon:    '🥂',
    title:   'Reception',
    desc:    'Reception venue, program flow, dinner schedule.',
    color:   'var(--burgundy)',
    textCol: 'var(--gold)',
  },
  {
    path:    '/ceremony/dresscode',
    icon:    '👗',
    title:   'Dress Code',
    desc:    "Attire guide, color palette, do's and don'ts.",
    color:   'var(--gold)',
    textCol: 'var(--burgundy)',
  },
]

export default function Ceremony() {
  return (
    <div className="ceremony-hub">
      <PageHero
        eyebrow="Nimrod & Jirah"
        title="Program"
        subtitle="Join us as we celebrate God's gift of marriage"
      />

      {/* Breadcrumb nav */}
      <div className="ceremony-hub__breadcrumb">
        <span>Program</span>
        <span className="crumb-sep">›</span>
        <span className="crumb-current">Overview</span>
      </div>

      {/* Sub-page cards */}
      <div className="ceremony-hub__cards">
        {subPages.map(p => (
          <Link
            key={p.path}
            to={p.path}
            className="ceremony-hub__card"
            style={{ '--card-bg': p.color, '--card-text': p.textCol }}
          >
            <span className="ceremony-hub__card-icon">{p.icon}</span>
            <h3 className="ceremony-hub__card-title">{p.title}</h3>
            <p className="ceremony-hub__card-desc">{p.desc}</p>
            <span className="ceremony-hub__card-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
