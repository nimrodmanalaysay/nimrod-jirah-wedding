import React, { useEffect, useRef, useState } from 'react'
import './Story.css'

/* ============================================================
   Our Story — "The Film"

   A cinematic, scroll-controlled story reel. Each chapter is a
   full-bleed scene that pins to the screen while you scroll
   through it. Scroll position scrubs the whole frame:

     • the image drifts/zooms (Ken Burns) as you move
     • title-card text rises in staggered, like film credits
     • each scene fades through black on the way in and out

   Built with React refs + a rAF scroll loop feeding CSS custom
   properties; all the motion lives in CSS. No libraries.

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

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

export default function Story() {
  const reelRefs = useRef([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const reels = reelRefs.current.filter(Boolean)

    // The scrub runs for everyone. Under reduced-motion we keep this gentle
    // scroll-linked OPACITY fade but the CSS strips the zoom/parallax/loops,
    // so the story still "plays" as you scroll without the heavy motion.

    let raf = 0
    function update() {
      raf = 0
      const vh = window.innerHeight
      let current = 0

      reels.forEach(reel => {
        const rect  = reel.getBoundingClientRect()
        const total = rect.height - vh
        // p: 0 as the scene pins, 1 as it scrolls away
        const p = total > 0 ? clamp(-rect.top / total, 0, 1) : (rect.top <= 0 ? 1 : 0)

        // staggered entrances (image → number → title → text)
        const tier = off => clamp((p - off) / 0.24, 0, 1)
        const exit = clamp((p - 0.74) / 0.18, 0, 1)
        // black crossfade at the very start and end of each scene
        const fade = clamp(Math.max((0.14 - p) / 0.14, (p - 0.86) / 0.14), 0, 1)

        reel.style.setProperty('--p',    p.toFixed(4))
        reel.style.setProperty('--e0',   tier(0.06).toFixed(4))
        reel.style.setProperty('--e1',   tier(0.12).toFixed(4))
        reel.style.setProperty('--e2',   tier(0.18).toFixed(4))
        reel.style.setProperty('--e3',   tier(0.24).toFixed(4))
        reel.style.setProperty('--exit', exit.toFixed(4))
        reel.style.setProperty('--fade', fade.toFixed(4))

        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) {
          current = Number(reel.dataset.index)
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
    <div className="film">

      {/* Moving film grain over everything */}
      <div className="film__grain" aria-hidden="true" />

      {/* ── Opening title card ── */}
      <section className="film__intro">
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
          className="reel"
          key={s.id}
          data-index={i + 1}
          ref={el => (reelRefs.current[i] = el)}
        >
          <div className="reel__pin">
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

            {/* black crossfade overlay */}
            <div className="reel__fade" aria-hidden="true" />
          </div>
        </section>
      ))}

      {/* ── Closing frame ── */}
      <section className="film__intro film__intro--end">
        <div className="film__intro-inner">
          <p className="film__credit">The Beginning</p>
          <h1 className="film__maintitle film__maintitle--sm">See you there</h1>
          <span className="film__rule" />
          <p className="film__tagline">November 7, 2026</p>
          <button
            className="film__replay"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span className="film__replay-icon">↺</span>
            Watch from the top
          </button>
        </div>
      </section>

      {/* Scene counter */}
      <div className={`film__counter ${active > 0 ? 'show' : ''}`} aria-hidden="true">
        <span className="film__counter-num">{String(active).padStart(2, '0')}</span>
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
