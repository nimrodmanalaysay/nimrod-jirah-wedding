import React, { useEffect, useRef, useState } from 'react'
import './Story.css'

/* ============================================================
   Our Story Page — scroll-scrubbed chapters

   Each chapter sits in a tall "track". Inside it, a sticky panel
   pins to the screen while you scroll through the track, and the
   animation (image scale/parallax, text rise + fade) is scrubbed
   directly from scroll progress — forward when you scroll down,
   backward when you scroll up. Apple-style scroll storytelling.

   ✏️ Replace `image` URLs with your real prenup/couple photos.
      Images live in /public/photos/ — reference as /photos/name.jpg
   ============================================================ */

const slides = [
  {
    id: 1,
    chapter: 'Chapter 1',
    title: 'How We Met',
    date: '2020',
    icon: '✦',
    // ✏️ Replace with your real photo: '/photos/how-we-met.jpg'
    image: 'https://placehold.co/680x380/E1CA96/691B19?text=How+We+Met',
    imageAlt: 'How we met',
    body: `Every love story begins with a moment — and ours was no different. We crossed paths at a time neither of us expected, and in that ordinary moment, something extraordinary quietly began. It started simply: a glance, a smile, a conversation that stretched beyond any expected end.`,
  },
  {
    id: 2,
    chapter: 'Chapter 2',
    title: 'The First Date',
    date: '2021',
    icon: '♡',
    image: 'https://placehold.co/680x380/FFD9DA/691B19?text=The+First+Date',
    imageAlt: 'Our first date',
    body: `Nervous and excited in equal measure, we shared our first real evening together. Simple as it was — coffee, laughter, the kind of honest talk that feels rare — it was enough to make us both certain we wanted a second. Time moved differently that night.`,
  },
  {
    id: 3,
    chapter: 'Chapter 3',
    title: 'Growing Together',
    date: '2022 – 2024',
    icon: '❧',
    image: 'https://placehold.co/680x380/556251/E1CA96?text=Growing+Together',
    imageAlt: 'Growing together',
    body: `Seasons changed, and so did we — together. Through ordinary Tuesdays and milestone moments, through challenges that tested us and joys that defined us, we chose each other, again and again. Distance was just distance. Silence was never empty.`,
  },
  {
    id: 4,
    chapter: 'Chapter 4',
    title: 'The Proposal',
    date: '2025',
    icon: '◈',
    image: 'https://placehold.co/680x380/691B19/E1CA96?text=The+Proposal',
    imageAlt: 'The proposal',
    body: `Under a sky neither of us will ever forget, the words finally came — simple, honest, from the heart. There was no need for grand gestures. The moment was already perfect. She said yes before the question was even finished.`,
  },
  {
    id: 5,
    chapter: 'Chapter 5',
    title: 'Forever Begins',
    date: 'November 7, 2026',
    icon: '✿',
    image: 'https://placehold.co/680x380/BD6738/FFD9DA?text=Forever+Begins',
    imageAlt: 'Forever begins',
    body: `And now we stand at the beginning of forever. We invite our family and friends to witness us take this sacred step — to celebrate with us, to laugh and dance, and to remind us that love is always worth it. We cannot wait to see you there.`,
  },
]

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export default function Story() {
  const trackRefs = useRef([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const tracks = trackRefs.current.filter(Boolean)

    // Reduced motion: show everything fully assembled, skip scrubbing.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tracks.forEach(t => {
        t.style.setProperty('--img', '1')
        t.style.setProperty('--txt', '1')
        t.style.setProperty('--p', '0.5')
      })
      return
    }

    let raf = 0
    function update() {
      raf = 0
      const vh = window.innerHeight
      let current = 0

      tracks.forEach(track => {
        const rect  = track.getBoundingClientRect()
        const total = rect.height - vh           // scroll distance while pinned

        // p: 0 when the panel first pins, 1 when the track scrolls out
        const p = total > 0 ? clamp(-rect.top / total, 0, 1) : (rect.top <= 0 ? 1 : 0)

        // Staggered scrub values — image leads, text follows
        const img = clamp((p - 0.05) / 0.40, 0, 1)
        const txt = clamp((p - 0.16) / 0.40, 0, 1)

        track.style.setProperty('--p',   p.toFixed(4))
        track.style.setProperty('--img', img.toFixed(4))
        track.style.setProperty('--txt', txt.toFixed(4))

        // Active chapter = the one straddling the viewport's middle
        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) {
          current = Number(track.dataset.index)
        }
      })

      setActive(current)
    }

    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="story">

      {/* Intro screen */}
      <section className="story__section story__section--intro">
        <div className="story__intro-inner">
          <h1 className="section-title">Our Story</h1>
          <span className="section-divider" />
          <p className="story__sub">The journey that brought us here</p>
          <div className="story__scroll-cue">
            <span>Scroll to begin</span>
            <span className="story__scroll-arrow">↓</span>
          </div>
        </div>
      </section>

      {/* Scroll-scrubbed chapters */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`story__track ${i % 2 === 1 ? 'reverse' : ''}`}
          data-index={i + 1}
          ref={el => (trackRefs.current[i] = el)}
        >
          <div className="story__pin">
            <div className="story__chapter-inner">
              <div className="story__img-wrap">
                <img
                  src={slide.image}
                  alt={slide.imageAlt}
                  className="story__img"
                  loading="lazy"
                />
              </div>

              <div className="story__card-body">
                <span className="story__chapter-icon">{slide.icon}</span>
                <p className="story__chapter">{slide.chapter}</p>
                <h2 className="story__title">{slide.title}</h2>
                <p className="story__date">{slide.date}</p>
                <p className="story__body">{slide.body}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Scroll progress indicator (non-interactive) */}
      <div className="story__progress" aria-hidden="true">
        {[{ id: 'intro' }, ...slides].map((_, i) => (
          <span
            key={i}
            className={`story__progress-dot ${i === active ? 'active' : ''} ${i < active ? 'passed' : ''}`}
          />
        ))}
      </div>

    </div>
  )
}
