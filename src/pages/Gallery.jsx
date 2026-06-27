import React, { useState } from 'react'
import './Gallery.css'

/* ============================================================
   Gallery Page — Masonry layout with lightbox
   ✏️ Replace placeholder images with real prenup photos.
      Change the `photos` array: swap src with your image URLs.
      You can use '/photos/your-image.jpg' for local images
      placed in the /public/photos/ folder.
   ============================================================ */

// ✏️ Replace src and alt values with your real photos
// `span` controls height in the masonry grid: 1 = short, 2 = tall
const photos = [
  // ✏️ Replace files in /public/photos/ (gallery-1.jpg … gallery-9.jpg) to change photos
  { id: 1, src: '/photos/gallery-1.jpg', alt: 'Prenup photo 1', span: 2 },
  { id: 2, src: '/photos/gallery-2.jpg', alt: 'Prenup photo 2', span: 1 },
  { id: 3, src: '/photos/gallery-3.jpg', alt: 'Prenup photo 3', span: 1 },
  { id: 4, src: '/photos/gallery-4.jpg', alt: 'Prenup photo 4', span: 2 },
  { id: 5, src: '/photos/gallery-5.jpg', alt: 'Prenup photo 5', span: 1 },
  { id: 6, src: '/photos/gallery-6.jpg', alt: 'Prenup photo 6', span: 1 },
  { id: 7, src: '/photos/gallery-7.jpg', alt: 'Prenup photo 7', span: 2 },
  { id: 8, src: '/photos/gallery-8.jpg', alt: 'Prenup photo 8', span: 1 },
  { id: 9, src: '/photos/gallery-9.jpg', alt: 'Prenup photo 9', span: 1 },
]

export default function Gallery() {
  // lightbox state: null = closed, index = which photo is open
  const [lightbox, setLightbox] = useState(null)

  function openLightbox(index) { setLightbox(index) }
  function closeLightbox()     { setLightbox(null) }
  function prevPhoto() {
    setLightbox(i => (i - 1 + photos.length) % photos.length)
  }
  function nextPhoto() {
    setLightbox(i => (i + 1) % photos.length)
  }

  // Close lightbox on backdrop click
  function handleBackdrop(e) {
    if (e.target === e.currentTarget) closeLightbox()
  }

  return (
    <div className="gallery">
      <div className="gallery__header">
        <h1 className="section-title">Gallery</h1>
        <span className="section-divider" />
        <p className="gallery__sub">A glimpse of our prenuptial story</p>
      </div>

      {/* Masonry grid */}
      <div className="gallery__grid">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="gallery__item"
            style={{ gridRow: `span ${photo.span}` }}
            onClick={() => openLightbox(index)}
          >
            <img src={photo.src} alt={photo.alt} loading="lazy" />
            <div className="gallery__item-overlay">
              <span>View Photo</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="lightbox" onClick={handleBackdrop}>
          <button className="lightbox__close" onClick={closeLightbox}>✕</button>
          <button className="lightbox__prev"  onClick={prevPhoto}>‹</button>

          <div className="lightbox__img-wrap">
            <img
              src={photos[lightbox].src}
              alt={photos[lightbox].alt}
            />
            <p className="lightbox__counter">
              {lightbox + 1} / {photos.length}
            </p>
          </div>

          <button className="lightbox__next" onClick={nextPhoto}>›</button>
        </div>
      )}
    </div>
  )
}
