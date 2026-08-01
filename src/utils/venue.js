/* ============================================================
   Shared venue + map details — edit here to update everywhere
   (Home, Wedding Service, Reception).

   Grass Garden Resort, Plaridel, Bulacan — 14.8965561, 120.8337575
   ============================================================ */

export const VENUE_NAME    = 'Grass Garden'
export const VENUE_ADDRESS = 'Purok 4, P. Reyes Street, Barangay Sipat, Plaridel, Bulacan'

// Button opens the exact pin in Google Maps.
export const MAP_LINK = 'https://maps.app.goo.gl/XGPYFFmqYp1hdFQq6'

// Inline map uses the official Google Maps Embed URL (/maps/embed?pb=…).
// This form IS frameable — unlike the keyless `?q=…&output=embed` shortcut,
// which Google blocks with X-Frame-Options. The `pb` payload pins the venue by
// its Google Place ID, so the marker shows the real "Grass Garden Resort" POI.
// ✏️ To repoint: Google Maps ▸ Share ▸ Embed a map ▸ copy the iframe `src`.
// Size/border are set in CSS (.home__venue-map iframe, .cp-map iframe) — don't
// paste the width/height/style attributes from Google's snippet.
export const MAP_EMBED =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3855.726551070705!2d120.83118257574496!3d14.896561269760872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396546b8bd4c883%3A0xe503da8adb6d4838!2sGrass%20Garden%20Resort!5e0!3m2!1sen!2sus!4v1785577983173!5m2!1sen!2sus'
