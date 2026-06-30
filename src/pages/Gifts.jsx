import React from 'react'
import PageHero from '../components/PageHero'
import './Gifts.css'

/* ============================================================
   Gifts Page
   ✏️ Replace QR code placeholders with real images.
      Place your QR images in /public/photos/ and update src.
   ============================================================ */

const giftOptions = [
  {
    id: 'GCASH',
    label: 'GCash',
    // ✏️ Replace /public/photos/gcash.jpg with your real GCash QR
    qr: '/photos/gcash.jpg',
  },
  {
    id: 'BPI',
    label: 'BPI Bank',
    // ✏️ Replace /public/photos/bpi.jpg with your real BPI QR
    qr: '/photos/bpi.jpg',
  },
]

export default function Gifts() {
  return (
    <div className="gifts-page">

      {/* Hero */}
      <PageHero
        eyebrow="Nimrod & Jirah"
        title="Gifts"
        subtitle="With gratitude and love"
      />

      {/* Thank you message */}
      <div className="gifts-message fade-up">
        <div className="gifts-message__icon">💝</div>
        <p className="gifts-message__text">
          Your presence at our wedding is the greatest gift we could ever ask for.
          <br />
          We are so grateful to have you celebrate this milestone with us.
        </p>
        <p className="gifts-message__note">
          For those who wish to give a monetary gift, you may use any of the
          options below. We truly appreciate your generosity and love.
        </p>
      </div>

      {/* QR Code cards */}
      <div className="gifts-qr-grid">
        {giftOptions.map(opt => (
          <div key={opt.id} className="gifts-qr-card">
            <div className="gifts-qr-card__header">
              <span className="gifts-qr-card__icon">{opt.icon}</span>
              <h3 className="gifts-qr-card__label">{opt.label}</h3>
            </div>

            {/* QR placeholder */}
            <div className="gifts-qr-card__img-wrap">
              <img
                src={opt.qr}
                alt={`${opt.label} QR Code`}
                className="gifts-qr-card__img"
              />
            </div>

          </div>
        ))}
      </div>

      {/* Physical gifts note */}
      <div className="gifts-physical">
        <span className="gifts-physical__icon">🎁</span>
        <div>
          <p className="gifts-physical__title">Physical Gifts</p>
          <p className="gifts-physical__desc">
            A gift table will be available at the venue reception.
            Wrapped gifts are welcome and appreciated.
          </p>
        </div>
      </div>

      {/* Closing note */}
      <p className="gifts-closing">
        Thank you from the bottom of our hearts. ♥
      </p>

    </div>
  )
}
