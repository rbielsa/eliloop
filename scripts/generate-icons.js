import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const minimalPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64'
)
const publicDir = path.join(__dirname, '..', 'public')
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), minimalPng)
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), minimalPng)
