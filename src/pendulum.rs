use crate::{
    dynamics::{energy, positions},
    integrator::{STEP_SECONDS, rk4_step},
    model::{Energy, Parameters, Positions, State},
};

#[derive(Clone, Debug)]
pub struct Pendulum {
    parameters: Parameters,
    state: State,
}

impl Pendulum {
    pub fn new(parameters: Parameters, state: State) -> Self {
        Self { parameters, state }
    }

    pub fn advance(&mut self) {
        self.state = rk4_step(self.parameters, self.state, STEP_SECONDS);
    }

    pub fn state(&self) -> State {
        self.state
    }

    pub fn positions(&self) -> Positions {
        positions(self.parameters, self.state)
    }

    pub fn energy(&self) -> Energy {
        energy(self.parameters, self.state)
    }
}
