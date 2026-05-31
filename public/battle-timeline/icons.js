// Drawing functions for battle entity icons on canvas
// Each draws within a given bounding box (x, y, size)

export const ICONS = {};

function circle(ctx, cx, cy, r) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
}

function rect(ctx, x, y, w, h) {
  ctx.rect(x, y, w, h);
}

ICONS.soldier = function(ctx, x, y, s, color) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  ctx.fillStyle = color || '#4a90d9';
  // Body
  ctx.beginPath();
  ctx.arc(cx, cy - s*0.15, s*0.25, 0, Math.PI*2);
  ctx.fill();
  // Torso
  ctx.beginPath();
  ctx.moveTo(cx - s*0.15, cy);
  ctx.lineTo(cx + s*0.15, cy);
  ctx.lineTo(cx + s*0.12, cy + s*0.35);
  ctx.lineTo(cx - s*0.12, cy + s*0.35);
  ctx.closePath();
  ctx.fill();
  // Gun/rifle
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx + s*0.2, cy + s*0.05);
  ctx.lineTo(cx + s*0.5, cy - s*0.15);
  ctx.stroke();
  ctx.restore();
};

ICONS.commander = function(ctx, x, y, s, color) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  ctx.fillStyle = color || '#d4a574';
  // Hat
  ctx.beginPath();
  ctx.moveTo(cx - s*0.3, cy - s*0.2);
  ctx.lineTo(cx + s*0.3, cy - s*0.2);
  ctx.lineTo(cx + s*0.2, cy - s*0.4);
  ctx.lineTo(cx - s*0.2, cy - s*0.4);
  ctx.closePath();
  ctx.fillStyle = '#3a3a3a';
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - s*0.1, s*0.22, 0, Math.PI*2);
  ctx.fillStyle = color || '#d4a574';
  ctx.fill();
  // Body
  ctx.beginPath();
  ctx.arc(cx, cy + s*0.15, s*0.25, 0, Math.PI*2);
  ctx.fill();
  // Star on chest
  ctx.fillStyle = '#f0d4a8';
  ctx.font = `${s*0.35}px serif`;
  ctx.textAlign = 'center';
  ctx.fillText('\u2605', cx, cy + s*0.2);
  ctx.restore();
};

ICONS.base = function(ctx, x, y, s, color) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  // Walls
  ctx.fillStyle = color || '#8a7a6a';
  ctx.beginPath();
  ctx.moveTo(cx - s*0.4, cy + s*0.35);
  ctx.lineTo(cx - s*0.4, cy - s*0.25);
  ctx.lineTo(cx - s*0.15, cy - s*0.45);
  ctx.lineTo(cx + s*0.15, cy - s*0.45);
  ctx.lineTo(cx + s*0.4, cy - s*0.25);
  ctx.lineTo(cx + s*0.4, cy + s*0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a4a3a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Gate
  ctx.fillStyle = '#3a2a1a';
  ctx.beginPath();
  ctx.arc(cx, cy + s*0.15, s*0.15, Math.PI, 0);
  ctx.fill();
  // Flag
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s*0.45);
  ctx.lineTo(cx, cy - s*0.55);
  ctx.stroke();
  ctx.fillStyle = color || '#e94560';
  ctx.beginPath();
  ctx.moveTo(cx, cy - s*0.55);
  ctx.lineTo(cx + s*0.25, cy - s*0.45);
  ctx.lineTo(cx, cy - s*0.35);
  ctx.fill();
  ctx.restore();
};

ICONS.tank = function(ctx, x, y, s, color) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  ctx.fillStyle = color || '#6b8a6b';
  // Body
  ctx.beginPath();
  ctx.moveTo(cx - s*0.4, cy);
  ctx.lineTo(cx + s*0.4, cy);
  ctx.lineTo(cx + s*0.4, cy + s*0.2);
  ctx.lineTo(cx - s*0.4, cy + s*0.2);
  ctx.closePath();
  ctx.fill();
  // Turret
  ctx.beginPath();
  ctx.arc(cx, cy - s*0.05, s*0.22, Math.PI, 0);
  ctx.fill();
  // Barrel
  ctx.strokeStyle = '#5a7a5a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + s*0.2, cy - s*0.05);
  ctx.lineTo(cx + s*0.55, cy - s*0.2);
  ctx.stroke();
  // Tracks
  ctx.fillStyle = '#3a3a3a';
  ctx.beginPath();
  ctx.roundRect(cx - s*0.42, cy + s*0.15, s*0.84, s*0.12, 3);
  ctx.fill();
  ctx.restore();
};

ICONS.artillery = function(ctx, x, y, s, color) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  ctx.fillStyle = color || '#8a6a4a';
  // Base
  ctx.beginPath();
  ctx.arc(cx, cy + s*0.15, s*0.3, Math.PI, 0);
  ctx.fill();
  // Wheels
  ctx.fillStyle = '#5a4a3a';
  ctx.beginPath();
  ctx.arc(cx - s*0.28, cy + s*0.15, s*0.12, 0, Math.PI*2);
  ctx.arc(cx + s*0.28, cy + s*0.15, s*0.12, 0, Math.PI*2);
  ctx.fill();
  // Barrel
  ctx.strokeStyle = '#7a6a5a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, cy - s*0.1);
  ctx.lineTo(cx + s*0.3, cy - s*0.45);
  ctx.stroke();
  // Muzzle flash
  ctx.fillStyle = '#f0a500';
  ctx.beginPath();
  ctx.arc(cx + s*0.3, cy - s*0.45, s*0.08, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
};

ICONS.mountain = function(ctx, x, y, s, color) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  ctx.fillStyle = color || '#5a7a5a';
  // Peaks
  ctx.beginPath();
  ctx.moveTo(cx - s*0.45, cy + s*0.35);
  ctx.lineTo(cx - s*0.2, cy - s*0.4);
  ctx.lineTo(cx + s*0.1, cy);
  ctx.lineTo(cx + s*0.4, cy - s*0.3);
  ctx.lineTo(cx + s*0.5, cy + s*0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a5a3a';
  ctx.lineWidth = 1;
  ctx.stroke();
  // Snow cap
  ctx.fillStyle = '#e8e8f0';
  ctx.beginPath();
  ctx.moveTo(cx - s*0.1, cy - s*0.35);
  ctx.lineTo(cx - s*0.2, cy - s*0.4);
  ctx.lineTo(cx + s*0.05, cy - s*0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

ICONS.river = function(ctx, x, y, s, color) {
  ctx.save();
  ctx.fillStyle = color || 'rgba(74,144,217,0.6)';
  ctx.strokeStyle = '#3a6a9a';
  ctx.lineWidth = 2;
  // Wavy river line
  ctx.beginPath();
  ctx.moveTo(x, y + s/2);
  ctx.lineTo(x + s, y + s/2);
  ctx.stroke();
  // Wave details
  ctx.fillStyle = 'rgba(74,144,217,0.3)';
  for (let i = 0; i < s; i += 8) {
    ctx.beginPath();
    ctx.arc(x + i + 4, y + s/2, 3, 0, Math.PI);
    ctx.fill();
  }
  ctx.restore();
};

ICONS.explosion = function(ctx, x, y, s, color, alpha = 0.8) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  ctx.globalAlpha = alpha;
  // Outer burst
  const grad = ctx.createRadialGradient(cx, cy, s*0.05, cx, cy, s*0.5);
  grad.addColorStop(0, color || '#f0a500');
  grad.addColorStop(0.4, '#e94560');
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, s*0.5, 0, Math.PI*2);
  ctx.fill();
  // Inner core
  ctx.fillStyle = '#fff8c0';
  ctx.beginPath();
  ctx.arc(cx, cy, s*0.15, 0, Math.PI*2);
  ctx.fill();
  // Rays
  ctx.strokeStyle = '#f0a500';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI*2/6) * i;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle)*s*0.55, cy + Math.sin(angle)*s*0.55);
    ctx.stroke();
  }
  ctx.restore();
};

ICONS.arrow = function(ctx, fromX, fromY, toX, toY, color) {
  const dx = toX - fromX, dy = toY - fromY;
  const length = Math.sqrt(dx*dx + dy*dy);
  const ux = dx / length, uy = dy / length;
  ctx.save();
  ctx.strokeStyle = color || '#f0a500';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.setLineDash([]);
  // Arrowhead
  const headLength = 12;
  ctx.fillStyle = color || '#f0a500';
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(toX - ux*headLength + uy*headLength*0.4, toY - uy*headLength - ux*headLength*0.4);
  ctx.lineTo(toX - ux*headLength - uy*headLength*0.4, toY - uy*headLength + ux*headLength*0.4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

ICONS.flag = function(ctx, x, y, s, color) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  // Pole
  ctx.strokeStyle = '#8a8a8a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s*0.4);
  ctx.lineTo(cx, cy - s*0.45);
  ctx.stroke();
  // Flag
  ctx.fillStyle = color || '#e94560';
  ctx.beginPath();
  ctx.moveTo(cx, cy - s*0.45);
  ctx.lineTo(cx + s*0.4, cy - s*0.25);
  ctx.lineTo(cx, cy - s*0.05);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

ICONS.defensive_line = function(ctx, x, y, s, color) {
  ctx.save();
  ctx.strokeStyle = color || '#d4a574';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  // Bumpy line
  for (let i = 0; i <= s; i += 10) {
    ctx.lineTo(x + i, y + (i % 20 === 0 ? -5 : 5));
  }
  ctx.stroke();
  ctx.setLineDash([]);
  // X markers
  ctx.strokeStyle = color || '#d4a574';
  for (let i = 0; i < s; i += 30) {
    const mx = x + i + 15;
    ctx.beginPath();
    ctx.moveTo(mx - 3, y - 3);
    ctx.lineTo(mx + 3, y + 3);
    ctx.moveTo(mx + 3, y - 3);
    ctx.lineTo(mx - 3, y + 3);
    ctx.stroke();
  }
  ctx.restore();
};

ICONS.smoke = function(ctx, x, y, s, alpha = 0.5) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#888';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + i*12, y - i*6, s*0.2 + i*5, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
};

ICONS.victory_star = function(ctx, x, y, s, color) {
  const cx = x + s/2, cy = y + s/2;
  ctx.save();
  ctx.fillStyle = color || '#f0d4a8';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI*2/5)*i - Math.PI/2;
    const innerAngle = outerAngle + Math.PI/5;
    const outerR = s*0.45, innerR = s*0.18;
    if (i === 0) ctx.moveTo(cx + Math.cos(outerAngle)*outerR, cy + Math.sin(outerAngle)*outerR);
    else ctx.lineTo(cx + Math.cos(outerAngle)*outerR, cy + Math.sin(outerAngle)*outerR);
    ctx.lineTo(cx + Math.cos(innerAngle)*innerR, cy + Math.sin(innerAngle)*innerR);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = color || '#d4a574';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
};

// Draw battlefield terrain background
export function drawTerrain(ctx, width, height) {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  skyGrad.addColorStop(0, '#1a1a3e');
  skyGrad.addColorStop(1, '#3a5a8a');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height * 0.6);

  // Ground
  const groundGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
  groundGrad.addColorStop(0, '#3a6a3a');
  groundGrad.addColorStop(0.5, '#2a5a2a');
  groundGrad.addColorStop(1, '#1a3a1a');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, height * 0.6, width, height * 0.4);

  // Horizon line
  ctx.strokeStyle = 'rgba(200,200,200,0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height * 0.6);
  ctx.lineTo(width, height * 0.6);
  ctx.stroke();

  // Grid lines (subtle)
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  const gridSize = 40;
  for (let x = gridSize; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = gridSize; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

// Draw a label under an entity
export function drawLabel(ctx, text, x, y, size = 12) {
  ctx.save();
  ctx.font = `${size}px sans-serif`;
  ctx.fillStyle = '#e8e8f0';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 3;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Draw health/count indicator
export function drawCountBadge(ctx, count, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI*2);
  ctx.fill();
  ctx.fillStyle = '#e8e8f0';
  ctx.font = 'bold 10px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(count, x, y);
  ctx.restore();
}

export default ICONS;
