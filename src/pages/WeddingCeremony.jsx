import React from 'react'
import './CeremonyPages.css'
import { MAP_LINK, MAP_EMBED } from '../utils/venue'

/* ============================================================
   Wedding Ceremony Page — Christian wedding service
   ✏️ Replace all placeholder values with real details.
   ============================================================ */

// ✏️ Ceremony begins 3:00 PM. Doors open 2:00 PM, guests seated by 2:30 PM.
const orderOfService = [
  { time: '2:00 PM', event: 'Prelude & Seating',                  note: 'Guests arrive and are seated as the music plays.' },
  { time: '3:00 PM', event: 'Processional',                       note: 'Entrance of the wedding party, then the bride.' },
  { time: '3:10 PM', event: 'Call to Worship & Opening Prayer',   note: 'Our pastor welcomes everyone and opens in prayer.' },
  { time: '3:15 PM', event: 'Praise & Worship',                   note: 'We lift our voices to God together in song.' },
  { time: '3:25 PM', event: 'Scripture Reading',                  note: "God's Word on love and marriage." },
  { time: '3:30 PM', event: 'The Message',                        note: 'A word of exhortation for the couple and all present.' },
  { time: '3:45 PM', event: 'Exchange of Vows',                   note: 'Our sacred covenant before God and witnesses.' },
  { time: '3:50 PM', event: 'Exchange of Rings',                  note: 'A symbol of our unending promise.' },
  { time: '4:00 PM', event: 'Prayer & Blessing',                  note: 'The couple is covered in prayer.' },
  { time: '4:05 PM', event: 'Pronouncement & First Kiss',         note: 'Presented before God as husband and wife!' },
  { time: '4:10 PM', event: 'Recessional',                        note: 'The newlyweds exit, followed by the wedding party.' },
]

export default function WeddingCeremony() {
  return (
    <div className="cp-page">
      {/* Breadcrumb */}
      {/* "Program" is plain text, not a link — it is the navbar group, and the
          hub page it used to point at no longer exists. */}
      <div className="cp-breadcrumb">
        <span>Program</span>
        <span>›</span>
        <span>Ceremony</span>
      </div>

      {/* ✏️ Page title — edit the eyebrow / title / date here */}
      <div className="cp-pagetitle">
        <p className="cp-pagetitle__pre">A Christ-Centered Wedding Service</p>
        <h1 className="cp-pagetitle__title">Nimrod &amp; Jirah</h1>
        <p className="cp-pagetitle__date">November 7, 2026</p>
        <span className="cp-pagetitle__rule" />
      </div>

      {/* Scripture verse */}
      <section className="cp-verse">
        <span className="cp-verse__mark">✝</span>
        <p className="cp-verse__text">
          “Though one may be overpowered, two can defend themselves.
          A cord of three strands is not quickly broken.”
        </p>
        <p className="cp-verse__ref">Ecclesiastes 4:12</p>
      </section>

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
              <p className="cp-card__sub">Doors open at 2:00 PM</p>
            </div>
            <div className="cp-card">
              <span className="cp-card__icon">📍</span>
              <h4>Venue</h4>
              <p>Grass Garden</p>
              <p className="cp-card__sub">Purok 4, P. Reyes Street, Barangay Sipat, Plaridel, Bulacan</p>
            </div>
          </div>
        </section>

        {/* Arrival reminders */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">Arrival Reminders</h2>
          <ul className="cp-reminders">
            <li>Please arrive by <strong>2:30 PM</strong> to be seated before the service begins.</li>
            <li>Parking is available on-site. Attendants will guide you upon arrival.</li>
            <li>The service will be held <strong>indoors</strong>. Please dress comfortably so you can enjoy the celebration.</li>
            <li>Kindly switch your mobile phone to silent mode and join us in worship.</li>
            <li>Photography during the service is permitted from your seat only.</li>
          </ul>
        </section>

        {/* Order of Service */}
        <section className="cp-section">
          <h2 className="cp-section__title">Order of Service</h2>
          <div className="cp-timeline">
            {orderOfService.map((item, i) => (
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

        {/* Find Us — map */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">Find Us</h2>
          <div className="cp-map">
            <iframe
              src={MAP_EMBED}
              title="Grass Garden location map"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="cp-map-actions">
            <a className="cp-maplink" href={MAP_LINK} target="_blank" rel="noopener noreferrer">
              <span aria-hidden="true">📍</span> View on Google Maps
            </a>
          </div>
        </section>

      </div>
    </div>
  )
}
