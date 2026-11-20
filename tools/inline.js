// 把 index.html + art.js + game.js 打包成单文件（供 iOS WKWebView 使用，避免本地脚本加载限制）
// 用法： node tools/inline.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

let html = read('index.html');
const art = read('art.js');
const game = read('game.js');

html = html.replace('<script src="art.js"></script>', '<script>\n' + art + '\n</script>');
html = html.replace('<script src="game.js"></script>', '<script>\n' + game + '\n</script>');
html = html.replace('<link rel="apple-touch-icon" href="icon.png">', '');
html = html.replace('<link rel="icon" href="icon.png">', '');

const outDir = path.join(root, 'ios', 'PetKingdom', 'Web');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');

// 清掉旧的分文件资源，避免打进包里重复
['art.js', 'game.js', 'icon.png'].forEach((f) => {
  const p = path.join(outDir, f);
  if (fs.existsSync(p)) fs.unlinkSync(p);
});

console.log('inline ok ->', path.join(outDir, 'index.html'), (html.length / 1024).toFixed(1) + ' KB');
