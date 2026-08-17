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

   ✏️ Photos per chapter. Each scene cross-fades through its own list
      while it is the scene on screen, so a chapter can hold as many or
      as few photos as you have — one is fine, it just sits still.

      Files live in /public/photos/story/. Generate them from the
      originals in "photos-src/Our story photos/" — the names there have
      spaces, which would need %20 escaping in every URL, so the resize
      step writes slugged copies instead.
   ============================================================ */

const SLIDE_MS = 4500          // how long each photo holds before the next

const scenes = [
  {
    id: 1,
    chapter: 'How We Met',
    date: '2019',
    images: [
      '/photos/story/how-we-met-1.jpg',
      '/photos/story/how-we-met-2.jpg',
      '/photos/story/how-we-met-3.jpg',
      '/photos/story/how-we-met-4.jpg',
      '/photos/story/how-we-met-5.jpg',
      '/photos/story/how-we-met-6.jpg',
      '/photos/story/how-we-met-7.jpg',
    ],
    imageAlt: 'How we met',
    body: `We first met as college classmates, sharing classes, friendships, and countless ordinary moments together. Unknown to each other, we both had quiet crushes that remained hidden behind our friendship. When the pandemic changed the world, we found comfort in endless conversations through our screens, bringing us closer than ever before.`,
  },
  {
    id: 2,
    chapter: 'The First Date',
    date: 'September 25, 2021',
    images: [
      '/photos/story/first-date-1.jpg',
      '/photos/story/first-date-2.jpg',
    ],
    imageAlt: 'Our first date',
    body: `After months of talking and getting to know each other, we finally took a leap of faith and met near our university. What started as a simple date quickly felt natural, effortless, and special. By the end of that day, our hearts knew we had found something worth holding on to.`,
  },
  {
    id: 3,
    chapter: 'Growing Together',
    date: '2021 – 2025',
    images: [
      '/photos/story/growing-together-1.jpg',
      '/photos/story/growing-together-2.jpg',
      '/photos/story/growing-together-3.jpg',
      '/photos/story/growing-together-4.jpg',
      '/photos/story/growing-together-5.jpg',
      '/photos/story/growing-together-6.jpg',
    ],
    imageAlt: 'Growing together',
    body: `Over the years, we navigated life's highs and lows side by side, learning and growing through every season. We built a relationship grounded in love, trust, faith, and friendship, strengthening our bond with each passing year. Through every challenge and celebration, we chose each other again and again.`,
  },
  {
    id: 4,
    chapter: 'The Proposal',
    date: 'December 23, 2025',
    images: [
      '/photos/story/proposal-1.jpg',
      '/photos/story/proposal-2.jpg',
      '/photos/story/proposal-3.jpg',
    ],
    imageAlt: 'The proposal',
    body: `Amid the breathtaking sea of clouds in Buscalan, a moment we would never forget unfolded. Surrounded by the beauty of the mountains, Nimrod asked the question that would change our lives forever. With a joyful heart and happy tears, Jirah said, "Yes!"`,
  },
  {
    id: 5,
    chapter: 'Forever Begins',
    date: 'November 7, 2026',
    images: [
      '/photos/story/forever-begins-1.jpg',
      '/photos/story/forever-begins-2.jpg',
      '/photos/story/forever-begins-3.jpg',
      '/photos/story/forever-begins-4.jpg',
    ],
    imageAlt: 'Forever begins',
    body: `From college classmates to lifelong partners, our journey has led us to this beautiful day. Surrounded by the people we love, we will exchange vows and begin a new chapter together. As we say "I do," we look forward to a lifetime of love, faith, and shared adventures.`,
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

  // Cross-fade the photos of whichever scene is on screen. One shared counter
  // is enough — only the active scene is visible, and it resets on every scene
  // change so each chapter starts from its first photo.
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    setSlide(0)
    const count = scenes[active - 1]?.images.length ?? 0
    if (count < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const t = setInterval(() => setSlide(i => i + 1), SLIDE_MS)
    return () => clearInterval(t)
  }, [active])

  // Warm the next chapter's first photo so arriving at it isn't a black frame
  useEffect(() => {
    const next = scenes[active]?.images[0]
    if (next) { const img = new Image(); img.src = next }
  }, [active])

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
          {/* Every photo in the chapter is a stacked layer; only the current
              one is opaque. Scenes that aren't on screen stay on their first
              photo, so the counter only ever moves the visible scene. */}
          <div className="reel__media" role="img" aria-label={s.imageAlt}>
            {s.images.map((src, n) => {
              const current = active === i + 1 ? slide % s.images.length : 0
              return (
                <div
                  key={src}
                  className={`reel__bg ${n === current ? 'is-current' : ''}`}
                  style={{ backgroundImage: `url(${src})` }}
                />
              )
            })}
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
