import React, { useState } from 'react'
import PageHero from '../components/PageHero'
import './FAQs.css'

/* ============================================================
   FAQs Page — accordion-style collapsible items
   ✏️ Edit the `faqs` array to add, remove, or update questions.
   ============================================================ */

const faqs = [
  {
    q: 'What time should I arrive?',
    a: 'We recommend arriving by 2:15 PM for the ceremony, which begins at 2:30 PM sharp. Doors open at 2:00 PM. The reception follows straight after at the same venue — please be seated by 4:15 PM for the grand entrance.',
  },
  {
    q: 'Can I bring a plus one?',
    a: 'Due to venue capacity, we can only accommodate the guests listed on the invitation. If your invitation says "and Guest," you are welcome to bring one. Please indicate this in your RSVP so we can prepare accordingly.',
  },
  {
    q: 'Is parking available?',
    a: 'Yes! Free on-site parking is available for all guests. Parking attendants will be present to guide you. We recommend carpooling when possible to ease traffic flow.',
  },
  {
    q: 'What is the dress code?',
    a: 'The dress code is Formal / Semi-Formal. We encourage guests to wear earth tones, soft blush, sage green, or champagne gold. Please avoid wearing white or ivory dresses (reserved for the bride). See our Dress Code page for more details.',
  },
  {
    q: 'Will the ceremony be indoors or outdoors?',
    a: 'The ceremony will be held outdoors in the garden. The reception will move to the indoor hall afterward. We suggest bringing a small fan and wearing comfortable footwear suitable for outdoor settings.',
  },
  {
    q: 'Can I take photos during the ceremony?',
    a: 'We have a professional photographer and videographer capturing every moment. During the ceremony, we kindly ask that guests remain seated and refrain from stepping into the aisle to take photos. After the ceremony, photo opportunities will be available.',
  },
  {
    q: 'Are children welcome?',
    a: 'We love children and welcome them warmly! Please indicate the number of children in your RSVP so we can prepare accordingly. Note that the ceremony is an intimate setting — please ensure little ones are supervised at all times.',
  },
  {
    q: 'Is there a gift registry?',
    a: 'Your presence is the greatest gift! For those who wish to give, we have a Gifts page with GCash and bank transfer details. Physical gifts may be left at the gift table at the venue.',
  },
  {
    q: 'What should I do if I cannot attend?',
    a: 'We completely understand. Please let us know via the RSVP page as soon as possible so we can finalize our headcount. Your kind thoughts and well wishes mean the world to us.',
  },
  {
    q: 'Will there be a shuttle service?',
    a: 'Shuttle service details will be shared closer to the event date via email. In the meantime, the venue is accessible by private car or ridesharing services such as Grab.',
  },
]

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={`faq-item ${open ? 'faq-item--open' : ''}`}>
      <button
        className="faq-item__q"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{question}</span>
        <span className="faq-item__chevron" aria-hidden="true">
          {open ? '−' : '+'}
        </span>
      </button>
      <div className="faq-item__body">
        {/* inner wrapper holds the padding so it collapses fully when closed */}
        <div className="faq-item__body-inner">
          <p className="faq-item__a">{answer}</p>
        </div>
      </div>
    </div>
  )
}

export default function FAQs() {
  const [search, setSearch] = useState('')

  const filtered = faqs.filter(
    f =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="faqs-page">
      <PageHero
        eyebrow="Nimrod & Jirah"
        title="FAQs"
        subtitle="Everything you'd like to know"
      />

      {/* Search */}
      <div className="faqs-search">
        <input
          type="text"
          placeholder="Search questions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search FAQs"
        />
        {search && (
          <button onClick={() => setSearch('')} aria-label="Clear search">✕</button>
        )}
      </div>

      {/* FAQ list */}
      <div className="faqs-list">
        {filtered.length > 0
          ? filtered.map((f, i) => (
              <FAQItem key={i} question={f.q} answer={f.a} />
            ))
          : (
            <p className="faqs-empty">No questions match your search.</p>
          )
        }
      </div>

      {/* Still have questions */}
      <div className="faqs-footer">
        <p>Still have questions?</p>
        <p className="faqs-footer__contact">
          Reach out to us at{' '}
          {/* ✏️ Replace with your real email */}
          <a href="mailto:nimrodandjirah@email.com">nimrodandjirah@email.com</a>
        </p>
      </div>
    </div>
  )
}
