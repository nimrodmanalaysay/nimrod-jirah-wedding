import React from 'react'
import { Link } from 'react-router-dom'
import './CeremonyPages.css'

/* ============================================================
   Wedding Ceremony Page
   ✏️ Replace all placeholder values with real details.
   ============================================================ */

const timeline = [
  { time: '2:30 PM', event: 'Venue Opens', note: 'Guests may begin arriving and be seated.' },
  { time: '3:00 PM', event: 'Ceremony Begins', note: 'Please be seated before the processional.' },
  { time: '3:05 PM', event: 'Processional', note: 'Bridal party and couple enter.' },
  { time: '3:20 PM', event: 'Exchange of Vows', note: 'The most sacred moment of our day.' },
  { time: '3:40 PM', event: 'Pronouncement & Kiss', note: 'The couple is officially married!' },
  { time: '3:45 PM', event: 'Recessional', note: 'Couple exits followed by bridal party.' },
  { time: '4:00 PM', event: 'Cocktail Hour Begins', note: 'Transition to reception venue.' },
]

export default function WeddingCeremony() {
  return (
    <div className="cp-page">
      {/* Breadcrumb */}
      <div className="cp-breadcrumb">
        <Link to="/ceremony">Ceremony</Link>
        <span>›</span>
        <span>Wedding Ceremony</span>
      </div>

      {/* Hero banner */}
      <div className="cp-hero">
        <img
          src="https://placehold.co/1200x400/691B19/E1CA96?text=Wedding+Ceremony"
          alt="Wedding Ceremony"
          className="cp-hero__img"
        />
        <div className="cp-hero__overlay">
          <p className="cp-hero__pre">The Ceremony</p>
          <h1 className="cp-hero__title">Nimrod &amp; Jirah</h1>
          <p className="cp-hero__date">November 7, 2026</p>
        </div>
      </div>

      <div className="cp-content">

        {/* Details cards */}
        <section className="cp-section">
          <h2 className="cp-section__title">Ceremony Details</h2>
          <div className="cp-cards">
            <div className="cp-card">
              <span className="cp-card__icon">📅</span>
              <h4>Date</h4>
              {/* ✏️ Update date */}
              <p>November 7, 2026</p>
              <p className="cp-card__sub">Saturday</p>
            </div>
            <div className="cp-card">
              <span className="cp-card__icon">🕒</span>
              <h4>Time</h4>
              {/* ✏️ Update time */}
              <p>3:00 PM</p>
              <p className="cp-card__sub">Doors open at 2:30 PM</p>
            </div>
            <div className="cp-card">
              <span className="cp-card__icon">📍</span>
              <h4>Venue</h4>
              {/* ✏️ Update venue */}
              <p>Grass Garden</p>
              <p className="cp-card__sub">123 Garden Lane, City, Province</p>
            </div>
          </div>
        </section>

        {/* Arrival reminders */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">Arrival Reminders</h2>
          <ul className="cp-reminders">
            <li>Please arrive by <strong>2:45 PM</strong> to be seated before the ceremony begins.</li>
            <li>Parking is available on-site. Attendants will guide you upon arrival.</li>
            <li>The ceremony venue will be <strong>outdoors</strong>. Please dress comfortably and bring a fan.</li>
            <li>Kindly switch your mobile phone to silent mode during the ceremony.</li>
            <li>Photography during the ceremony is permitted from your seat only.</li>
          </ul>
        </section>

        {/* Timeline */}
        <section className="cp-section">
          <h2 className="cp-section__title">Ceremony Timeline</h2>
          <div className="cp-timeline">
            {timeline.map((item, i) => (
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

      </div>
    </div>
  )
}
