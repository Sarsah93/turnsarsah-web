const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegPath);

const VIDEO_DIR = path.join(__dirname, '../public/assets/backgrounds/video');
const OUTPUT_DIR = VIDEO_DIR; // 포스터를 같은 폴더에 저장

const videos = [
  { input: 'meadow field_background.mp4',   output: 'meadow_field_poster.jpg' },
  { input: 'wilderness_background.mp4',      output: 'wilderness_poster.jpg' },
  { input: 'desert_background.mp4',          output: 'desert_poster.jpg' },
  { input: 'deep forest.mp4',               output: 'deep_forest_poster.jpg' },
  { input: 'cave_background.mp4',           output: 'cave_poster.jpg' },
  { input: 'swamp_background.mp4',          output: 'swamp_poster.jpg' },
];

async function extractFrame(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions([
        '-ss', '0.1',       // 0.1초 지점 (첫 키프레임)
        '-vframes', '1',    // 1프레임만 추출
        '-q:v', '3',        // JPEG 품질 (1=최고, 5=보통)
        '-vf', 'scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2', // 960x540 고정
      ])
      .output(outputPath)
      .on('end', () => {
        console.log(`✅ ${path.basename(outputPath)}`);
        resolve();
      })
      .on('error', (err) => {
        console.error(`❌ ${path.basename(outputPath)}: ${err.message}`);
        reject(err);
      })
      .run();
  });
}

(async () => {
  console.log('🎬 배경 영상 포스터 이미지 추출 시작...\n');
  for (const v of videos) {
    const inputPath = path.join(VIDEO_DIR, v.input);
    const outputPath = path.join(OUTPUT_DIR, v.output);
    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️  파일 없음: ${v.input}`);
      continue;
    }
    try {
      await extractFrame(inputPath, outputPath);
    } catch (e) {
      // 에러는 이미 로그됨, 계속 진행
    }
  }
  console.log('\n✨ 완료!');
})();
