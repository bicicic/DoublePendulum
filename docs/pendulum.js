const TRAIL_LIMIT = 2400;
const TAU = Math.PI * 2;

export class PendulumRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.trails = new Map();
  }

  clear() {
    this.trails.clear();
    this.render([]);
  }

  record(snapshot) {
    let trail = this.trails.get(snapshot.id);
    if (!trail) {
      trail = [];
      this.trails.set(snapshot.id, trail);
    }
    trail.push({ x: snapshot.x2, y: snapshot.y2 });
    if (trail.length > TRAIL_LIMIT) {
      trail.splice(0, trail.length - TRAIL_LIMIT);
    }
  }

  render(items) {
    const { width, height } = fitCanvas(this.canvas, this.context);
    this.context.clearRect(0, 0, width, height);
    if (items.length === 0) {
      drawEmptyState(this.context, width, height);
      return;
    }

    const longest = Math.max(...items.map((item) => item.config.l1 + item.config.l2));
    const scale = Math.min(width * 0.43, height * 0.43) / longest;
    const origin = { x: width * 0.5, y: height * 0.5 };

    drawReference(this.context, origin, longest * scale);
    for (const item of items) {
      this.drawTrail(item.snapshot.id, item.config.palette.trailHue, origin, scale);
    }
    for (const item of items) {
      drawPendulum(this.context, item, origin, scale);
    }
  }

  drawTrail(id, hue, origin, scale) {
    const trail = this.trails.get(id) ?? [];
    if (trail.length < 2) return;

    this.context.lineWidth = 1.7;
    this.context.lineCap = "round";

    for (let index = 1; index < trail.length; index += 1) {
      const age = index / (trail.length - 1);
      const lightness = 16 + age * 58;
      const alpha = 0.08 + age * 0.82;
      this.context.strokeStyle = `hsla(${hue}, 75%, ${lightness}%, ${alpha})`;
      this.context.beginPath();
      this.context.moveTo(origin.x + trail[index - 1].x * scale, origin.y + trail[index - 1].y * scale);
      this.context.lineTo(origin.x + trail[index].x * scale, origin.y + trail[index].y * scale);
      this.context.stroke();
    }
  }
}

function drawPendulum(context, item, origin, scale) {
  const { snapshot, config } = item;
  const { palette } = config;
  const x1 = origin.x + snapshot.x1 * scale;
  const y1 = origin.y + snapshot.y1 * scale;
  const x2 = origin.x + snapshot.x2 * scale;
  const y2 = origin.y + snapshot.y2 * scale;

  context.lineCap = "round";
  context.lineWidth = 4;
  context.strokeStyle = palette.rod;
  context.beginPath();
  context.moveTo(origin.x, origin.y);
  context.lineTo(x1, y1);
  context.lineTo(x2, y2);
  context.stroke();

  drawMass(context, x1, y1, config.m1, palette.m1);
  drawMass(context, x2, y2, config.m2, palette.m2);

  context.fillStyle = "#f2f6f8";
  context.beginPath();
  context.arc(origin.x, origin.y, 5, 0, TAU);
  context.fill();
}

function drawMass(context, x, y, mass, color) {
  const radius = Math.min(20, 8 + Math.sqrt(mass) * 4);
  context.save();
  context.shadowColor = color;
  context.shadowBlur = 14;
  context.fillStyle = color;
  context.beginPath();
  context.arc(x, y, radius, 0, TAU);
  context.fill();
  context.restore();
}

function drawReference(context, origin, pendulumHeight) {
  context.save();
  context.setLineDash([3, 7]);
  context.strokeStyle = "rgba(255, 255, 255, 0.11)";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(origin.x, origin.y);
  context.lineTo(origin.x, origin.y + pendulumHeight);
  context.stroke();
  context.restore();
}

function drawEmptyState(context, width, height) {
  context.fillStyle = "#677382";
  context.font = "13px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText("初期条件を設定してスタート", width / 2, height / 2);
}

function fitCanvas(canvas, context) {
  const rect = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.max(1, Math.round(rect.width * ratio));
  const pixelHeight = Math.max(1, Math.round(rect.height * ratio));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width: rect.width, height: rect.height };
}
