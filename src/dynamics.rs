use crate::model::{Derivative, Energy, Parameters, Positions, State};

pub const GRAVITY: f64 = 9.806_65;

pub fn derivative(parameters: Parameters, state: State) -> Derivative {
    let Parameters { m1, m2, l1, l2 } = parameters;
    let State {
        theta1,
        omega1,
        theta2,
        omega2,
    } = state;

    let delta = theta1 - theta2;
    let common = 2.0 * m1 + m2 - m2 * (2.0 * delta).cos();

    let alpha1 = (-GRAVITY * (2.0 * m1 + m2) * theta1.sin()
        - m2 * GRAVITY * (theta1 - 2.0 * theta2).sin()
        - 2.0 * delta.sin() * m2 * (omega2 * omega2 * l2 + omega1 * omega1 * l1 * delta.cos()))
        / (l1 * common);

    let alpha2 = (2.0
        * delta.sin()
        * (omega1 * omega1 * l1 * (m1 + m2)
            + GRAVITY * (m1 + m2) * theta1.cos()
            + omega2 * omega2 * l2 * m2 * delta.cos()))
        / (l2 * common);

    Derivative {
        theta1: omega1,
        omega1: alpha1,
        theta2: omega2,
        omega2: alpha2,
    }
}

pub fn positions(parameters: Parameters, state: State) -> Positions {
    let x1 = parameters.l1 * state.theta1.sin();
    let y1 = parameters.l1 * state.theta1.cos();

    Positions {
        x1,
        y1,
        x2: x1 + parameters.l2 * state.theta2.sin(),
        y2: y1 + parameters.l2 * state.theta2.cos(),
    }
}

pub fn energy(parameters: Parameters, state: State) -> Energy {
    let Parameters { m1, m2, l1, l2 } = parameters;
    let delta = state.theta1 - state.theta2;

    let kinetic1 = 0.5 * m1 * l1 * l1 * state.omega1 * state.omega1;
    let potential1 = m1 * GRAVITY * l1 * (1.0 - state.theta1.cos());

    let speed2_squared = l1 * l1 * state.omega1 * state.omega1
        + l2 * l2 * state.omega2 * state.omega2
        + 2.0 * l1 * l2 * state.omega1 * state.omega2 * delta.cos();
    let kinetic2 = 0.5 * m2 * speed2_squared;
    let potential2 =
        m2 * GRAVITY * (l1 * (1.0 - state.theta1.cos()) + l2 * (1.0 - state.theta2.cos()));

    Energy {
        mass1: kinetic1 + potential1,
        mass2: kinetic2 + potential2,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn unit_parameters() -> Parameters {
        Parameters::new(1.0, 1.0, 1.0, 1.0).unwrap()
    }

    #[test]
    fn downward_rest_is_equilibrium() {
        let result = derivative(unit_parameters(), State::at_rest(0.0, 0.0).unwrap());
        assert_eq!(result.omega1, 0.0);
        assert_eq!(result.omega2, 0.0);
    }

    #[test]
    fn downward_positions_and_energy_use_expected_reference() {
        let state = State::at_rest(0.0, 0.0).unwrap();
        let positions = positions(unit_parameters(), state);
        let energy = energy(unit_parameters(), state);

        assert!((positions.x1).abs() < 1e-12);
        assert!((positions.y1 - 1.0).abs() < 1e-12);
        assert!((positions.x2).abs() < 1e-12);
        assert!((positions.y2 - 2.0).abs() < 1e-12);
        assert!(energy.mass1.abs() < 1e-12);
        assert!(energy.mass2.abs() < 1e-12);
    }
}
