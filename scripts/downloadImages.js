const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

const downloadImage = (url, filename) => {
  const filepath = path.join(__dirname, '../public/images', filename);
  if (!fs.existsSync(path.join(__dirname, '../public/images'))) {
    fs.mkdirSync(path.join(__dirname, '../public/images'), { recursive: true });
  }

  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const file = fs.createWriteStream(filepath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve(filepath);
        });
      } else {
        reject(`Failed to download ${url}`);
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://ak.hypergryph.com/#information');
  
  // 等待图片加载
  await page.waitForSelector('img');

  // 获取所有图片URL
  const images = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('img')).map(img => img.src);
  });

  // 下载所有图片
  for (let i = 0; i < images.length; i++) {
    const url = images[i];
    if (url.includes('https://') && (url.includes('.png') || url.includes('.jpg'))) {
      const filename = `character_${i + 1}.png`;
      try {
        await downloadImage(url, filename);
        console.log(`Downloaded: ${filename}`);
      } catch (err) {
        console.error(`Failed to download ${url}:`, err);
      }
    }
  }

  await browser.close();
  console.log('All downloads completed!');
})(); 