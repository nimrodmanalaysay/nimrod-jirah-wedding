import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

// ============================================================
// HashRouter is used instead of BrowserRouter so that React
// Router works correctly on GitHub Pages.
//
// URLs will look like:
//   https://yourname.github.io/nimrod-jirah-wedding/#/story
//
// If you later move to Vercel or Netlify, switch back to
// BrowserRouter — those platforms support clean URLs natively.
// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
