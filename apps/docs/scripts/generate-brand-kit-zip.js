#!/usr/bin/env node
import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'downloads')
const ZIP_FILENAME = 'amber-brand-kit.zip'

// Asset categories and their paths
const ASSET_CATEGORIES = {
  'logos-svg': [
    'logo/logo-simple/logo-light-400x140.svg',
    'logo/logo-simple/logo-dark-400x140.svg',
    'logo/logo-simple/logo-grid-dark.svg',
    'logo/logo-simple/logo-grid-light.svg',
    'logo/logo-claim/logo-claim-light-256x90.svg',
    'logo/logo-claim/logo-claim-dark-256x90.svg',
    'logo/logo-claim/logo-claim-light-512x180.svg',
    'logo/logo-claim/logo-claim-dark-512x180.svg',
    'logo/icon/icon-180x256.svg',
    'logo/icon/icon-360x512.svg',
    'logo/icon/icon-grid-dark.svg',
    'logo/icon/icon-grid-light.svg',
  ],
  'logos-png': [
    'logo/logo-simple/logo-light-400x140.png',
    'logo/logo-simple/logo-dark-400x140.png',
    'logo/logo-claim/logo-claim-light-256x90.png',
    'logo/logo-claim/logo-claim-dark-256x90.png',
    'logo/logo-claim/logo-claim-light-512x180.png',
    'logo/logo-claim/logo-claim-dark-512x180.png',
    'logo/icon/icon-180x256.png',
    'logo/icon/icon-360x512.png',
  ],
  'bitcoin-variants': [
    'images/BTC.svg',
    'images/WBTC.svg',
    'images/LBTC.svg',
    'images/eBTC.svg',
    'images/maxBTC.png',
    'images/solvBTC.svg',
    'images/uniBTC.svg',
  ],
  'protocols-infrastructure': [
    'images/bedrock.svg',
    'images/pump.svg',
    'images/MARS.svg',
    'images/NTRN.svg',
    'images/USDC.svg',
  ],
  'partner-logos': {
    axelar: ['images/axelar/axelarLight.svg', 'images/axelar/axelarDark.svg'],
    eureka: ['images/eureka/eurekaLight.svg', 'images/eureka/eurekaDark.svg'],
    lombard: [
      'images/lombard/lombardLight.svg',
      'images/lombard/lombardDark.svg',
      'images/lombard/lombardIconOnly.svg',
      'images/lombard/lombardIconOnlyDark.svg',
    ],
    neutron: ['images/neutron/neutron-light.svg', 'images/neutron/neutron-dark.svg'],
    solv: ['images/solv/solvLight.png', 'images/solv/solvDark.png'],
  },
  'social-media': [
    'twitter-profile/banner.png',
    'twitter-profile/avatar.png',
    'twitter-profile/profile.jpg',
  ],
  'twitter-banners': [
    'twitter-banner/dafault.png',
    'twitter-banner/eBTC.svg',
    'twitter-banner/LBTC.png',
    'twitter-banner/solvBTC.png',
    'twitter-banner/uniBTC.png',
    'twitter-banner/WBTC.png',
  ],
  'twitter-banner-deposits': [
    'twitter-banner/deposit/eBTC.svg',
    'twitter-banner/deposit/LBTC.png',
    'twitter-banner/deposit/solvBTC.png',
    'twitter-banner/deposit/uniBTC.png',
    'twitter-banner/deposit/WBTC.png',
  ],
  'additional-assets': [
    'images/Baby-Symbol-Mint.png',
    'images/etherfi_icon-white-outline.svg',
    'images/marsFragments/mars-fragments.svg',
    'points/mars-fragments.svg',
  ],
  favicons: [
    'favicon.ico',
    'favicon.svg',
    'favicon-96x96.png',
    'apple-touch-icon.png',
    'web-app-manifest-192x192.png',
    'web-app-manifest-512x512.png',
  ],
  fonts: [
    'fonts/FunnelDisplay-ExtraBold.woff',
    'fonts/FunnelDisplay-ExtraBold.woff2',
    'fonts/SourceSans3-Bold.woff',
    'fonts/SourceSans3-Bold.woff2',
    'fonts/SourceSans3-Regular.woff',
    'fonts/SourceSans3-Regular.woff2',
  ],
  audits: ['audits/halborn.svg', 'audits/oak.svg'],
}

// Create output directory if it doesn't exist
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
}

// Generate README content
function generateReadme() {
  return `# Amber Finance Brand Kit

This brand kit contains all the official Amber Finance brand assets, logos, and visual identity elements.

## License

All Amber Finance brand assets are available under a Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0).

## Usage Guidelines

### Primary Logos
- Use the primary Amber Finance logos for official communications and branding
- **logo-light.svg** and **logo-dark.svg**: Main brand logos
- **logo-claim-light.svg** and **logo-claim-dark.svg**: Logos with tagline

### Logo Grids
- Logo grids provide multiple logo variations in a single file for easy reference and comparison
- Icon grids contain icon variations and can be used for UI/UX design purposes

### Partner & Protocol Logos
- Partner logos should be used in accordance with their respective brand guidelines
- Protocol logos represent the underlying blockchain protocols and should be used appropriately in technical documentation

### Technical Specifications
- **Format**: Prefer SVG formats for web use, PNG for print materials where transparency is needed
- **Colors**: Maintain the original colors to preserve brand consistency
- **Minimum Size**: Ensure logos remain legible at their intended usage size

## File Organization

- \`logos/\`: Primary Amber Finance logos
- \`logos-grids/\`: Logo and icon grid variations
- \`bitcoin-variants/\`: Bitcoin-related protocol logos
- \`protocols-infrastructure/\`: Layer 1 and infrastructure protocol logos
- \`partner-logos/\`: Partner and protocol logos (organized by partner)
- \`social-media/\`: Social media assets (banners, avatars)
- \`twitter-banners/\`: Twitter banner variations
- \`twitter-banner-deposits/\`: Deposit-specific banner variations
- \`additional-assets/\`: Supplementary brand assets
- \`favicons/\`: Favicon and web app manifest files
- \`fonts/\`: Brand font files
- \`audits/\`: Security audit badges

## Attribution

When using these assets, please credit: "Amber Finance Brand Assets - CC BY-SA 4.0"

For more information, visit: https://docs.amberfinance.io/brand-kit

---
Generated on: ${new Date().toISOString().split('T')[0]}
`
}

// Create the zip file
async function createZip() {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(OUTPUT_DIR, ZIP_FILENAME)
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    })

    // Handle archive events
    output.on('close', () => {
      console.log(`✅ Brand kit zip created successfully: ${ZIP_FILENAME}`)
      console.log(`📦 Total size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`)
      resolve()
    })

    archive.on('error', (err) => {
      reject(err)
    })

    // Pipe archive data to the file
    archive.pipe(output)

    // Add README file
    archive.append(generateReadme(), { name: 'README.md' })

    // Add assets by category
    let totalFiles = 0

    for (const [category, assets] of Object.entries(ASSET_CATEGORIES)) {
      if (typeof assets === 'object' && !Array.isArray(assets)) {
        // Handle nested categories (like partner-logos)
        for (const [subcategory, subAssets] of Object.entries(assets)) {
          subAssets.forEach((asset) => {
            const assetPath = path.join(PUBLIC_DIR, asset)
            if (fs.existsSync(assetPath)) {
              const zipPath = path.join(category, subcategory, path.basename(asset))
              archive.file(assetPath, { name: zipPath })
              totalFiles++
            } else {
              console.warn(`⚠️  File not found: ${asset}`)
            }
          })
        }
      } else {
        // Handle regular arrays
        assets.forEach((asset) => {
          const assetPath = path.join(PUBLIC_DIR, asset)
          if (fs.existsSync(assetPath)) {
            const zipPath = path.join(category, path.basename(asset))
            archive.file(assetPath, { name: zipPath })
            totalFiles++
          } else {
            console.warn(`⚠️  File not found: ${asset}`)
          }
        })
      }
    }

    console.log(`📁 Processing ${totalFiles} files...`)

    // Finalize the archive
    archive.finalize()
  })
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting brand kit zip generation...')
    ensureOutputDir()
    await createZip()
    console.log('✅ Brand kit generation completed successfully!')
  } catch (error) {
    console.error('❌ Error generating brand kit zip:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { createZip, generateReadme }
