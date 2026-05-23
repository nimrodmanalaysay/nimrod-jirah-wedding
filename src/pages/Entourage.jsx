import React from 'react'
import './Entourage.css'

/* ============================================================
   Entourage Page
   ✏️ Replace placeholder names in the `entourage` object below
      with the real wedding party members.
   ============================================================ */

// ✏️ Edit names here — add or remove items in each array
const entourage = {
  principalSponsors: {
    label: 'Principal Sponsors',
    icon: '✦',
    pairs: [
      { male: 'Mr. Juan dela Cruz',   female: 'Mrs. Maria dela Cruz' },
      { male: 'Mr. Pedro Santos',     female: 'Mrs. Ana Santos' },
      { male: 'Mr. Jose Reyes',       female: 'Mrs. Linda Reyes' },
    ],
  },
  bestMan:    { label: 'Best Man',    icon: '◈', members: ['Name Placeholder'] },
  maidHonor:  { label: 'Maid of Honor', icon: '◈', members: ['Name Placeholder'] },
  groomsmen:  {
    label: 'Groomsmen', icon: '♦',
    members: ['Groomsman One', 'Groomsman Two', 'Groomsman Three', 'Groomsman Four'],
  },
  bridesmaids: {
    label: 'Bridesmaids', icon: '♦',
    members: ['Bridesmaid One', 'Bridesmaid Two', 'Bridesmaid Three', 'Bridesmaid Four'],
  },
  ringBearer:  { label: 'Ring Bearer',  icon: '❧', members: ['Name Placeholder'] },
  flowerGirls: { label: 'Flower Girls', icon: '✿', members: ['Flower Girl One', 'Flower Girl Two'] },
  coinBearer:  { label: 'Coin Bearer',  icon: '❧', members: ['Name Placeholder'] },
  veilCord:    { label: 'Veil & Cord',  icon: '❧', members: ['Name One', 'Name Two'] },
}

/* Reusable card for a single member */
function MemberCard({ name }) {
  return (
    <div className="member-card">
      {/* Avatar circle — you can add a real photo here later */}
      <div className="member-card__avatar">
        {name.charAt(0)}
      </div>
      <p className="member-card__name">{name}</p>
    </div>
  )
}

/* Section block with title and cards */
function EntourageSection({ label, icon, members }) {
  return (
    <div className="entourage__section">
      <h3 className="entourage__section-title">
        <span className="entourage__section-icon">{icon}</span>
        {label}
      </h3>
      <div className="entourage__cards">
        {members.map((name, i) => (
          <MemberCard key={i} name={name} />
        ))}
      </div>
    </div>
  )
}

export default function Entourage() {
  return (
    <div className="entourage">
      <div className="entourage__header">
        <h1 className="section-title">Entourage</h1>
        <span className="section-divider" />
        <p className="entourage__sub">The wonderful people walking with us</p>
      </div>

      {/* Principal Sponsors (pairs) */}
      <div className="entourage__section">
        <h3 className="entourage__section-title">
          <span className="entourage__section-icon">✦</span>
          {entourage.principalSponsors.label}
        </h3>
        <div className="entourage__pairs">
          {entourage.principalSponsors.pairs.map((pair, i) => (
            <div key={i} className="pair-card">
              <p className="pair-card__male">{pair.male}</p>
              <span className="pair-card__and">&amp;</span>
              <p className="pair-card__female">{pair.female}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Best Man & Maid of Honor side by side */}
      <div className="entourage__honor-row">
        <EntourageSection {...entourage.bestMan} />
        <div className="entourage__honor-divider" />
        <EntourageSection {...entourage.maidHonor} />
      </div>

      {/* Groomsmen & Bridesmaids */}
      <EntourageSection {...entourage.groomsmen} />
      <EntourageSection {...entourage.bridesmaids} />

      {/* Others */}
      <div className="entourage__others">
        <EntourageSection {...entourage.ringBearer} />
        <EntourageSection {...entourage.flowerGirls} />
        <EntourageSection {...entourage.coinBearer} />
        <EntourageSection {...entourage.veilCord} />
      </div>
    </div>
  )
}
