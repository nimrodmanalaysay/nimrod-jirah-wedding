/**
 * ============================================================
 * optimize-photos.mjs — shrink gallery photos for the web
 * ============================================================
 *
 *   npm run optimize:photos
 *
 * Reads full-size originals from photos-src/ and writes web-sized copies into
 * public/photos/, keeping the same filenames so nothing in src/ needs editing.
 *
 * Why two folders rather than compressing in place: everything under public/ is
 * copied verbatim into dist/ by Vite, so originals kept there would deploy even
 * though no page requests them. Keeping them outside public/ means they are
 * archived in the repo but never shipped — and because the source is always
 * pristine, re-running with different settings can't stack lossy passes on top
 * of each other the way in-place compression would.
 *
 * Flags:
 *   --in <dir>     source folder            (default photos-src)
 *   --out <dir>    destination folder       (default public/photos)
 *   --max <px>     longest edge, no upscale (default 1600)
 *   --quality <n>  JPEG quality 1-100       (default 80)
 *   --dry          report only, write nothing
 *
 * Prints a ready-to-paste `photos` array for src/pages/Gallery.jsx, since the
 * w/h there must match the files actually served.
 * ============================================================ */

import { readdir, mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback
}

const IN      = flag('in', 'photos-src')
const OUT     = flag('out', 'public/photos')
const MAX     = Number(flag('max', 1600))
const QUALITY = Number(flag('quality', 80))
const DRY     = argv.includes('--dry')

const IMAGE_RE = /\.(jpe?g|png|webp)$/i
const kb = bytes => Math.round(bytes / 1024)

// Numeric-aware sort so 2.jpg lands before 10.jpg
const byNumber = (a, b) => {
  const na = parseInt(a, 10), nb = parseInt(b, 10)
  if (!Number.isNaN(na) && !Number.isNaN(nb) && na !== nb) return na - nb
  return a.localeCompare(b)
}

async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await walk(full))
    else if (IMAGE_RE.test(entry.name)) out.push(full)
  }
  return out
}

const files = (await walk(IN)).sort((a, b) => byNumber(path.basename(a), path.basename(b)))

if (!files.length) {
  console.error(`No images found under ${IN}/`)
  process.exit(1)
}

console.log(`${DRY ? 'Dry run: ' : ''}${files.length} image(s) — longest edge ${MAX}px, quality ${QUALITY}\n`)

let before = 0, after = 0
const results = []

for (const file of files) {
  const rel  = path.relative(IN, file)
  const dest = path.join(OUT, rel).replace(/\.(png|webp)$/i, '.jpg')

  const srcBytes = (await stat(file)).size
  before += srcBytes

  // withoutEnlargement: a photo already under MAX is re-encoded, never upscaled
  const pipeline = sharp(file)
    .rotate()                                   // honour EXIF orientation
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: QUALITY, progressive: true, mozjpeg: true })

  const buf  = await pipeline.toBuffer()
  const meta = await sharp(buf).metadata()
  after += buf.length

  if (!DRY) {
    await mkdir(path.dirname(dest), { recursive: true })
    await writeFile(dest, buf)
  }

  results.push({ rel, dest, w: meta.width, h: meta.height, srcBytes, outBytes: buf.length })

  const pct = Math.round((1 - buf.length / srcBytes) * 100)
  console.log(
    `  ${rel.padEnd(28)} ${String(meta.width).padStart(5)}x${String(meta.height).padEnd(5)}` +
    ` ${String(kb(srcBytes)).padStart(5)} KB -> ${String(kb(buf.length)).padStart(4)} KB  (-${pct}%)`
  )
}

const saved = Math.round((1 - after / before) * 100)
console.log(`\nTotal ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB  (-${saved}%)`)

// The w/h in Gallery.jsx set each tile's aspect-ratio, so they have to describe
// the files actually served — print the array rather than leave it to hand-editing.
const inPrenup = results.filter(r => r.rel.replace(/\\/g, '/').startsWith('PrenupPictures/'))
if (inPrenup.length) {
  console.log('\nPaste into the `photos` array in src/pages/Gallery.jsx:\n')
  for (const r of inPrenup) {
    const url = '/photos/' + r.rel.replace(/\\/g, '/')
    const id  = parseInt(path.basename(r.rel), 10)
    console.log(`  { id: ${String(id).padStart(2)}, src: '${url}', w: ${r.w}, h: ${r.h} },`)
  }
}
