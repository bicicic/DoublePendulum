#[derive(Clone, Copy, Debug)]
pub struct Parameters {
    pub m1: f64,
    pub m2: f64,
    pub l1: f64,
    pub l2: f64,
}

impl Parameters {
    pub fn new(m1: f64, m2: f64, l1: f64, l2: f64) -> Result<Self, &'static str> {
        if !m1.is_finite() || m1 <= 0.0 {
            return Err("m1 must be a positive finite number");
        }
        if !m2.is_finite() || m2 <= 0.0 {
            return Err("m2 must be a positive finite number");
        }
        if !l1.is_finite() || l1 <= 0.0 {
            return Err("l1 must be a positive finite number");
        }
        if !l2.is_finite() || l2 <= 0.0 {
            return Err("l2 must be a positive finite number");
        }

        Ok(Self { m1, m2, l1, l2 })
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct State {
    pub theta1: f64,
    pub omega1: f64,
    pub theta2: f64,
    pub omega2: f64,
}

impl State {
    pub fn at_rest(theta1: f64, theta2: f64) -> Result<Self, &'static str> {
        if !theta1.is_finite() || !theta2.is_finite() {
            return Err("angles must be finite numbers");
        }

        Ok(Self {
            theta1,
            omega1: 0.0,
            theta2,
            omega2: 0.0,
        })
    }

    pub fn add_scaled(self, derivative: Derivative, scale: f64) -> Self {
        Self {
            theta1: self.theta1 + derivative.theta1 * scale,
            omega1: self.omega1 + derivative.omega1 * scale,
            theta2: self.theta2 + derivative.theta2 * scale,
            omega2: self.omega2 + derivative.omega2 * scale,
        }
    }

    pub fn is_finite(self) -> bool {
        self.theta1.is_finite()
            && self.omega1.is_finite()
            && self.theta2.is_finite()
            && self.omega2.is_finite()
    }
}

#[derive(Clone, Copy, Debug)]
pub struct Derivative {
    pub theta1: f64,
    pub omega1: f64,
    pub theta2: f64,
    pub omega2: f64,
}

#[derive(Clone, Copy, Debug)]
pub struct Positions {
    pub x1: f64,
    pub y1: f64,
    pub x2: f64,
    pub y2: f64,
}

#[derive(Clone, Copy, Debug)]
pub struct Energy {
    pub mass1: f64,
    pub mass2: f64,
}

impl Energy {
    pub fn total(self) -> f64 {
        self.mass1 + self.mass2
    }
}
