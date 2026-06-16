import React, { useEffect, useRef, useState } from 'react'
import './Story.css'

/* ============================================================
   Our Story — "The Film" (snap edition)

   Each chapter is a full-screen scene that SNAPS into place —
   one scroll advances to the next scene. As a scene lands, its
   cinematic entrance plays once: the image rises out of black
   with a slow Ken Burns drift while the title-card text fades
   up in sequence.

   Mechanism: a snap scroll-container (CSS scroll-snap) + an
   IntersectionObserver that toggles `in-view` to fire the
   entrance animation each time a scene arrives.

   ✏️ Replace `image` URLs with your real prenup/couple photos.
      Images live in /public/photos/ — reference as /photos/name.jpg
   ============================================================ */

const scenes = [
  {
    id: 1,
    chapter: 'How We Met',
    date: '2020',
    // ✏️ Replace with your real photo: '/photos/how-we-met.jpg'
    image: 'https://placehold.co/1600x900/3a2d22/E1CA96?text=How+We+Met',
    imageAlt: 'How we met',
    body: `Every love story begins with a moment — and ours was no different. We crossed paths at a time neither of us expected, and in that ordinary moment, something extraordinary quietly began.`,
  },
  {
    id: 2,
    chapter: 'The First Date',
    date: '2021',
    image: 'https://placehold.co/1600x900/5b2b2c/FFD9DA?text=The+First+Date',
    imageAlt: 'Our first date',
    body: `Nervous and excited in equal measure, we shared our first real evening together — coffee, laughter, the kind of honest talk that feels rare. It was enough to make us both certain we wanted a second.`,
  },
  {
    id: 3,
    chapter: 'Growing Together',
    date: '2022 – 2024',
    image: 'https://placehold.co/1600x900/2f3a2c/E1CA96?text=Growing+Together',
    imageAlt: 'Growing together',
    body: `Seasons changed, and so did we — together. Through ordinary Tuesdays and milestone moments, through challenges that tested us and joys that defined us, we chose each other, again and again.`,
  },
  {
    id: 4,
    chapter: 'The Proposal',
    date: '2025',
    image: 'https://placehold.co/1600x900/4a120f/E1CA96?text=The+Proposal',
    imageAlt: 'The proposal',
    body: `Under a sky neither of us will ever forget, the words finally came — simple, honest, from the heart. There was no need for grand gestures. The moment was already perfect.`,
  },
  {
    id: 5,
    chapter: 'Forever Begins',
    date: 'November 7, 2026',
    image: 'https://placehold.co/1600x900/7a3f1f/FFD9DA?text=Forever+Begins',
    imageAlt: 'Forever begins',
    body: `And now we stand at the beginning of forever. We invite our family and friends to witness us take this sacred step — to celebrate, to laugh and dance, and to remind us that love is always worth it.`,
  },
]

export default function Story() {
  const scrollRef = useRef(null)
  const sceneRefs = useRef([])
  const [active, setActive] = useState(0)

  // Fire each scene's entrance when it snaps into view; re-fires on return.
  useEffect(() => {
    const root = scrollRef.current
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            const idx = Number(entry.target.dataset.index)
            if (!Number.isNaN(idx)) setActive(idx)
          } else {
            entry.target.classList.remove('in-view')
          }
        })
      },
      { root, threshold: 0.55 }
    )
    sceneRefs.current.forEach(el => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const register = el => {
    if (el) sceneRefs.current[Number(el.dataset.index)] = el
  }

  // Replay — snap back to the opening title card
  const replay = () =>
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })

  return (
    <div className="film" ref={scrollRef}>

      {/* Moving film grain over the whole reel */}
      <div className="film__grain" aria-hidden="true" />

      {/* ── Opening title card ── */}
      <section className="film__scene film__intro in-view" data-index="0" ref={register}>
        <div className="film__intro-inner">
          <p className="film__credit">A Love Story</p>
          <h1 className="film__maintitle">Our Story</h1>
          <span className="film__rule" />
          <p className="film__tagline">Nimrod &amp; Jirah</p>
        </div>
        <div className="film__cue" aria-hidden="true">
          <span>Scroll to play</span>
          <span className="film__cue-line" />
        </div>
      </section>

      {/* ── Scenes ── */}
      {scenes.map((s, i) => (
        <section
          className="film__scene reel"
          key={s.id}
          data-index={i + 1}
          ref={register}
        >
          <div className="reel__media">
            <div
              className="reel__bg"
              style={{ backgroundImage: `url(${s.image})` }}
              role="img"
              aria-label={s.imageAlt}
            />
          </div>
          <div className="reel__scrim" aria-hidden="true" />

          <div className="reel__content">
            <span className="reel__num">{String(i + 1).padStart(2, '0')}</span>
            <h2 className="reel__title">{s.chapter}</h2>
            <span className="reel__date">{s.date}</span>
            <p className="reel__text">{s.body}</p>
          </div>

          {/* black crossfade — opaque until the scene lands */}
          <div className="reel__fade" aria-hidden="true" />
        </section>
      ))}

      {/* ── Closing frame ── */}
      <section
        className="film__scene film__intro film__intro--end"
        data-index={scenes.length + 1}
        ref={register}
      >
        <div className="film__intro-inner">
          <p className="film__credit">The Beginning</p>
          <h1 className="film__maintitle film__maintitle--sm">See you there</h1>
          <span className="film__rule" />
          <p className="film__tagline">November 7, 2026</p>
          <button className="film__replay" onClick={replay}>
            <span className="film__replay-icon">↺</span>
            Watch from the top
          </button>
        </div>
      </section>

      {/* Scene counter */}
      <div className={`film__counter ${active > 0 && active <= scenes.length ? 'show' : ''}`} aria-hidden="true">
        <span className="film__counter-num">{String(Math.min(active, scenes.length)).padStart(2, '0')}</span>
        <span className="film__counter-sep">/</span>
        <span className="film__counter-total">{String(scenes.length).padStart(2, '0')}</span>
      </div>

      {/* Progress ticks */}
      <div className="film__progress" aria-hidden="true">
        {scenes.map((_, i) => (
          <span
            key={i}
            className={`film__progress-dot ${i + 1 === active ? 'active' : ''} ${i + 1 < active ? 'passed' : ''}`}
          />
        ))}
      </div>

    </div>
  )
}
