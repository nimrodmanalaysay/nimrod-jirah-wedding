import React, { useState } from 'react'
import './CeremonyPages.css'

// ✏️ Replace /public/photos/Dresscode.jpg to change the attire guide image
const ATTIRE_IMG = '/photos/Dresscode.jpg'

/* ============================================================
   Dress Code Page
   ✏️ Update attire theme, colors, and descriptions below.
   ============================================================ */

// ✏️ Palette swatches — update colors and labels to match your theme
const palette = [
  { color: '#C98F8A', label: 'Dusty Rose' },
  { color: '#691B19', label: 'Burgundy' },
  { color: '#B85C45', label: 'Burnt Terracotta' },
  { color: '#8B7355', label: 'Taupe Brown' },
  { color: '#667052', label: 'Olive Green' },
  { color: '#5A4035', label: 'Dark Cocoa Brown' },
]

const dos = [
  'Wear formal or semi-formal attire in the suggested color palette.',
  'Ladies: floor-length gowns, midi dresses, or elegant pantsuits.',
  'Gentlemen: barong tagalog, suit, or dress shirt with slacks.',
  'Comfortable attire and footwear are encouraged so you can enjoy the celebration.',
  'Accessories and statement pieces in earth or neutral tones.',
]

const donts = [
  'Please do NOT wear white, ivory, or cream dresses (reserved for the bride).',
  'Avoid overly casual attire — jeans, shorts, and sneakers are not appropriate.',
  'Avoid neon or very bright colors that may distract in photos.',
  'Skip overly revealing outfits out of respect for the venue and occasion.',
]

export default function DressCode() {
  const [zoomed, setZoomed]       = useState(false)  // lightbox open
  const [magnified, setMagnified] = useState(false)  // extra zoom inside lightbox
  const closeLightbox = () => { setZoomed(false); setMagnified(false) }

  return (
    <div className="cp-page">
      <div className="cp-breadcrumb">
        {/* Plain text — the /ceremony hub page no longer exists */}
        <span>Program</span>
        <span>›</span>
        <span>Dress Code</span>
      </div>

      {/* ✏️ Page title — edit the eyebrow / title / subtitle here */}
      <div className="cp-pagetitle">
        <p className="cp-pagetitle__pre">Attire Guide</p>
        <h1 className="cp-pagetitle__title">Dress Code</h1>
        <p className="cp-pagetitle__date">Formal / Semi-Formal</p>
        <span className="cp-pagetitle__rule" />
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

        {/* Attire guide reference image */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">Wedding Attire Guide</h2>
          <button
            type="button"
            className="cp-attire-guide"
            onClick={() => setZoomed(true)}
            aria-label="Zoom in on the wedding attire guide"
          >
            <img src={ATTIRE_IMG} alt="Wedding attire guide reference" />
            <span className="cp-attire-guide__hint">Click to zoom</span>
          </button>
        </section>

      </div>

      {/* Zoom lightbox — backdrop/✕ to close; click image to zoom in further */}
      {zoomed && (
        <div
          className={`cp-lightbox ${magnified ? 'cp-lightbox--zoom' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeLightbox() }}
        >
          <button
            className="cp-lightbox__close"
            onClick={closeLightbox}
            aria-label="Close"
          >✕</button>
          <div className="cp-lightbox__img-wrap">
            <img
              src={ATTIRE_IMG}
              alt="Wedding attire guide"
              onClick={(e) => { e.stopPropagation(); setMagnified(m => !m) }}
            />
          </div>
          <p className="cp-lightbox__hint">
            {magnified ? 'Click image to zoom out' : 'Click image to zoom in'}
          </p>
        </div>
      )}
    </div>
  )
}
