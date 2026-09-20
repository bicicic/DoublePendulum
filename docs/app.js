import { PendulumRenderer } from "./pendulum.js";
import { EnergyChart } from "./energy-chart.js";

const MAX_FRAME_SECONDS = 0.1;
const MAX_STEPS_PER_FRAME = 24;
const TO_RADIANS = Math.PI / 180;

const form = document.querySelector("#settings-form");
const inputs = [...form.querySelectorAll("input")];
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const resetButton = document.querySelector("#reset-button");
const timeValue = document.querySelector("#time-value");
const status = document.querySelector("#status");
const statusText = document.querySelector("#status-text");

const pendulumRenderer = new PendulumRenderer(document.querySelector("#pendulum-canvas"));
const energyChart = new EnergyChart(document.querySelector("#energy-canvas"));

let world;
let SimulationWorld;
let activeId = null;
let activeConfig = null;
let mode = "loading";
let accumulator = 0;
let lastTimestamp = null;
let latestSnapshot = null;

initialize();

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (mode === "idle") draw();
  });
});

async function initialize() {
  try {
    const wasmModule = await import("./pkg/double_pendulum.js");
    SimulationWorld = wasmModule.SimulationWorld;
    const init = wasmModule.default;
    await init();
    world = new SimulationWorld();
    setMode("idle");
    draw();
    requestAnimationFrame(frame);
  } catch (error) {
    console.error(error);
    setStatus("error", "Wasmの読み込みに失敗しました");
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity() || !world) return;

  try {
    const config = readConfig();
    world.clear();
    activeId = world.add_pendulum(
      config.m1,
      config.m2,
      config.l1,
      config.l2,
      config.theta1 * TO_RADIANS,
      config.theta2 * TO_RADIANS,
    );
    activeConfig = config;
    accumulator = 0;
    lastTimestamp = null;
    latestSnapshot = readSnapshot(activeId);
    pendulumRenderer.clear();
    energyChart.clear();
    pendulumRenderer.record(latestSnapshot);
    energyChart.record(latestSnapshot);
    setMode("running");
    draw();
  } catch (error) {
    console.error(error);
    setStatus("error", error instanceof Error ? error.message : String(error));
  }
});

pauseButton.addEventListener("click", () => {
  if (mode === "running") {
    setMode("paused");
  } else if (mode === "paused") {
    lastTimestamp = null;
    setMode("running");
  }
});

resetButton.addEventListener("click", () => {
  world.clear();
  activeId = null;
  activeConfig = null;
  latestSnapshot = null;
  accumulator = 0;
  lastTimestamp = null;
  timeValue.textContent = "0.00";
  pendulumRenderer.clear();
  energyChart.clear();
  setMode("idle");
  draw();
});

window.addEventListener("resize", draw);

function frame(timestamp) {
  if (mode === "running") update(timestamp);
  requestAnimationFrame(frame);
}

function update(timestamp) {
  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
    return;
  }

  const elapsed = Math.min((timestamp - lastTimestamp) / 1000, MAX_FRAME_SECONDS);
  lastTimestamp = timestamp;
  accumulator += elapsed;

  const steps = Math.min(Math.floor(accumulator / world.step_seconds), MAX_STEPS_PER_FRAME);
  if (steps === 0) return;

  try {
    world.advance(steps);
    accumulator -= steps * world.step_seconds;
    latestSnapshot = readSnapshot(activeId);
    pendulumRenderer.record(latestSnapshot);
    energyChart.record(latestSnapshot);
    draw();
  } catch (error) {
    console.error(error);
    setMode("paused");
    setStatus("error", "計算を継続できませんでした。設定を見直してください");
  }
}

function readConfig() {
  const data = new FormData(form);
  const config = Object.fromEntries(
    ["m1", "m2", "l1", "l2", "theta1", "theta2"].map((key) => [key, Number(data.get(key))]),
  );
  if (Object.values(config).some((value) => !Number.isFinite(value))) {
    throw new Error("すべての設定に有限の数値を入力してください");
  }
  if ([config.m1, config.m2, config.l1, config.l2].some((value) => value <= 0)) {
    throw new Error("質量と腕の長さには正の値を入力してください");
  }
  return config;
}

function readDisplayConfig() {
  return Object.fromEntries(
    inputs.map((input) => [input.name, input.value === "" ? Number.NaN : Number(input.value)]),
  );
}

function createPreview(config) {
  const values = Object.values(config);
  const positiveDimensions = [config.m1, config.m2, config.l1, config.l2]
    .every((value) => value > 0);
  if (values.some((value) => !Number.isFinite(value)) || !positiveDimensions) return null;

  const theta1 = config.theta1 * TO_RADIANS;
  const theta2 = config.theta2 * TO_RADIANS;
  const x1 = config.l1 * Math.sin(theta1);
  const y1 = config.l1 * Math.cos(theta1);
  return {
    id: 0,
    time: 0,
    theta1,
    theta2,
    omega1: 0,
    omega2: 0,
    x1,
    y1,
    x2: x1 + config.l2 * Math.sin(theta2),
    y2: y1 + config.l2 * Math.cos(theta2),
    energy1: 0,
    energy2: 0,
    totalEnergy: 0,
  };
}

function readSnapshot(id) {
  const source = world.snapshot(id);
  const snapshot = {
    id: source.id,
    time: source.time,
    theta1: source.theta1,
    omega1: source.omega1,
    theta2: source.theta2,
    omega2: source.omega2,
    x1: source.x1,
    y1: source.y1,
    x2: source.x2,
    y2: source.y2,
    energy1: source.energy1,
    energy2: source.energy2,
    totalEnergy: source.total_energy,
  };
  source.free();
  return snapshot;
}

function draw() {
  const previewConfig = mode === "idle" ? readDisplayConfig() : null;
  const preview = previewConfig ? createPreview(previewConfig) : null;
  const displayedSnapshot = latestSnapshot ?? preview;
  const displayedConfig = activeConfig ?? previewConfig;
  const items = displayedSnapshot && displayedConfig
    ? [{ snapshot: displayedSnapshot, config: displayedConfig }]
    : [];
  pendulumRenderer.render(items);
  energyChart.render(latestSnapshot?.time ?? 0);
  if (latestSnapshot) timeValue.textContent = latestSnapshot.time.toFixed(2);
}

function setMode(nextMode) {
  mode = nextMode;
  const locked = mode === "running" || mode === "paused";
  inputs.forEach((input) => { input.disabled = locked; });
  startButton.disabled = mode !== "idle";
  pauseButton.disabled = !locked;
  resetButton.disabled = !locked;
  pauseButton.textContent = mode === "paused" ? "再開" : "一時停止";

  const messages = {
    idle: "準備完了",
    running: "実行中",
    paused: "一時停止中",
  };
  setStatus(mode === "idle" ? "ready" : mode, messages[mode] ?? "読み込み中");
}

function setStatus(statusClass, message) {
  status.className = `status ${statusClass}`;
  statusText.textContent = message;
}
