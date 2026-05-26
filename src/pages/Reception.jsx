import React from 'react'
import { Link } from 'react-router-dom'
import './CeremonyPages.css'

/* ============================================================
   Reception Page
   ✏️ Replace placeholder content with real reception details.
   ============================================================ */

const program = [
  { time: '4:00 PM', event: 'Cocktail Hour',       note: 'Welcome drinks and canapés in the garden.' },
  { time: '5:00 PM', event: 'Guests Seated',        note: 'Move to the main reception hall.' },
  { time: '5:15 PM', event: 'Grand Entrance',        note: 'Introduction of the newly married couple.' },
  { time: '5:30 PM', event: 'Opening Prayer & Toast', note: 'Blessing of the meal led by a principal sponsor.' },
  { time: '5:45 PM', event: 'Dinner Service Begins', note: 'Seven-course plated dinner.' },
  { time: '6:30 PM', event: 'First Dance',           note: "Couple's first dance as husband and wife." },
  { time: '6:45 PM', event: 'Parent Dances',         note: 'Father–Daughter and Mother–Son dances.' },
  { time: '7:00 PM', event: 'Speeches & Toasts',     note: 'Best Man, Maid of Honor, and sponsors.' },
  { time: '7:30 PM', event: 'Cake Cutting',          note: 'Followed by dessert service.' },
  { time: '8:00 PM', event: 'Open Dancing',          note: 'Dance floor opens for all guests.' },
  { time: '10:00 PM', event: 'Send-off',             note: 'Sparkler farewell for the couple.' },
]

export default function Reception() {
  return (
    <div className="cp-page">
      <div className="cp-breadcrumb">
        <Link to="/ceremony">Ceremony</Link>
        <span>›</span>
        <span>Reception</span>
      </div>

      <div className="cp-hero">
        <img
          src="https://placehold.co/1200x400/556251/E1CA96?text=Reception"
          alt="Reception"
          className="cp-hero__img"
        />
        <div className="cp-hero__overlay">
          <p className="cp-hero__pre">Join Us For</p>
          <h1 className="cp-hero__title">The Reception</h1>
          <p className="cp-hero__date">November 7, 2026 · 4:00 PM onwards</p>
        </div>
      </div>

      <div className="cp-content">

        {/* Venue details */}
        <section className="cp-section">
          <h2 className="cp-section__title">Reception Venue</h2>
          <div className="cp-cards">
            <div className="cp-card">
              <span className="cp-card__icon">🏛️</span>
              <h4>Venue</h4>
              {/* ✏️ Update venue */}
              <p>Grass Garden</p>
              <p className="cp-card__sub">Main Reception Hall</p>
            </div>
            <div className="cp-card">
              <span className="cp-card__icon">📍</span>
              <h4>Address</h4>
              {/* ✏️ Update address */}
              <p>123 Garden Lane</p>
              <p className="cp-card__sub">City, Province 0000</p>
            </div>
            <div className="cp-card">
              <span className="cp-card__icon">🍽️</span>
              <h4>Dinner</h4>
              <p>Plated Dinner</p>
              <p className="cp-card__sub">Seven-course menu</p>
            </div>
          </div>
        </section>

        {/* Placeholder images */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">The Venue</h2>
          <div className="cp-img-grid">
            <img src="https://placehold.co/400x280/FFD9DA/691B19?text=Venue+Photo+1" alt="Venue" />
            <img src="https://placehold.co/400x280/E1CA96/691B19?text=Venue+Photo+2" alt="Venue" />
            <img src="https://placehold.co/400x280/BD6738/FFD9DA?text=Venue+Photo+3" alt="Venue" />
          </div>
        </section>

        {/* Program flow */}
        <section className="cp-section">
          <h2 className="cp-section__title">Program Flow</h2>
          <div className="cp-timeline">
            {program.map((item, i) => (
              <div key={i} className="cp-timeline__item">
                <div className="cp-timeline__time">{item.time}</div>
                <div className="cp-timeline__dot" />
                <div className="cp-timeline__body">
                  <p className="cp-timeline__event">{item.event}</p>
                  <p className="cp-timeline__note">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Transportation */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">Getting There</h2>
          <ul className="cp-reminders">
            <li>The ceremony and reception are at the <strong>same venue</strong>. No transportation needed between events.</li>
            <li>Free parking is available on-site for all guests.</li>
            <li>Ride-sharing services (Grab/Angkas) are readily available in the area.</li>
            <li>For guests staying overnight, recommended hotels will be shared closer to the date.</li>
          </ul>
        </section>

      </div>
    </div>
  )
}
