/**
 * Genera los assets PNG de la PWA (íconos + splash screens de iOS)
 * a partir de los SVG fuente en public/icons/.
 *
 * Uso:  node scripts/generate-pwa-assets.mjs
 *
 * Dependencia: sharp (devDependency).
 */
import sharp from "sharp"
import { readFileSync, mkdirSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, "..")
const publicDir = path.join(root, "public")
const iconsDir = path.join(publicDir, "icons")
const splashDir = path.join(publicDir, "splash")

mkdirSync(iconsDir, { recursive: true })
mkdirSync(splashDir, { recursive: true })

const BRAND = "#15803d" // verde de marca (coincide con el fondo del ícono y theme_color)
const iconSvg = readFileSync(path.join(iconsDir, "icon.svg"))
const maskableSvg = readFileSync(path.join(iconsDir, "maskable.svg"))

/** Rasteriza un SVG a PNG cuadrado. */
async function rasterize(svg, size, out, { flatten = false } = {}) {
  let img = sharp(svg, { density: 384 }).resize(size, size, { fit: "contain" })
  if (flatten) img = img.flatten({ background: BRAND })
  await img.png().toFile(path.join(iconsDir, out))
  console.log(`  ✓ icons/${out} (${size}×${size})`)
}

/** Genera un splash de iOS: fondo de marca con el logo centrado. */
async function splash(w, h, out) {
  const logoSize = Math.round(Math.min(w, h) * 0.4)
  const logo = await sharp(iconSvg, { density: 384 })
    .resize(logoSize, logoSize, { fit: "contain" })
    .png()
    .toBuffer()
  await sharp({
    create: { width: w, height: h, channels: 4, background: BRAND },
  })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toFile(path.join(splashDir, out))
  console.log(`  ✓ splash/${out} (${w}×${h})`)
}

console.log("Íconos:")
await rasterize(iconSvg, 192, "icon-192.png")
await rasterize(iconSvg, 512, "icon-512.png")
await rasterize(maskableSvg, 512, "maskable-512.png", { flatten: true })
// apple-touch-icon: iOS no admite transparencia (rellena de negro) → aplanamos sobre el verde.
await rasterize(iconSvg, 180, "apple-touch-icon.png", { flatten: true })

// Splash screens iOS (resolución en píxeles de dispositivo = CSS px × DPR, retrato).
console.log("Splash screens iOS:")
const SPLASHES = [
  [640, 1136, "iphone5_se1.png"],     // iPhone SE 1ª / 5
  [750, 1334, "iphone8_se2.png"],     // iPhone 6/7/8 / SE 2-3
  [828, 1792, "iphone11_xr.png"],     // iPhone XR / 11
  [1125, 2436, "iphonex_11pro.png"],  // iPhone X / XS / 11 Pro
  [1170, 2532, "iphone12_13_14.png"], // iPhone 12/13/14
  [1179, 2556, "iphone14pro.png"],    // iPhone 14 Pro / 15
  [1284, 2778, "iphone_promax.png"],  // iPhone 12-14 Pro Max
  [1290, 2796, "iphone14promax.png"], // iPhone 14/15 Pro Max
  [1536, 2048, "ipad.png"],           // iPad (mini/9.7)
  [1668, 2388, "ipadpro11.png"],      // iPad Pro 11 / Air
  [2048, 2732, "ipadpro12.png"],      // iPad Pro 12.9
]
for (const [w, h, out] of SPLASHES) await splash(w, h, out)

console.log("\n✅ Assets PWA generados.")
