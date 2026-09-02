import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function processImage() {
  const imagePath = path.join(__dirname, '../frontend/src/assets/signatures.png');
  const base64 = fs.readFileSync(imagePath, 'base64');
  const dataUrl = `data:image/png;base64,${base64}`;

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const resultBase64 = await page.evaluate(async (imgSrc) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // The background is light pink/white. Signatures are dark blue.
          // Let's make any pixel that is bright enough (e.g. > 150) transparent
          // OR any pixel that has high Red and Blue (pinkish)
          // Let's just remove anything that isn't distinctly dark/blue.
          
          // Calculate brightness
          const brightness = (r + g + b) / 3;
          
          if (brightness > 160) {
            // Make transparent
            data[i + 3] = 0;
          } else {
            // If it's part of the signature, we can optionally enhance the blue
            // to make it stand out more, or just leave it.
            // Let's just leave it and maybe make it slightly darker.
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = imgSrc;
    });
  }, dataUrl);

  await browser.close();

  // Save it back
  const newBase64 = resultBase64.replace(/^data:image\/png;base64,/, '');
  fs.writeFileSync(imagePath, newBase64, 'base64');
  console.log("Processed image and removed background!");
}

processImage().catch(console.error);
