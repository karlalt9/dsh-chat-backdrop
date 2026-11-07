import fs from 'node:fs'
import path from 'node:path'

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const jpg = path.join(dir, 'backdrop.jpg')
const video = path.join(dir, 'media', 'backdrop.mp4')
const template = path.join(dir, 'client.template.js')
const out = path.join(dir, 'client.js')

let source = fs.readFileSync(template, 'utf8')

if (!source.includes('__IMAGE_DATA_URL__')) throw new Error('image placeholder missing')
source = source.replace(
  '__IMAGE_DATA_URL__',
  `data:image/jpeg;base64,${fs.readFileSync(jpg).toString('base64')}`,
)

// Optional video wallpaper. Absent -> the placeholder becomes an empty string and the
// theme keeps using the still image.
if (source.includes('__VIDEO_DATA_URL__')) {
  if (fs.existsSync(video)) {
    const bytes = fs.statSync(video).size
    const data = fs.readFileSync(video).toString('base64')
    source = source.replace('__VIDEO_DATA_URL__', `data:video/mp4;base64,${data}`)
    console.log('video:', (bytes / 1024 / 1024).toFixed(1), 'MB ->', (data.length / 1024 / 1024).toFixed(1), 'MB base64')
  } else {
    source = source.replace('__VIDEO_DATA_URL__', '')
    console.log('video: none (still image only)')
  }
}

// Pose placeholders are discovered, not hard-coded: dropping or adding a pose only means
// editing the POSES array plus adding/removing the matching assets/pose-N.png file.
const keys = [...new Set([...source.matchAll(/__POSE_(\d+)_DATA_URL__/g)].map((m) => m[1]))].sort(
  (a, b) => Number(a) - Number(b),
)
if (keys.length === 0) throw new Error('no pose placeholders found')

for (const n of keys) {
  const file = path.join(dir, 'assets', `pose-${n}.png`)
  const data = fs.readFileSync(file).toString('base64')
  source = source.replaceAll(`__POSE_${n}_DATA_URL__`, `data:image/png;base64,${data}`)
  console.log(`pose-${n}:`, fs.statSync(file).size, 'bytes')
}

fs.writeFileSync(out, source)
console.log('client.js written:', (fs.statSync(out).size / 1024 / 1024).toFixed(1), 'MB;', keys.length, 'poses')
