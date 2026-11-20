/* 彩虹宠物物语 - 程序化美术（全部为原创绘制，无任何外部图片素材） */

const TYPE_PAL = {
  plant: { main: '#7bd04a', dark: '#3d8f26', light: '#dcf9a6', accent: '#ffd447', glow: '#a7f066' },
  water: { main: '#4bb3f0', dark: '#1f5fae', light: '#bfefff', accent: '#ffffff', glow: '#8fdcff' },
  metal: { main: '#bcc6d2', dark: '#5e6b7a', light: '#eff5fc', accent: '#ffcf4d', glow: '#dfe8f5' },
  beast: { main: '#f2954c', dark: '#a94b18', light: '#ffdca8', accent: '#ff5d5d', glow: '#ffbf72' },
  wind:  { main: '#9fe3f2', dark: '#3f8cbf', light: '#ffffff', accent: '#ffd447', glow: '#dff8ff' },
  dark:  { main: '#8e6bd6', dark: '#432c74', light: '#cbb6ff', accent: '#ff5f9e', glow: '#b58cff' },
  rainbow: { main: '#f7a8d8', dark: '#8a5bd0', light: '#fff3c4', accent: '#7fe0c8', glow: '#ffd9f2' }
};

const OUTLINE = '#20162c';

function rr(c, x, y, w, h, r) {
  const rad = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  c.beginPath();
  c.moveTo(x + rad, y);
  c.arcTo(x + w, y, x + w, y + h, rad);
  c.arcTo(x + w, y + h, x, y + h, rad);
  c.arcTo(x, y + h, x, y, rad);
  c.arcTo(x, y, x + w, y, rad);
  c.closePath();
}

function shape(c, fill, lw, fn) {
  fn();
  c.fillStyle = fill;
  c.fill();
  if (lw > 0) { c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke(); }
}

/* 宠物本体：底边中心 (cx, baseY)，size 为身高基准
   sp 可带 type / shape / evoIndex / tint */
function drawPet(c, sp, cx, baseY, size, opts) {
  opts = opts || {};
  const pal = TYPE_PAL[sp.type] || TYPE_PAL.plant;
  const shapeKey = sp.shape || 'default';
  const t = opts.t || 0;
  const flip = opts.flip ? -1 : 1;
  const evo = sp.evoIndex || 0;
  const s = size * (1 + evo * 0.08);
  const hover = (shapeKey === 'drone' || shapeKey === 'wraith');
  const bob = Math.sin(t * 2.6) * s * (hover ? 0.03 : 0.012) + (hover ? s * 0.04 : 0);

  c.save();
  c.translate(cx, baseY + bob);
  c.scale(flip, 1);

  const lw = Math.max(1.4, s * 0.032);
  const bodyRy = s * (shapeKey === 'shell' || shapeKey === 'bell' ? 0.30 : 0.27);
  const bodyRx = s * (shapeKey === 'carp' ? 0.38 : 0.33);
  const bodyCy = -s * (hover ? 0.46 : 0.40);
  const headY = -s * (hover ? 0.76 : 0.70), headR = s * (shapeKey === 'wraith' ? 0.21 : 0.235);

  // 影子
  c.beginPath();
  c.ellipse(0, 0, s * (hover ? 0.30 : 0.42), s * 0.07, 0, 0, Math.PI * 2);
  c.fillStyle = hover ? 'rgba(20,14,30,0.14)' : 'rgba(20,14,30,0.25)';
  c.fill();

  // ---------- 背后装饰 ----------
  if (shapeKey === 'butterfly') {
    [-1, 1].forEach((d) => {
      c.save();
      c.rotate(d * 0.32);
      c.beginPath();
      c.ellipse(d * s * 0.30, bodyCy - s * 0.20, s * 0.21, s * 0.13, d * 0.6, 0, Math.PI * 2);
      c.fillStyle = pal.light; c.fill();
      c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
      c.beginPath();
      c.ellipse(d * s * 0.24, bodyCy + s * 0.02, s * 0.15, s * 0.10, d * 0.9, 0, Math.PI * 2);
      c.fillStyle = pal.main; c.fill();
      c.stroke();
      // 翅斑
      c.beginPath(); c.arc(d * s * 0.33, bodyCy - s * 0.22, s * 0.045, 0, Math.PI * 2);
      c.fillStyle = pal.accent; c.fill();
      c.restore();
    });
  } else if (sp.type === 'water') {
    if (shapeKey === 'shell') {
      c.beginPath();
      c.arc(s * 0.26, bodyCy - s * 0.02, s * 0.16, 0, Math.PI * 1.7);
      c.fillStyle = pal.accent; c.fill();
      c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
      c.beginPath();
      c.arc(s * 0.26, bodyCy - s * 0.02, s * 0.08, 0, Math.PI * 1.7);
      c.strokeStyle = OUTLINE; c.lineWidth = lw * 0.7; c.stroke();
    } else {
      shape(c, pal.main, lw, () => {
        c.beginPath();
        c.moveTo(s * 0.22, bodyCy - s * 0.22);
        c.lineTo(s * 0.40, bodyCy - s * 0.02);
        c.lineTo(s * 0.20, bodyCy + s * 0.14);
        c.closePath();
      });
      shape(c, pal.dark, lw, () => {
        c.beginPath();
        c.ellipse(s * 0.40, bodyCy + s * 0.10, s * 0.10, s * 0.055, 0.4, 0, Math.PI * 2);
      });
    }
  } else if (sp.type === 'beast') {
    if (shapeKey === 'wolf') {
      c.beginPath();
      c.moveTo(s * 0.24, bodyCy + s * 0.06);
      c.quadraticCurveTo(s * 0.52, bodyCy - s * 0.16, s * 0.42, bodyCy - s * 0.34);
      c.quadraticCurveTo(s * 0.50, bodyCy + s * 0.04, s * 0.26, bodyCy + s * 0.20);
      c.closePath();
      c.fillStyle = pal.main; c.fill();
      c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
    } else if (shapeKey !== 'lion') {
      c.beginPath();
      c.moveTo(s * 0.26, bodyCy + s * 0.05);
      c.quadraticCurveTo(s * 0.50, bodyCy - s * 0.06, s * 0.40, bodyCy - s * 0.26);
      c.quadraticCurveTo(s * 0.52, bodyCy - s * 0.02, s * 0.30, bodyCy + s * 0.18);
      c.closePath();
      c.fillStyle = pal.main; c.fill();
      c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
      c.beginPath(); c.ellipse(s * 0.41, bodyCy - s * 0.26, s * 0.075, s * 0.075, 0, 0, Math.PI * 2);
      c.fillStyle = pal.light; c.fill();
    }
  } else if (sp.type === 'wind') {
    if (shapeKey !== 'butterfly') {
      [-1, 1].forEach((d) => {
        c.save();
        c.rotate(d * 0.35);
        c.beginPath();
        c.ellipse(d * s * 0.26, bodyCy - s * 0.10, s * 0.20, s * 0.09, d * 0.5, 0, Math.PI * 2);
        c.fillStyle = pal.light; c.fill();
        c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
        c.restore();
      });
    }
  } else if (sp.type === 'dark') {
    if (shapeKey === 'bat' || shapeKey === 'wraith') {
      [-1, 1].forEach((d) => {
        c.beginPath();
        c.moveTo(d * s * 0.14, bodyCy - s * 0.18);
        c.quadraticCurveTo(d * s * 0.46, bodyCy - s * 0.40, d * s * 0.40, bodyCy - s * 0.04);
        c.quadraticCurveTo(d * s * 0.34, bodyCy + s * 0.06, d * s * 0.16, bodyCy + s * 0.06);
        c.closePath();
        c.fillStyle = pal.dark; c.fill();
        c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
      });
    }
  } else if (sp.type === 'plant') {
    [-1, 1].forEach((d) => {
      c.save();
      c.rotate(d * 0.5);
      c.beginPath();
      c.ellipse(d * s * 0.28, bodyCy - s * 0.08, s * 0.16, s * 0.07, 0, 0, Math.PI * 2);
      c.fillStyle = pal.dark; c.fill();
      c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
      c.restore();
    });
  }

  // ---------- 腿 ----------
  if (shapeKey !== 'drone' && shapeKey !== 'wraith') {
    [-1, 1].forEach((d) => {
      rr(c, d * s * 0.20 - s * 0.065, -s * 0.15, s * 0.13, s * 0.17, s * 0.05);
      c.fillStyle = pal.dark;
      c.fill();
      c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
    });
  }
  if (shapeKey === 'spider') {
    for (let i = 0; i < 3; i++) {
      [-1, 1].forEach((d) => {
        c.beginPath();
        c.moveTo(d * s * 0.16, bodyCy + (i - 1) * s * 0.07);
        c.quadraticCurveTo(d * s * 0.46, bodyCy + (i - 1) * s * 0.12 - s * 0.06, d * s * 0.44, s * 0.02 + i * s * 0.02);
        c.strokeStyle = OUTLINE; c.lineWidth = lw * 0.9; c.stroke();
        c.strokeStyle = pal.dark; c.lineWidth = lw * 0.4; c.stroke();
      });
    }
  }

  // ---------- 身体 ----------
  shape(c, pal.main, lw, () => {
    c.beginPath();
    c.ellipse(0, bodyCy, bodyRx, bodyRy, 0, 0, Math.PI * 2);
  });
  c.beginPath();
  c.ellipse(0, bodyCy + s * 0.08, bodyRx * 0.62, bodyRy * 0.55, 0, 0, Math.PI * 2);
  c.fillStyle = pal.light; c.fill();

  if (shapeKey === 'bell') {
    c.beginPath();
    c.moveTo(-bodyRx * 1.02, bodyCy + bodyRy * 0.6);
    c.lineTo(bodyRx * 1.02, bodyCy + bodyRy * 0.6);
    c.lineTo(bodyRx * 1.4, bodyCy + bodyRy * 1.5);
    c.lineTo(-bodyRx * 1.4, bodyCy + bodyRy * 1.5);
    c.closePath();
    c.fillStyle = pal.main; c.fill();
    c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
    c.beginPath();
    c.arc(0, bodyCy + bodyRy * 1.5, s * 0.05, 0, Math.PI * 2);
    c.fillStyle = pal.accent; c.fill();
  }
  if (shapeKey === 'moss') {
    [-1, 1, 0].forEach((d, i) => {
      c.beginPath();
      c.arc(d * s * 0.18, bodyCy - bodyRy * 0.75 + i * s * 0.03, s * 0.055, 0, Math.PI * 2);
      c.fillStyle = i % 2 ? pal.accent : '#8fa05a'; c.fill();
      c.lineWidth = lw * 0.6; c.strokeStyle = OUTLINE; c.stroke();
    });
  }
  if (shapeKey === 'drone') {
    [-1, 1].forEach((d) => {
      c.beginPath();
      c.ellipse(d * s * 0.30, bodyCy - s * 0.10, s * 0.13, s * 0.028, 0, 0, Math.PI * 2);
      c.fillStyle = 'rgba(255,255,255,0.55)'; c.fill();
      c.strokeStyle = OUTLINE; c.lineWidth = lw * 0.6; c.stroke();
    });
  }
  if (sp.type === 'metal' && shapeKey !== 'bell') {
    [[-0.18, -0.03], [0.18, -0.03]].forEach((p) => {
      c.beginPath(); c.arc(p[0] * s, bodyCy + p[1] * s, s * 0.028, 0, Math.PI * 2);
      c.fillStyle = pal.dark; c.fill();
    });
  }

  // ---------- 头 ----------
  shape(c, pal.main, lw, () => {
    c.beginPath();
    c.ellipse(0, headY, headR, headR * 0.94, 0, 0, Math.PI * 2);
  });
  [-0.11, 0.11].forEach((d) => {
    c.beginPath();
    c.ellipse(d * s, headY + s * 0.06, s * 0.06, s * 0.035, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,120,150,0.32)'; c.fill();
  });

  if (shapeKey === 'lion') {
    c.beginPath();
    c.ellipse(0, headY + headR * 0.1, headR * 1.35, headR * 1.28, 0, 0, Math.PI * 2);
    c.fillStyle = pal.dark; c.fill();
    c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
    c.beginPath();
    c.ellipse(0, headY, headR, headR * 0.94, 0, 0, Math.PI * 2);
    c.fillStyle = pal.main; c.fill();
    c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
  }

  // 耳朵 / 角 / 冠
  if (shapeKey === 'rabbit') {
    [-1, 1].forEach((d) => {
      c.save();
      c.rotate(d * 0.18);
      c.beginPath();
      c.ellipse(d * headR * 0.5, headY - headR * 1.15, headR * 0.20, headR * 0.62, 0, 0, Math.PI * 2);
      c.fillStyle = pal.main; c.fill();
      c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
      c.beginPath();
      c.ellipse(d * headR * 0.5, headY - headR * 1.12, headR * 0.10, headR * 0.42, 0, 0, Math.PI * 2);
      c.fillStyle = pal.light; c.fill();
      c.restore();
    });
  } else if (sp.type === 'beast') {
    [-1, 1].forEach((d) => {
      c.beginPath();
      c.moveTo(d * headR * 0.62, headY - headR * 0.62);
      c.lineTo(d * headR * 0.95, headY - headR * 1.35);
      c.lineTo(d * headR * 0.16, headY - headR * 0.82);
      c.closePath();
      c.fillStyle = pal.main; c.fill();
      c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
    });
  } else if (sp.type === 'wind') {
    if (shapeKey === 'butterfly') {
      [-1, 1].forEach((d) => {
        c.beginPath();
        c.moveTo(d * headR * 0.3, headY - headR * 0.8);
        c.quadraticCurveTo(d * headR * 0.9, headY - headR * 1.4, d * headR * 1.05, headY - headR * 0.6);
        c.strokeStyle = OUTLINE; c.lineWidth = lw * 0.8; c.stroke();
        c.beginPath(); c.arc(d * headR * 1.05, headY - headR * 0.6, headR * 0.1, 0, Math.PI * 2);
        c.fillStyle = pal.accent; c.fill();
      });
    } else {
      for (let i = 0; i < 3; i++) {
        c.save();
        c.rotate(-0.35 + i * 0.32);
        c.beginPath();
        c.ellipse(0, headY - headR * 1.05, headR * 0.10, headR * 0.34, 0, 0, Math.PI * 2);
        c.fillStyle = pal.accent; c.fill();
        c.restore();
      }
      c.beginPath();
      c.moveTo(headR * 0.42, headY + headR * 0.04);
      c.lineTo(headR * 0.95, headY + headR * 0.22);
      c.lineTo(headR * 0.40, headY + headR * 0.36);
      c.closePath();
      c.fillStyle = pal.accent; c.fill();
      c.lineWidth = lw * 0.8; c.strokeStyle = OUTLINE; c.stroke();
    }
  } else if (sp.type === 'plant') {
    if (shapeKey === 'bloom') {
      for (let i = 0; i < 6; i++) {
        c.save();
        c.translate(0, headY - headR * 0.95);
        c.rotate(i * Math.PI / 3);
        c.beginPath();
        c.ellipse(0, -headR * 0.30, headR * 0.21, headR * 0.33, 0, 0, Math.PI * 2);
        c.fillStyle = i % 2 ? pal.accent : pal.light; c.fill();
        c.lineWidth = lw * 0.7; c.strokeStyle = OUTLINE; c.stroke();
        c.restore();
      }
      c.beginPath(); c.arc(0, headY - headR * 0.95, headR * 0.14, 0, Math.PI * 2);
      c.fillStyle = '#ff9f4d'; c.fill();
    } else {
      [-1, 1].forEach((d) => {
        c.save();
        c.translate(0, headY - headR * 0.88);
        c.rotate(d * 0.65);
        c.beginPath();
        c.ellipse(d * headR * 0.42, 0, headR * 0.46, headR * 0.18, 0, 0, Math.PI * 2);
        c.fillStyle = pal.dark; c.fill();
        c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
        c.restore();
      });
      if (evo >= 1) {
        c.beginPath(); c.arc(0, headY - headR * 0.95, headR * 0.20, 0, Math.PI * 2);
        c.fillStyle = pal.accent; c.fill();
        c.lineWidth = lw * 0.7; c.strokeStyle = OUTLINE; c.stroke();
      }
    }
  } else if (sp.type === 'metal') {
    c.beginPath();
    c.moveTo(-headR * 0.15, headY - headR * 0.9);
    c.lineTo(0, headY - headR * 1.45);
    c.lineTo(headR * 0.15, headY - headR * 0.9);
    c.closePath();
    c.fillStyle = pal.accent; c.fill();
    c.lineWidth = lw * 0.8; c.strokeStyle = OUTLINE; c.stroke();
    [-1, 1].forEach((d) => {
      rr(c, d * headR * 0.78 - headR * 0.14, headY - headR * 0.55, headR * 0.3, headR * 0.36, 4);
      c.fillStyle = pal.dark; c.fill();
      c.lineWidth = lw * 0.7; c.strokeStyle = OUTLINE; c.stroke();
    });
  } else if (sp.type === 'dark') {
    [-1, 1].forEach((d) => {
      c.beginPath();
      c.moveTo(d * headR * 0.42, headY - headR * 0.80);
      c.lineTo(d * headR * 0.62, headY - headR * 1.34);
      c.lineTo(d * headR * 0.80, headY - headR * 0.66);
      c.closePath();
      c.fillStyle = pal.accent; c.fill();
      c.lineWidth = lw * 0.8; c.strokeStyle = OUTLINE; c.stroke();
    });
  } else if (sp.type === 'water') {
    c.beginPath();
    c.ellipse(0, headY - headR * 0.86, headR * 0.12, headR * 0.26, 0.2, 0, Math.PI * 2);
    c.fillStyle = pal.light; c.fill();
    c.lineWidth = lw * 0.8; c.strokeStyle = OUTLINE; c.stroke();
    if (shapeKey === 'carp') {
      [-1, 1].forEach((d) => {
        c.beginPath();
        c.moveTo(d * headR * 0.30, headY + headR * 0.55);
        c.quadraticCurveTo(d * headR * 0.55, headY + headR * 0.95, d * headR * 0.65, headY + headR * 0.5);
        c.strokeStyle = pal.dark; c.lineWidth = lw * 0.7; c.stroke();
      });
    }
  } else if (sp.type === 'rainbow') {
    c.beginPath();
    c.moveTo(0, headY - headR * 1.5);
    c.lineTo(headR * 0.18, headY - headR * 0.8);
    c.lineTo(-headR * 0.18, headY - headR * 0.8);
    c.closePath();
    c.fillStyle = pal.accent; c.fill();
    c.lineWidth = lw * 0.8; c.strokeStyle = OUTLINE; c.stroke();
  }

  // 眼睛
  const eyeY = headY - s * 0.015, eyeDx = s * 0.098, eyeR = Math.max(2, s * 0.043);
  [-1, 1].forEach((d) => {
    c.beginPath(); c.ellipse(d * eyeDx, eyeY, eyeR * 1.15, eyeR * 1.25, 0, 0, Math.PI * 2);
    c.fillStyle = '#ffffff'; c.fill();
    c.lineWidth = lw * 0.7; c.strokeStyle = OUTLINE; c.stroke();
    c.beginPath(); c.arc(d * eyeDx + d * eyeR * 0.15, eyeY, eyeR * 0.6, 0, Math.PI * 2);
    c.fillStyle = (sp.type === 'dark' || sp.type === 'rainbow') ? (sp.type === 'rainbow' ? '#3a7ad9' : '#ffcf4d') : '#2a1c33';
    c.fill();
    c.beginPath(); c.arc(d * eyeDx - eyeR * 0.2, eyeY - eyeR * 0.4, eyeR * 0.26, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.fill();
  });
  // 嘴
  c.beginPath();
  c.moveTo(-s * 0.03, headY + s * 0.075);
  c.quadraticCurveTo(0, headY + s * 0.10, s * 0.03, headY + s * 0.075);
  c.lineWidth = lw * 0.8; c.strokeStyle = OUTLINE; c.stroke();

  if (evo >= 2) {
    c.beginPath();
    c.arc(0, bodyCy - s * 0.05, s * 0.55, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(255,255,255,0.32)'; c.lineWidth = s * 0.03; c.stroke();
  }

  c.restore();
}

/* 训练师 */
function drawTrainer(c, x, baseY, size, dir, t, walking) {
  const s = size;
  const bob = walking ? Math.abs(Math.sin(t * 9)) * s * 0.03 : 0;
  c.save();
  c.translate(x, baseY - bob);

  c.beginPath();
  c.ellipse(0, bob + s * 0.01, s * 0.22, s * 0.07, 0, 0, Math.PI * 2);
  c.fillStyle = 'rgba(20,14,30,0.22)'; c.fill();

  const lw = Math.max(1.2, s * 0.05);
  const step = walking ? Math.sin(t * 9) * s * 0.08 : 0;
  [-1, 1].forEach((d) => {
    rr(c, d * s * 0.10 - s * 0.055 + step * d, -s * 0.34, s * 0.11, s * 0.34, s * 0.035);
    c.fillStyle = '#3a3552'; c.fill();
    c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
  });
  rr(c, -s * 0.30, -s * 0.62, s * 0.20, s * 0.30, s * 0.06);
  c.fillStyle = '#e5533d'; c.fill();
  c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
  rr(c, -s * 0.22, -s * 0.70, s * 0.44, s * 0.36, s * 0.08);
  c.fillStyle = '#3a7ad9'; c.fill();
  c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
  rr(c, -s * 0.20, -s * 0.62, s * 0.40, s * 0.10, s * 0.04);
  c.fillStyle = '#f2f5ff'; c.fill();
  c.beginPath();
  c.arc(0, -s * 0.86, s * 0.20, 0, Math.PI * 2);
  c.fillStyle = '#f5d0a4'; c.fill();
  c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
  c.beginPath();
  c.arc(0, -s * 0.90, s * 0.205, Math.PI * 1.02, Math.PI * 2.0);
  c.fillStyle = '#e5533d'; c.fill();
  c.lineWidth = lw; c.strokeStyle = OUTLINE; c.stroke();
  c.beginPath();
  c.moveTo(s * 0.18, -s * 0.90);
  c.lineTo(s * 0.40, -s * 0.88);
  c.lineTo(s * 0.18, -s * 0.80);
  c.closePath();
  c.fillStyle = '#c8402c'; c.fill();
  c.lineWidth = lw * 0.8; c.strokeStyle = OUTLINE; c.stroke();
  const ex = dir === 'left' ? -s * 0.05 : dir === 'right' ? s * 0.05 : 0;
  [-1, 1].forEach((d) => {
    c.beginPath();
    c.arc(ex + d * s * 0.07, -s * 0.86, s * 0.022, 0, Math.PI * 2);
    c.fillStyle = '#2a1c33'; c.fill();
  });
  c.restore();
}

/* 精灵球 */
function drawBall(c, x, y, r, tier) {
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
  c.fillStyle = tier === 2 ? '#ffd447' : '#e5533d'; c.fill();
  c.beginPath(); c.arc(x, y, r, Math.PI * 0.98, Math.PI * 2.02);
  c.fillStyle = '#f5f8ff'; c.fill();
  c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2);
  c.strokeStyle = OUTLINE; c.lineWidth = Math.max(1, r * 0.14); c.stroke();
  c.beginPath(); c.arc(x, y, r * 0.28, 0, Math.PI * 2);
  c.fillStyle = tier === 2 ? '#ff9f1c' : '#ffffff'; c.fill();
  c.strokeStyle = OUTLINE; c.lineWidth = Math.max(1, r * 0.12); c.stroke();
}

/* 宠物蛋 */
function drawEgg(c, x, baseY, size, t, tint) {
  const s = size;
  c.save();
  c.translate(x, baseY);
  c.beginPath();
  c.ellipse(0, 0, s * 0.34, s * 0.06, 0, 0, Math.PI * 2);
  c.fillStyle = 'rgba(20,14,30,0.2)'; c.fill();
  c.translate(0, Math.sin(t * 2) * 1.2);
  c.beginPath();
  c.ellipse(0, -s * 0.42, s * 0.28, s * 0.42, 0, 0, Math.PI * 2);
  c.fillStyle = tint || '#fff1cf'; c.fill();
  c.lineWidth = s * 0.03; c.strokeStyle = OUTLINE; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.6)';
  c.beginPath(); c.ellipse(-s * 0.1, -s * 0.55, s * 0.07, s * 0.10, -0.4, 0, Math.PI * 2); c.fill();
  [[0.05, 0.35], [-0.12, 0.5], [0.18, 0.6], [0, 0.75]].forEach(function (p) {
    c.beginPath();
    c.arc(p[0] * s, -s * p[1], s * 0.05, 0, Math.PI * 2);
    c.fillStyle = 'rgba(247,168,216,0.8)'; c.fill();
  });
  c.restore();
}
