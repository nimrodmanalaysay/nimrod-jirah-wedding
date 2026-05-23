import React from 'react'
import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown'
import './Home.css'

/* ============================================================
   Home Page
   Sections: Hero, Wedding Details, Countdown, Teaser blocks
   ============================================================ */
export default function Home() {
  return (
    <div className="home">

      {/* ---- HERO ---- */}
      <section className="hero">
        {/* Decorative botanical overlay — edit in Home.css */}
        <div className="hero__overlay" />

        <div className="hero__content fade-up">
          {/* Pre-title */}
          <p className="hero__pre">The Wedding of</p>

          {/* Couple names — change here to update */}
          <h1 className="hero__names">
            Nimrod<br />
            <span className="hero__amp">&amp;</span><br />
            Jirah
          </h1>

          {/* Wedding date */}
          <p className="hero__date">November 7, 2026</p>

          {/* CTA buttons */}
          <div className="hero__cta">
            <Link to="/rsvp"    className="btn btn-primary">RSVP Now</Link>
            <Link to="/story"   className="btn btn-outline">Our Story</Link>
          </div>
        </div>

        {/* Scroll indicator arrow */}
        <div className="hero__scroll-hint">
          <span />
        </div>
      </section>

      {/* ---- COUNTDOWN ---- */}
      <section className="home__countdown">
        <p className="home__countdown-label">Counting down to forever</p>
        <Countdown />
      </section>

      {/* ---- WEDDING DETAILS ---- */}
      <section className="home__details">
        <h2 className="section-title">Wedding Details</h2>
        <span className="section-divider" />

        <div className="details__grid">
          {/* Ceremony card */}
          <div className="details__card">
            <div className="details__icon">✦</div>
            <h3>Ceremony</h3>
            <p className="details__time">November 7, 2026</p>
            <p className="details__time">3:00 PM</p>
            <p className="details__place">Grass Garden</p>
            {/* ✏️ Replace with actual address */}
            <p className="details__address">123 Garden Lane, City, Province 0000</p>
          </div>

          {/* Divider ornament */}
          <div className="details__ornament">❧</div>

          {/* Reception card */}
          <div className="details__card">
            <div className="details__icon">✦</div>
            <h3>Reception</h3>
            <p className="details__time">November 7, 2026</p>
            <p className="details__time">4:00 PM</p>
            <p className="details__place">Grass Garden</p>
            {/* ✏️ Replace with actual address */}
            <p className="details__address">123 Garden Lane, City, Province 0000</p>
          </div>
        </div>
      </section>

      {/* ---- QUICK NAV TEASERS ---- */}
      <section className="home__teasers">
        {[
          { label: 'Our Story',   path: '/story',     icon: '♡' },
          { label: 'Entourage',   path: '/entourage', icon: '✦' },
          { label: 'Gallery',     path: '/gallery',   icon: '◈' },
          { label: 'RSVP',        path: '/rsvp',      icon: '✉' },
        ].map(({ label, path, icon }) => (
          <Link key={path} to={path} className="teaser__card">
            <span className="teaser__icon">{icon}</span>
            <span className="teaser__label">{label}</span>
          </Link>
        ))}
      </section>

    </div>
  )
}
