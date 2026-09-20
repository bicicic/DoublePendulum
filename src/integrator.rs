use crate::{
    dynamics::derivative,
    model::{Parameters, State},
};

pub const STEP_SECONDS: f64 = 1.0 / 240.0;

pub fn rk4_step(parameters: Parameters, state: State, dt: f64) -> State {
    let k1 = derivative(parameters, state);
    let k2 = derivative(parameters, state.add_scaled(k1, dt * 0.5));
    let k3 = derivative(parameters, state.add_scaled(k2, dt * 0.5));
    let k4 = derivative(parameters, state.add_scaled(k3, dt));

    State {
        theta1: state.theta1 + dt * weighted_sum(k1.theta1, k2.theta1, k3.theta1, k4.theta1),
        omega1: state.omega1 + dt * weighted_sum(k1.omega1, k2.omega1, k3.omega1, k4.omega1),
        theta2: state.theta2 + dt * weighted_sum(k1.theta2, k2.theta2, k3.theta2, k4.theta2),
        omega2: state.omega2 + dt * weighted_sum(k1.omega2, k2.omega2, k3.omega2, k4.omega2),
    }
}

fn weighted_sum(k1: f64, k2: f64, k3: f64, k4: f64) -> f64 {
    (k1 + 2.0 * k2 + 2.0 * k3 + k4) / 6.0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn equilibrium_does_not_move() {
        let parameters = Parameters::new(1.0, 1.0, 1.0, 1.0).unwrap();
        let initial = State::at_rest(0.0, 0.0).unwrap();
        assert_eq!(rk4_step(parameters, initial, STEP_SECONDS), initial);
    }
}
