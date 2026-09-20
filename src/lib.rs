mod dynamics;
mod integrator;
mod model;
mod pendulum;
mod world;

use integrator::STEP_SECONDS;
use model::{Parameters, State};
use wasm_bindgen::prelude::*;
use world::World;

#[wasm_bindgen]
pub struct SimulationWorld {
    inner: World,
}

#[wasm_bindgen]
impl SimulationWorld {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            inner: World::new(),
        }
    }

    pub fn add_pendulum(
        &mut self,
        m1: f64,
        m2: f64,
        l1: f64,
        l2: f64,
        theta1: f64,
        theta2: f64,
    ) -> Result<u32, JsValue> {
        let parameters = Parameters::new(m1, m2, l1, l2).map_err(js_error)?;
        let state = State::at_rest(theta1, theta2).map_err(js_error)?;
        self.inner.add(parameters, state).map_err(js_error)
    }

    pub fn remove_pendulum(&mut self, id: u32) -> bool {
        self.inner.remove(id)
    }

    pub fn clear(&mut self) {
        self.inner.clear();
    }

    pub fn advance(&mut self, step_count: u32) -> Result<(), JsValue> {
        self.inner.advance(step_count).map_err(js_error)
    }

    pub fn pendulum_ids(&self) -> Vec<u32> {
        self.inner.ids()
    }

    pub fn snapshot(&self, id: u32) -> Result<PendulumSnapshot, JsValue> {
        let pendulum = self
            .inner
            .pendulum(id)
            .ok_or_else(|| js_error("unknown pendulum id"))?;
        let state = pendulum.state();
        let positions = pendulum.positions();
        let energy = pendulum.energy();

        Ok(PendulumSnapshot {
            id,
            time: self.time(),
            theta1: state.theta1,
            omega1: state.omega1,
            theta2: state.theta2,
            omega2: state.omega2,
            x1: positions.x1,
            y1: positions.y1,
            x2: positions.x2,
            y2: positions.y2,
            energy1: energy.mass1,
            energy2: energy.mass2,
            total_energy: energy.total(),
        })
    }

    #[wasm_bindgen(getter)]
    pub fn time(&self) -> f64 {
        self.inner.elapsed_steps() as f64 * STEP_SECONDS
    }

    #[wasm_bindgen(getter)]
    pub fn step_seconds(&self) -> f64 {
        STEP_SECONDS
    }
}

impl Default for SimulationWorld {
    fn default() -> Self {
        Self::new()
    }
}

#[wasm_bindgen]
pub struct PendulumSnapshot {
    id: u32,
    time: f64,
    theta1: f64,
    omega1: f64,
    theta2: f64,
    omega2: f64,
    x1: f64,
    y1: f64,
    x2: f64,
    y2: f64,
    energy1: f64,
    energy2: f64,
    total_energy: f64,
}

#[wasm_bindgen]
impl PendulumSnapshot {
    #[wasm_bindgen(getter)]
    pub fn id(&self) -> u32 {
        self.id
    }
    #[wasm_bindgen(getter)]
    pub fn time(&self) -> f64 {
        self.time
    }
    #[wasm_bindgen(getter)]
    pub fn theta1(&self) -> f64 {
        self.theta1
    }
    #[wasm_bindgen(getter)]
    pub fn omega1(&self) -> f64 {
        self.omega1
    }
    #[wasm_bindgen(getter)]
    pub fn theta2(&self) -> f64 {
        self.theta2
    }
    #[wasm_bindgen(getter)]
    pub fn omega2(&self) -> f64 {
        self.omega2
    }
    #[wasm_bindgen(getter)]
    pub fn x1(&self) -> f64 {
        self.x1
    }
    #[wasm_bindgen(getter)]
    pub fn y1(&self) -> f64 {
        self.y1
    }
    #[wasm_bindgen(getter)]
    pub fn x2(&self) -> f64 {
        self.x2
    }
    #[wasm_bindgen(getter)]
    pub fn y2(&self) -> f64 {
        self.y2
    }
    #[wasm_bindgen(getter)]
    pub fn energy1(&self) -> f64 {
        self.energy1
    }
    #[wasm_bindgen(getter)]
    pub fn energy2(&self) -> f64 {
        self.energy2
    }
    #[wasm_bindgen(getter)]
    pub fn total_energy(&self) -> f64 {
        self.total_energy
    }
}

fn js_error(message: &str) -> JsValue {
    JsValue::from_str(message)
}
