import { PendulumRenderer } from "./pendulum.js?v=6";
import { EnergyChart } from "./energy-chart.js?v=6";

const MAX_FRAME_SECONDS = 0.1;
const MAX_STEPS_PER_FRAME = 24;
const TO_RADIANS = Math.PI / 180;
const SPINNER_STEP = 0.01;
const FIELD_NAMES = ["m1", "m2", "l1", "l2", "theta1", "theta2"];
const PALETTES = [
  { m1: "#55e6e0", m2: "#a5fff9", rod: "#8df3ed", trailHue: 178 },
  { m1: "#ff9d5c", m2: "#ffd0aa", rod: "#ffb27e", trailHue: 24 },
  { m1: "#b59cff", m2: "#e0d7ff", rod: "#c7b6ff", trailHue: 258 },
];
const DEFAULT_CONFIGS = [
  { m1: 1, m2: 1, l1: 1, l2: 1, theta1: 170, theta2: 120 },
  { m1: 1, m2: 1, l1: 1, l2: 1, theta1: 170, theta2: 120 },
  { m1: 1, m2: 1, l1: 1, l2: 1, theta1: 170, theta2: 120 },
];

const form = document.querySelector("#settings-form");
const inputs = [...form.querySelectorAll("input")];
const energySelectors = [...document.querySelectorAll("[data-energy-index]")];
const startButton = document.querySelector("#start-button");
const pauseButton = document.querySelector("#pause-button");
const resetButton = document.querySelector("#reset-button");
const timeValue = document.querySelector("#time-value");
const status = document.querySelector("#status");
const statusText = document.querySelector("#status-text");
const energyPendulumNumber = document.querySelector("#energy-pendulum-number");

const pendulumRenderer = new PendulumRenderer(document.querySelector("#pendulum-canvas"));
const energyChart = new EnergyChart(document.querySelector("#energy-canvas"));

let world;
let SimulationWorld;
let mode = "loading";
let selectedIndex = 0;
let draftConfigs = readAllInputs();
let activeConfigs = null;
let activeIds = [];
let latestSnapshots = [];
let accumulator = 0;
let lastTimestamp = null;

const spinnerButtons = installSpinners();
initialize();

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (mode !== "idle") return;
    const configIndex = Number(input.dataset.configIndex);
    const field = input.dataset.field;
    draftConfigs[configIndex][field] = input.value === "" ? Number.NaN : Number(input.value);
    draw();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    event.preventDefault();
    adjustInput(input, event.key === "ArrowUp" ? 1 : -1);
  });
});

energySelectors.forEach((button) => {
  button.addEventListener("click", () => {
    selectedIndex = Number(button.dataset.energyIndex);
    updateSelectedEnergy();
    draw();
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
  if (!world) return;

  try {
    draftConfigs = readAllInputs();
    const configs = draftConfigs.map((config, index) => validateConfig(config, index));

    world.clear();
    activeIds = configs.map((config) => world.add_pendulum(
      config.m1,
      config.m2,
      config.l1,
      config.l2,
      config.theta1 * TO_RADIANS,
      config.theta2 * TO_RADIANS,
    ));
    activeConfigs = configs.map((config) => ({ ...config }));
    latestSnapshots = activeIds.map(readSnapshot);
    accumulator = 0;
    lastTimestamp = null;

    pendulumRenderer.clear();
    energyChart.clear();
    latestSnapshots.forEach((snapshot) => {
      pendulumRenderer.record(snapshot);
      energyChart.record(snapshot);
    });
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
  activeIds = [];
  activeConfigs = null;
  latestSnapshots = [];
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
    latestSnapshots = activeIds.map(readSnapshot);
    latestSnapshots.forEach((snapshot) => {
      pendulumRenderer.record(snapshot);
      energyChart.record(snapshot);
    });
    draw();
  } catch (error) {
    console.error(error);
    setMode("paused");
    setStatus("error", "計算を継続できませんでした。設定を見直してください");
  }
}

function validateConfig(config, index) {
  if (FIELD_NAMES.some((name) => !Number.isFinite(config[name]))) {
    throw new Error(`振り子 ${index + 1} のすべての設定に有限の数値を入力してください`);
  }
  if ([config.m1, config.m2, config.l1, config.l2].some((value) => value <= 0)) {
    throw new Error(`振り子 ${index + 1} の質量と腕の長さには正の値を入力してください`);
  }
  return { ...config };
}

function installSpinners() {
  const buttons = [];
  inputs.forEach((input) => {
    const controls = document.createElement("span");
    controls.className = "spinner-buttons";

    for (const [direction, symbol, action] of [[1, "▲", "増やす"], [-1, "▼", "減らす"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "spinner-button";
      button.tabIndex = -1;
      button.textContent = symbol;
      button.setAttribute("aria-label", `${input.getAttribute("aria-label")}を0.01${action}`);
      button.addEventListener("click", () => adjustInput(input, direction));
      controls.append(button);
      buttons.push(button);
    }
    input.parentElement.append(controls);
  });
  return buttons;
}

function adjustInput(input, direction) {
  if (input.disabled) return;
  const current = input.value === "" ? 0 : Number(input.value);
  const base = Number.isFinite(current) ? current : 0;
  let next = Number((base + direction * SPINNER_STEP).toFixed(12));
  if (input.min !== "") next = Math.max(Number(input.min), next);
  input.value = String(next);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function readAllInputs() {
  const configs = DEFAULT_CONFIGS.map(() => ({}));
  inputs.forEach((input) => {
    const configIndex = Number(input.dataset.configIndex);
    const field = input.dataset.field;
    configs[configIndex][field] = input.value === "" ? Number.NaN : Number(input.value);
  });
  return configs;
}

function createPreview(config, index) {
  try {
    validateConfig(config, index);
  } catch {
    return null;
  }

  const theta1 = config.theta1 * TO_RADIANS;
  const theta2 = config.theta2 * TO_RADIANS;
  const x1 = config.l1 * Math.sin(theta1);
  const y1 = config.l1 * Math.cos(theta1);
  return {
    id: `preview-${index}`,
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

function renderItem(snapshot, config, index) {
  return {
    snapshot,
    config: { ...config, palette: PALETTES[index] },
  };
}

function draw() {
  let items;
  let currentTime = 0;
  let selectedId = null;

  if (mode === "idle") {
    items = draftConfigs
      .map((config, index) => {
        const preview = createPreview(config, index);
        return preview ? renderItem(preview, config, index) : null;
      })
      .filter(Boolean);
  } else {
    items = latestSnapshots.map((snapshot, index) => renderItem(snapshot, activeConfigs[index], index));
    currentTime = latestSnapshots[0]?.time ?? 0;
    selectedId = activeIds[selectedIndex] ?? null;
  }

  pendulumRenderer.render(items);
  energyChart.render(currentTime, selectedId);
  timeValue.textContent = currentTime.toFixed(2);
}

function updateSelectedEnergy() {
  energySelectors.forEach((button, index) => {
    const selected = index === selectedIndex;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  energyPendulumNumber.textContent = String(selectedIndex + 1);
}

function setMode(nextMode) {
  mode = nextMode;
  const locked = mode === "running" || mode === "paused";
  inputs.forEach((input) => { input.disabled = locked; });
  spinnerButtons.forEach((button) => { button.disabled = locked; });
  startButton.disabled = mode !== "idle";
  pauseButton.disabled = !locked;
  resetButton.disabled = !locked;
  pauseButton.textContent = mode === "paused" ? "再開" : "一時停止";

  const messages = {
    idle: "3台準備完了",
    running: "3台実行中",
    paused: "一時停止中",
  };
  setStatus(mode === "idle" ? "ready" : mode, messages[mode] ?? "読み込み中");
}

function setStatus(statusClass, message) {
  status.className = `status ${statusClass}`;
  statusText.textContent = message;
}
