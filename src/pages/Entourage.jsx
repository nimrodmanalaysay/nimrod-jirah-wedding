import React from 'react'
import './Entourage.css'

/* ============================================================
   Entourage Page
   ✏️ Replace placeholder names/roles in the data below.
   No avatars or profile images — name + role only.
   ============================================================ */

const principalSponsors = [
  { male: 'Mr. Juan dela Cruz',   female: 'Mrs. Maria dela Cruz' },
  { male: 'Mr. Pedro Santos',     female: 'Mrs. Ana Santos' },
  { male: 'Mr. Jose Reyes',       female: 'Mrs. Linda Reyes' },
]

const bestMan    = { name: 'Name Placeholder',  role: 'Best Man'      }
const maidHonor  = { name: 'Name Placeholder',  role: 'Maid of Honor' }

// ✏️ Exactly 3 groomsmen
const groomsmen = [
  { name: 'Groomsman One',   role: 'Groomsman' },
  { name: 'Groomsman Two',   role: 'Groomsman' },
  { name: 'Groomsman Three', role: 'Groomsman' },
]

// ✏️ Exactly 3 bridesmaids
const bridesmaids = [
  { name: 'Bridesmaid One',   role: 'Bridesmaid' },
  { name: 'Bridesmaid Two',   role: 'Bridesmaid' },
  { name: 'Bridesmaid Three', role: 'Bridesmaid' },
]

const others = [
  { name: 'Name Placeholder', role: 'Ring Bearer'  },
  { name: 'Name Placeholder', role: 'Coin Bearer'  },
  { name: 'Flower Girl One',  role: 'Flower Girl'  },
  { name: 'Flower Girl Two',  role: 'Flower Girl'  },
  { name: 'Name One',         role: 'Veil'         },
  { name: 'Name Two',         role: 'Cord'         },
]

/* ---- Reusable name card (no avatar) ---- */
function NameCard({ name, role }) {
  return (
    <div className="name-card">
      <p className="name-card__role">{role}</p>
      <p className="name-card__name">{name}</p>
    </div>
  )
}

/* ---- Section wrapper ---- */
function Section({ icon, label, children }) {
  return (
    <div className="ent-section">
      <div className="ent-section__heading">
        <span className="ent-section__rule" />
        <h3 className="ent-section__title">
          <span className="ent-section__icon">{icon}</span>
          {label}
        </h3>
        <span className="ent-section__rule" />
      </div>
      {children}
    </div>
  )
}

export default function Entourage() {
  return (
    <div className="entourage">

      {/* Page header */}
      <div className="entourage__header">
        <h1 className="section-title">Entourage</h1>
        <span className="section-divider" />
        <p className="entourage__sub">The wonderful people walking with us</p>
      </div>

      {/* ── Principal Sponsors ── */}
      <Section icon="✦" label="Principal Sponsors">
        <div className="ent-pairs">
          {principalSponsors.map((p, i) => (
            <div key={i} className="pair-card">
              <p className="pair-card__name">{p.male}</p>
              <span className="pair-card__and">&amp;</span>
              <p className="pair-card__name">{p.female}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Best Man & Maid of Honor ── */}
      <Section icon="◈" label="Principal Party">
        <div className="ent-honor-row">
          <NameCard name={bestMan.name}   role={bestMan.role}   />
          <div className="ent-honor-divider" />
          <NameCard name={maidHonor.name} role={maidHonor.role} />
        </div>
      </Section>

      {/* ── Groomsmen & Bridesmaids ── */}
      <Section icon="♦" label="Groomsmen &amp; Bridesmaids">
        <div className="ent-party-grid">

          {/* Groomsmen column */}
          <div className="ent-party-col">
            <p className="ent-party-col__label">Groomsmen</p>
            {groomsmen.map((m, i) => (
              <NameCard key={i} name={m.name} role={m.role} />
            ))}
          </div>

          {/* Centre ornament */}
          <div className="ent-party-center">
            <span className="ent-party-ornament">❧</span>
          </div>

          {/* Bridesmaids column */}
          <div className="ent-party-col">
            <p className="ent-party-col__label">Bridesmaids</p>
            {bridesmaids.map((m, i) => (
              <NameCard key={i} name={m.name} role={m.role} />
            ))}
          </div>

        </div>
      </Section>

      {/* ── Others ── */}
      <Section icon="✿" label="Special Roles">
        <div className="ent-others-grid">
          {others.map((m, i) => (
            <NameCard key={i} name={m.name} role={m.role} />
          ))}
        </div>
      </Section>

    </div>
  )
}
