import React from 'react'
import { Routes, Route } from 'react-router-dom'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Pages
import Home from './pages/Home'
import Story from './pages/Story'
import Entourage from './pages/Entourage'
import RSVP from './pages/RSVP'
import Gallery from './pages/Gallery'

/* ============================================================
   App — Root layout. All pages share the Navbar and Footer.
   Add new pages here under <Routes>.
   ============================================================ */
export default function App() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/story"      element={<Story />} />
          <Route path="/entourage"  element={<Entourage />} />
          <Route path="/rsvp"       element={<RSVP />} />
          <Route path="/gallery"    element={<Gallery />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
