const fs = require('fs');
const path = require('path');

// PNG 헤더에서 가로세로 크기를 읽어오는 함수
function getPngSize(filePath) {
  const buffer = fs.readFileSync(filePath);
  // PNG 매직 넘버 확인
  if (buffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error('Not a PNG file');
  }
  // IHDR 청크에서 width, height 추출 (16~24 바이트)
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

const dir = 'c:/turnsarsah-web/public/assets/worldmap';
const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.png')) {
    try {
      const size = getPngSize(path.join(dir, file));
      console.log(`${file}: ${size.width} x ${size.height} (Ratio: ${(size.width/size.height).toFixed(3)})`);
    } catch (e) {
      console.log(`${file}: Failed to read size (${e.message})`);
    }
  }
});
