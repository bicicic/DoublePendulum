const WINDOW_SECONDS = 20;
const COLORS = {
  energy1: "#ff9d5c",
  energy2: "#55e6e0",
  totalEnergy: "#f8e36e",
};

export class EnergyChart {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.histories = new Map();
  }

  clear() {
    this.histories.clear();
    this.render(0);
  }

  record(snapshot) {
    let history = this.histories.get(snapshot.id);
    if (!history) {
      history = [];
      this.histories.set(snapshot.id, history);
    }
    history.push(snapshot);

    const cutoff = snapshot.time - WINDOW_SECONDS;
    let removeCount = 0;
    while (removeCount < history.length && history[removeCount].time < cutoff) {
      removeCount += 1;
    }
    if (removeCount > 0) history.splice(0, removeCount);
  }

  render(currentTime, selectedId = null) {
    const { width, height } = fitCanvas(this.canvas, this.context);
    this.context.clearRect(0, 0, width, height);

    const bounds = { left: 52, right: width - 18, top: 18, bottom: height - 34 };
    if (bounds.right <= bounds.left || bounds.bottom <= bounds.top) return;

    const selectedHistory = selectedId === null ? [] : (this.histories.get(selectedId) ?? []);
    const allPoints = selectedHistory;
    const maxEnergy = Math.max(
      1,
      ...allPoints.flatMap((point) => [point.energy1, point.energy2, point.totalEnergy]),
    );
    const yMax = maxEnergy * 1.1;
    const timeMax = Math.max(WINDOW_SECONDS, currentTime);
    const timeMin = timeMax - WINDOW_SECONDS;

    drawAxes(this.context, bounds, timeMin, timeMax, yMax);
    drawSeries(this.context, selectedHistory, "energy1", COLORS.energy1, bounds, timeMin, timeMax, yMax);
    drawSeries(this.context, selectedHistory, "energy2", COLORS.energy2, bounds, timeMin, timeMax, yMax);
    drawSeries(this.context, selectedHistory, "totalEnergy", COLORS.totalEnergy, bounds, timeMin, timeMax, yMax);
  }
}

function drawAxes(context, bounds, timeMin, timeMax, yMax) {
  const { left, right, top, bottom } = bounds;
  context.save();
  context.font = "10px ui-monospace, monospace";
  context.fillStyle = "#718091";
  context.strokeStyle = "rgba(255, 255, 255, 0.09)";
  context.lineWidth = 1;

  for (let index = 0; index <= 4; index += 1) {
    const fraction = index / 4;
    const y = bottom - fraction * (bottom - top);
    context.beginPath();
    context.moveTo(left, y);
    context.lineTo(right, y);
    context.stroke();
    context.textAlign = "right";
    context.textBaseline = "middle";
    context.fillText(formatEnergy(fraction * yMax), left - 8, y);
  }

  for (let index = 0; index <= 4; index += 1) {
    const fraction = index / 4;
    const x = left + fraction * (right - left);
    context.textAlign = "center";
    context.textBaseline = "top";
    context.fillText(`${(timeMin + fraction * (timeMax - timeMin)).toFixed(0)}s`, x, bottom + 9);
  }

  context.save();
  context.translate(13, (top + bottom) / 2);
  context.rotate(-Math.PI / 2);
  context.textAlign = "center";
  context.fillText("ENERGY (J)", 0, 0);
  context.restore();
  context.restore();
}

function drawSeries(context, history, key, color, bounds, timeMin, timeMax, yMax) {
  const visible = history.filter((point) => point.time >= timeMin && point.time <= timeMax);
  if (visible.length < 2) return;

  const { left, right, top, bottom } = bounds;
  context.save();
  context.beginPath();
  context.rect(left, top, right - left, bottom - top);
  context.clip();
  context.beginPath();
  context.strokeStyle = color;
  context.lineWidth = key === "totalEnergy" ? 1.8 : 1.35;

  visible.forEach((point, index) => {
    const x = left + ((point.time - timeMin) / (timeMax - timeMin)) * (right - left);
    const y = bottom - (point[key] / yMax) * (bottom - top);
    if (index === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  });
  context.stroke();
  context.restore();
}

function formatEnergy(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  if (value >= 10) return value.toFixed(0);
  return value.toFixed(1);
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
