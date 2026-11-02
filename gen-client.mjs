import fs from 'node:fs'
import path from 'node:path'

const dir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'))
const jpg = path.join(dir, 'backdrop.jpg')
const template = path.join(dir, 'client.template.js')
const out = path.join(dir, 'client.js')

const url = `data:image/jpeg;base64,${fs.readFileSync(jpg).toString('base64')}`
let source = fs.readFileSync(template, 'utf8')

if (!source.includes('__IMAGE_DATA_URL__')) throw new Error('image placeholder missing')

source = source.replace('__IMAGE_DATA_URL__', url)

for (let i = 1; i <= 4; i++) {
  const key = `__POSE_${i}_DATA_URL__`
  const file = path.join(dir, 'assets', `pose-${i}.png`)
  if (!source.includes(key)) throw new Error(`${key} missing`)
  const data = fs.readFileSync(file).toString('base64')
  source = source.replace(key, `data:image/png;base64,${data}`)
  console.log(`pose-${i}:`, fs.statSync(file).size, 'bytes')
}

fs.writeFileSync(out, source)
console.log('client.js written:', fs.statSync(out).size, 'bytes')
