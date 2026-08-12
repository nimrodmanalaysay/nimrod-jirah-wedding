import React from 'react'
import PageHero from '../components/PageHero'
import './Entourage.css'

/* ============================================================
   Entourage Page
   ✏️ Replace placeholder names/roles in the data below.
   No avatars or profile images — name + role only.
   ============================================================ */

// ✏️ Parents of the couple — rendered as the first section on the page.
//    ⚠️ Florencio was given to us as "Mother"; taken as Father, matching the
//    bride's Mother/Father pairing. Correct here if that is wrong.
//    Roles stay short because the column label already says whose parents.
const brideParents = [
  { name: 'Elizabeth Austin', role: 'Mother' },
  { name: 'Jonathan Austin',  role: 'Father' },
]
const groomParents = [
  { name: 'Rosemarie Manalaysay', role: 'Mother' },
  { name: 'Florencio Manalaysay', role: 'Father' },
]

// Principal sponsors — Ninong (godfathers) and Ninang (godmothers).
// ✏️ Order matches the printed invitation, and the two lists are rendered as
//    side-by-side columns, so row N on the left pairs with row N on the right.
//    Keep them the same length and in step — reordering one alone breaks the
//    pairing (e.g. the Aguilars and the Santoses sit together by design).
const ninongs = [
  'Mr. Ronald Aguilar',
  'Mr. Allan Santos',
  'Mr. Gabino Giron Jr.',
  'Mr. Ricky Bajarin',
  'Mr. Felipe Manalaysay',
  'Mr. Marlon Manalaysay',
  'Mr. Thomas Avilla Jr.',
  'Mr. Jun Tiongson',
]
const ninangs = [
  'Mrs. Marilyn Aguilar',
  'Mrs. Mary Jane Pangan-Santos',
  'Mrs. Josephine Lopez',
  'Atty. Mildred Ople',
  'Mrs. Jocefina Reyes',
  'Mrs. Cristina Domingo',
  'Mrs. Mel Dingayan',
  'Mrs. Rose Calonzo',
]

const bestMan    = { name: 'Jaymar Manalaysay',        role: 'Best Man'      }
const maidHonor  = { name: 'Jemimah Keziah Austin',   role: 'Maid of Honor' }

// ✏️ Exactly 3 groomsmen
const groomsmen = [
  { name: 'Grant Dave Gutierrez', role: 'Groomsman' },
  { name: 'Titus Sandoval',       role: 'Groomsman' },
  { name: 'Joshua Capili',        role: 'Groomsman' },
]

// ✏️ Exactly 3 bridesmaids
const bridesmaids = [
  { name: 'Elaica Miras',    role: 'Bridesmaid' },
  { name: 'Michaela Giron',  role: 'Bridesmaid' },
  { name: 'Camille Sison',   role: 'Bridesmaid' },
]

const others = [
  { name: 'Matthew Robles',        role: 'Ring Bearer'  },
  { name: 'Beadz Peolo Carangan',  role: 'Coin Bearer'  },
  { name: 'Alrenz Reyes',          role: 'Bible Bearer' },
  { name: 'Princess Ferrer',       role: 'Flower Girl'  },
  { name: 'Janella Lopez',         role: 'Flower Girl'  },
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

      {/* Page hero */}
      <PageHero
        eyebrow="Nimrod & Jirah"
        title="Entourage"
        subtitle="The wonderful people walking with us"
      />

      {/* ── Our Parents ── first section on the page */}
      <Section icon="♡" label="Our Parents">
        <div className="ent-party-grid">

          {/* Bride's parents */}
          <div className="ent-party-col">
            <p className="ent-party-col__label">Parents of the Bride</p>
            {brideParents.map((p, i) => (
              <NameCard key={i} name={p.name} role={p.role} />
            ))}
          </div>

          {/* Centre ornament */}
          <div className="ent-party-center">
            <span className="ent-party-ornament">❧</span>
          </div>

          {/* Groom's parents */}
          <div className="ent-party-col">
            <p className="ent-party-col__label">Parents of the Groom</p>
            {groomParents.map((p, i) => (
              <NameCard key={i} name={p.name} role={p.role} />
            ))}
          </div>

        </div>
      </Section>

      {/* ── Principal Sponsors ── */}
      <Section icon="✦" label="Principal Sponsors">
        <div className="ent-party-grid">

          {/* Ninong column */}
          <div className="ent-party-col">
            <p className="ent-party-col__label">Ninong</p>
            {ninongs.map((name, i) => (
              <div key={i} className="name-card">
                <p className="name-card__name">{name}</p>
              </div>
            ))}
          </div>

          {/* Centre ornament */}
          <div className="ent-party-center">
            <span className="ent-party-ornament">❧</span>
          </div>

          {/* Ninang column */}
          <div className="ent-party-col">
            <p className="ent-party-col__label">Ninang</p>
            {ninangs.map((name, i) => (
              <div key={i} className="name-card">
                <p className="name-card__name">{name}</p>
              </div>
            ))}
          </div>

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
