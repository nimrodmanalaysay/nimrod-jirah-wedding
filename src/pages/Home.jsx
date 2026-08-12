import React from 'react'
import { Link } from 'react-router-dom'
import Countdown from '../components/Countdown'
import './Home.css'

import { MAP_LINK, MAP_EMBED } from '../utils/venue'

// ✏️ Venue background — replace /public/photos/venue-hall.jpg to change it
const VENUE_BG = '/photos/venue-hall.jpg'

/* ============================================================
   Home Page
   Sections: Hero, Countdown, Wedding Details, Explore cards
   ============================================================ */

// ✏️ Cards render in exactly this order
const explorePages = [
  { label: 'Dress Code', path: '/ceremony/dresscode', icon: '❁',
    desc: 'What to wear — the colour palette, and a few dos and don’ts.' },
  { label: 'Program', path: '/ceremony', icon: '✝',
    desc: 'The order of service and the reception flow — all the details.' },
  { label: 'Entourage', path: '/entourage', icon: '✦',
    desc: 'Meet the family and friends standing beside us on our big day.' },
  { label: 'Our Story', path: '/story', icon: '♡',
    desc: 'From our first hello to forever — the journey that brought us here.' },
  { label: 'Gallery', path: '/gallery', icon: '◈',
    desc: 'A glimpse of our favorite moments together, captured in photos.' },
  { label: 'Gifts', path: '/gifts', icon: '❧',
    desc: 'Your presence is the greatest gift — but details are here if you wish.' },
  { label: 'RSVP', path: '/rsvp', icon: '✉',
    desc: 'Let us know you can make it — kindly reply by October 1, 2026.' },
  { label: 'FAQs', path: '/faqs', icon: '❖',
    desc: 'Quick answers about timing, parking, attire, and what to expect.' },
]

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

      {/* ---- WEDDING DETAILS (single venue — ceremony & reception same place) ---- */}
      <section
        className="home__venue"
        style={{ backgroundImage: `url(${VENUE_BG})` }}
      >
        <div className="home__venue-overlay" />
        <div className="home__venue-content">
          <p className="home__venue-eyebrow">Ceremony &amp; Reception</p>
          <h2 className="home__venue-title">Wedding Details</h2>
          <span className="home__venue-rule" />

          <p className="home__venue-place">Grass Garden</p>
          <p className="home__venue-address">Purok 4, P. Reyes Street, Barangay Sipat, Plaridel, Bulacan</p>
          <p className="home__venue-date">November 7, 2026</p>

          <div className="home__venue-times">
            <div className="home__venue-time">
              <span className="home__venue-time-label">Ceremony</span>
              <span className="home__venue-time-value">3:00 PM</span>
            </div>
            <span className="home__venue-time-sep">❦</span>
            <div className="home__venue-time">
              <span className="home__venue-time-label">Reception</span>
              <span className="home__venue-time-value">4:30 PM</span>
            </div>
          </div>

          <a
            className="home__venue-maplink"
            href={MAP_LINK}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">📍</span> View on Google Maps
          </a>
        </div>

        {/* Embedded Google Map — actual venue location */}
        <div className="home__venue-map">
          <iframe
            src={MAP_EMBED}
            title="Grass Garden location on Google Maps"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>

      {/* ---- EXPLORE THE SITE ---- */}
      <section className="home__explore">
        <h2 className="section-title">Explore</h2>
        <span className="section-divider" />
        <p className="home__explore-sub">Everything you'll need, all in one place</p>

        <div className="explore__grid">
          {explorePages.map(({ label, path, icon, desc }) => (
            <Link key={path} to={path} className="explore__card">
              <span className="explore__icon">{icon}</span>
              <h3 className="explore__title">{label}</h3>
              <p className="explore__desc">{desc}</p>
              <span className="explore__arrow">Explore →</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  )
}
