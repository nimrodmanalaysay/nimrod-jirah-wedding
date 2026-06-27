import React from 'react'
import { Link } from 'react-router-dom'
import './CeremonyPages.css'

/* ============================================================
   Dress Code Page
   ✏️ Update attire theme, colors, and descriptions below.
   ============================================================ */

// ✏️ Palette swatches — update colors and labels to match your theme
const palette = [
  { color: '#E1CA96', label: 'Champagne Gold',  note: 'Dresses, ties, accessories' },
  { color: '#FFD9DA', label: 'Soft Blush',       note: 'Gowns, dress shirts' },
  { color: '#556251', label: 'Sage Green',        note: 'Suits, midi dresses' },
  { color: '#BD6738', label: 'Terracotta',        note: 'Accents, wraps' },
  { color: '#E8DDD0', label: 'Ivory',             note: 'Alternative to white' },
]

const dos = [
  'Wear formal or semi-formal attire in the suggested color palette.',
  'Ladies: floor-length gowns, midi dresses, or elegant pantsuits.',
  'Gentlemen: barong tagalog, suit, or dress shirt with slacks.',
  'Comfortable footwear is encouraged — the ceremony is outdoors.',
  'Accessories and statement pieces in earth or neutral tones.',
]

const donts = [
  'Please do NOT wear white, ivory, or cream dresses (reserved for the bride).',
  'Avoid overly casual attire — jeans, shorts, and sneakers are not appropriate.',
  'Avoid neon or very bright colors that may distract in photos.',
  'Skip overly revealing outfits out of respect for the venue and occasion.',
]

export default function DressCode() {
  return (
    <div className="cp-page">
      <div className="cp-breadcrumb">
        <Link to="/ceremony">Ceremony</Link>
        <span>›</span>
        <span>Dress Code</span>
      </div>

      <div className="cp-hero">
        <img
          src="/photos/dresscode-hero.jpg"
          alt="Dress Code"
          className="cp-hero__img"
        />
        <div className="cp-hero__overlay cp-hero__overlay--light">
          <p className="cp-hero__pre" style={{ color: 'rgba(105,27,25,0.7)' }}>Attire Guide</p>
          <h1 className="cp-hero__title" style={{ color: 'var(--burgundy)' }}>Dress Code</h1>
          <p className="cp-hero__date" style={{ color: 'var(--btn-color)' }}>Formal / Semi-Formal</p>
        </div>
      </div>

      <div className="cp-content">

        {/* Theme */}
        <section className="cp-section" style={{ textAlign: 'center' }}>
          <h2 className="cp-section__title">Attire Theme</h2>
          <p className="cp-attire-theme">
            Formal / Semi-Formal
          </p>
          <p className="cp-attire-desc">
            {/* ✏️ Update description */}
            We'd love for our guests to dress in warm earth tones and soft romantic hues
            that complement our garden wedding setting. Think elegance, comfort, and celebration.
          </p>
        </section>

        {/* Color palette */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">Suggested Color Palette</h2>
          <div className="cp-palette">
            {palette.map((s, i) => (
              <div key={i} className="cp-swatch">
                <div className="cp-swatch__color" style={{ background: s.color }} />
                <p className="cp-swatch__label">{s.label}</p>
                <p className="cp-swatch__note">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dos and Don'ts */}
        <section className="cp-section">
          <h2 className="cp-section__title">Do's &amp; Don'ts</h2>
          <div className="cp-dos-donts">
            <div className="cp-dos">
              <h4 className="cp-dos__title">✓ Do's</h4>
              <ul>
                {dos.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
            <div className="cp-donts">
              <h4 className="cp-donts__title">✕ Don'ts</h4>
              <ul>
                {donts.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* Attire inspiration images */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">Style Inspiration</h2>
          <div className="cp-img-grid cp-img-grid--4">
            <div className="cp-inspo-card">
              <img src="/photos/attire-ladies-1.jpg" alt="Ladies attire inspiration" />
              <p>Ladies — Gown</p>
            </div>
            <div className="cp-inspo-card">
              <img src="/photos/attire-ladies-2.jpg" alt="Ladies midi dress" />
              <p>Ladies — Midi Dress</p>
            </div>
            <div className="cp-inspo-card">
              <img src="/photos/attire-gents-1.jpg" alt="Gents barong" />
              <p>Gents — Barong</p>
            </div>
            <div className="cp-inspo-card">
              <img src="/photos/attire-gents-2.jpg" alt="Gents suit" />
              <p>Gents — Suit</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
