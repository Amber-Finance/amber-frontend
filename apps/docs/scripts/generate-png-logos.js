#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const LOGO_DIR = path.join(PUBLIC_DIR, 'logo')
const PNG_OUTPUT_DIR = path.join(PUBLIC_DIR, 'logo', 'png')

// Logo files to convert (SVG only)
const LOGO_FILES = [
  'logo-light.svg',
  'logo-dark.svg',
  'logo-claim-light.svg',
  'logo-claim-dark.svg',
  'favicon.svg',
  'logo-grid-light.svg',
  'logo-grid-dark.svg',
  'icon-grid-light.svg',
  'icon-grid-dark.svg',
]

// Ensure PNG output directory exists
function ensurePngDir() {
  if (!fs.existsSync(PNG_OUTPUT_DIR)) {
    fs.mkdirSync(PNG_OUTPUT_DIR, { recursive: true })
  }
}

// Convert SVG to PNG
async function convertSvgToPng(svgPath, pngPath, size = 512) {
  try {
    await sharp(svgPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }, // Transparent background
      })
      .png()
      .toFile(pngPath)

    console.log(`✅ Converted: ${path.basename(svgPath)} → ${path.basename(pngPath)}`)
  } catch (error) {
    console.error(`❌ Failed to convert ${path.basename(svgPath)}:`, error.message)
  }
}

// Main conversion function
async function convertLogos() {
  console.log('🚀 Starting PNG logo generation...')
  ensurePngDir()

  let converted = 0
  let skipped = 0

  for (const logoFile of LOGO_FILES) {
    const svgPath = path.join(LOGO_DIR, logoFile)
    const pngFileName = logoFile.replace('.svg', '.png')
    const pngPath = path.join(PNG_OUTPUT_DIR, pngFileName)

    if (!fs.existsSync(svgPath)) {
      console.warn(`⚠️  SVG file not found: ${logoFile}`)
      skipped++
      continue
    }

    // Check if PNG already exists and is newer than SVG
    if (fs.existsSync(pngPath)) {
      const svgStats = fs.statSync(svgPath)
      const pngStats = fs.statSync(pngPath)

      if (pngStats.mtime > svgStats.mtime) {
        console.log(`⏭️  Skipping (up to date): ${pngFileName}`)
        skipped++
        continue
      }
    }

    await convertSvgToPng(svgPath, pngPath)
    converted++
  }

  console.log(`\n✅ PNG generation completed!`)
  console.log(`📊 Converted: ${converted} files`)
  console.log(`⏭️  Skipped: ${skipped} files`)
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  convertLogos().catch((error) => {
    console.error('❌ Error generating PNG logos:', error)
    process.exit(1)
  })
}

export { convertLogos }
