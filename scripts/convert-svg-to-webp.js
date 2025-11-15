const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const themesDir = path.join(__dirname, '../public/themes');
const files = fs.readdirSync(themesDir).filter(file => file.endsWith('.svg'));

console.log(`\n🎨 Converting ${files.length} SVG files to WebP...\n`);

async function convertSvgToWebP(filename) {
  const inputPath = path.join(themesDir, filename);
  const outputPath = path.join(themesDir, filename.replace('.svg', '.webp'));

  const startSize = fs.statSync(inputPath).size;

  try {
    await sharp(inputPath, { density: 150 })
      .webp({ quality: 85, effort: 6 })
      .toFile(outputPath);

    const endSize = fs.statSync(outputPath).size;
    const reduction = ((1 - endSize / startSize) * 100).toFixed(1);

    console.log(`✅ ${filename}`);
    console.log(`   ${(startSize / 1024 / 1024).toFixed(2)} MB → ${(endSize / 1024).toFixed(2)} KB`);
    console.log(`   ${reduction}% reduction\n`);
  } catch (error) {
    console.error(`❌ Failed to convert ${filename}:`, error.message);
  }
}

async function main() {
  for (const file of files) {
    await convertSvgToWebP(file);
  }
  console.log('✨ Conversion complete!\n');
}

main();
