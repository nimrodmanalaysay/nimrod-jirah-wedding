import React from 'react'
import { Link } from 'react-router-dom'
import './CeremonyPages.css'
import { MAP_LINK, MAP_EMBED } from '../utils/venue'

/* ============================================================
   Reception Page
   ✏️ Replace placeholder content with real reception details.
   ============================================================ */

/* ✏️ Filipino-style reception program.
   Picks up straight after the ceremony recessional (3:40 PM — see
   orderOfService in WeddingCeremony.jsx) and is crunched into
   4:00–7:00 PM, so the whole day wraps by early evening.
   Adjust times/entries to match your emcee's final script. */
const program = [
  { time: '4:00 PM', event: 'Cocktails & Photo Ops',  note: 'Welcome drinks in the garden right after the ceremony, while we finish our photos.' },
  { time: '4:20 PM', event: 'Guests Seated',           note: 'Kindly find your table before the grand entrance.' },
  { time: '4:25 PM', event: 'Grand Entrance',          note: 'Presentation of the entourage, then the newlyweds.' },
  { time: '4:35 PM', event: 'Invocation',              note: 'Opening prayer and grace before meals.' },
  { time: '4:40 PM', event: 'Welcome Remarks',         note: 'A short greeting from our emcee and both families.' },
  { time: '4:45 PM', event: 'Dinner Is Served',        note: 'Please enjoy the feast — our emcee will call each table.' },
  { time: '5:20 PM', event: 'Prenup AVP',              note: 'A look back at how the two of us got here.' },
  { time: '5:30 PM', event: 'Cake Cutting & Wine Toast', note: 'Followed by a toast led by our best man.' },
  { time: '5:45 PM', event: 'First Dance',             note: 'Our first dance as husband and wife, then with our parents.' },
  { time: '5:55 PM', event: 'Money Dance',             note: 'The prosperity dance — pin your blessings on the couple.' },
  { time: '6:10 PM', event: 'Ninong & Ninang Messages', note: 'Words of wisdom from our principal sponsors.' },
  { time: '6:30 PM', event: 'Garter & Bouquet Toss',   note: 'Games for our single guests — consider yourselves warned!' },
  { time: '6:40 PM', event: 'Thank You Message',       note: 'A few words of gratitude from the two of us.' },
  { time: '6:50 PM', event: 'Photo Ops per Table',     note: "We'll come around for a photo with every table." },
  { time: '7:00 PM', event: 'Last Song & Send-off',    note: 'One last dance together before we say goodnight.' },
]

export default function Reception() {
  return (
    <div className="cp-page">
      <div className="cp-breadcrumb">
        <Link to="/ceremony">Program</Link>
        <span>›</span>
        <span>Reception</span>
      </div>

      {/* ✏️ Page title — edit the eyebrow / title / date here */}
      <div className="cp-pagetitle">
        <p className="cp-pagetitle__pre">Join Us For</p>
        <h1 className="cp-pagetitle__title">The Reception</h1>
        <p className="cp-pagetitle__date">November 7, 2026 · 4:00 PM onwards</p>
        <span className="cp-pagetitle__rule" />
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
              <p>Purok 4, P. Reyes Street</p>
              <p className="cp-card__sub">Barangay Sipat, Plaridel, Bulacan</p>
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
            <img src="/photos/reception-venue-1.jpg" alt="Venue" />
            <img src="/photos/reception-venue-2.jpg" alt="Venue" />
            <img src="/photos/reception-venue-3.jpg" alt="Venue" />
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

        {/* Find Us — map */}
        <section className="cp-section">
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
