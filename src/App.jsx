import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'

// Layout
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PageTransition from './components/PageTransition'

// Pages
import Home from './pages/Home'
import Story from './pages/Story'
import Entourage from './pages/Entourage'
import RSVP from './pages/RSVP'
import Gallery from './pages/Gallery'

/* ============================================================
   App — Root layout. All pages share the Navbar and Footer.
   PageTransition wraps the routes to animate between pages.
   Add new pages here under <Routes>.
   ============================================================ */
export default function App() {
  const location = useLocation()

  return (
    <>
      <Navbar />
      <PageTransition>
        <main>
          {/* key={location.pathname} remounts routes on navigation
              so PageTransition detects the path change */}
          <Routes location={location} key={location.pathname}>
            <Route path="/"           element={<Home />} />
            <Route path="/story"      element={<Story />} />
            <Route path="/entourage"  element={<Entourage />} />
            <Route path="/rsvp"       element={<RSVP />} />
            <Route path="/gallery"    element={<Gallery />} />
          </Routes>
        </main>
      </PageTransition>
      <Footer />
    </>
  )
}
