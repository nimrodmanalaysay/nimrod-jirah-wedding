import React from 'react'
import './CeremonyPages.css'
import { MAP_LINK, MAP_EMBED } from '../utils/venue'

/* ============================================================
   Reception Page
   ✏️ Replace placeholder content with real reception details.
   ============================================================ */

/* ✏️ Reception programme, in the couple's running order.
   Picks up after the ceremony recessional (4:10 PM — see orderOfService in
   WeddingCeremony.jsx), leaving 20 minutes for post-ceremony photos, and runs
   4:30–7:00 PM.
   Only three times were fixed: the 4:30 start, dinner at 6:00 PM and the 7:00 PM
   finish. The rest are evenly spaced to fill those — nine items across the 90
   minutes before dinner, then three after — so adjust to your emcee's final
   script. */
const program = [
  { time: '4:30 PM', event: 'Guest Seating',            note: 'Kindly find your table as you arrive.' },
  { time: '4:40 PM', event: 'Playing AVP',              note: 'A look back at how the two of us got here.' },
  { time: '4:50 PM', event: 'Grand Entrance',           note: 'Presentation of the entourage, then the newlyweds.' },
  { time: '5:00 PM', event: 'Welcome Remarks & Prayer', note: 'A short greeting from both families, and grace before meals.' },
  { time: '5:10 PM', event: 'First Dance',              note: 'Our first dance as husband and wife.' },
  { time: '5:20 PM', event: 'Cake Cutting & Wine Toast', note: 'Followed by a toast led by our best man.' },
  { time: '5:30 PM', event: 'Parent Dances',            note: 'A dance with the parents who raised us.' },
  { time: '5:40 PM', event: 'Games',                    note: 'A little fun with our guests — consider yourselves warned!' },
  { time: '5:50 PM', event: 'Photo Ops per Table',      note: "We'll come around for a photo with every table." },
  { time: '6:00 PM', event: 'Dinner',                   note: 'Please enjoy the feast — our emcee will call each table.' },
  { time: '6:30 PM', event: 'Prosperity Dance',         note: 'The money dance — pin your blessings on the couple.' },
  { time: '6:45 PM', event: 'Same Day Edit (SDE)',      note: 'A short film of today, cut and screened before the night ends.' },
  { time: '7:00 PM', event: 'Last Song & Send-off',     note: 'One last dance together before we say goodnight.' },
]

export default function Reception() {
  return (
    <div className="cp-page">
      <div className="cp-breadcrumb">
        {/* Plain text — the /ceremony hub page no longer exists */}
        <span>Program</span>
        <span>›</span>
        <span>Reception</span>
      </div>

      {/* ✏️ Page title — edit the eyebrow / title / date here */}
      <div className="cp-pagetitle">
        <p className="cp-pagetitle__pre">Join Us For</p>
        <h1 className="cp-pagetitle__title">The Reception</h1>
        <p className="cp-pagetitle__date">November 7, 2026 · 4:30 PM onwards</p>
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

        {/* ✏️ One real photo of the venue. Drop a replacement at
            /public/photos/reception-venue-1.jpg to change it. */}
        <section className="cp-section cp-section--blush">
          <h2 className="cp-section__title">The Venue</h2>
          <div className="cp-img-grid cp-img-grid--single">
            <img
              src="/photos/reception-venue-1.jpg"
              alt="Grass Garden, the ceremony and reception venue"
              width="800"
              height="600"
              loading="lazy"
              decoding="async"
            />
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
