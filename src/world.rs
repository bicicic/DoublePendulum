use crate::{model::*, pendulum::Pendulum};

#[derive(Debug)]
struct Entry {
    id: u32,
    pendulum: Pendulum,
}

#[derive(Debug, Default)]
pub struct World {
    entries: Vec<Entry>,
    next_id: u32,
    elapsed_steps: u64,
}

impl World {
    pub fn new() -> Self {
        Self {
            entries: Vec::new(),
            next_id: 1,
            elapsed_steps: 0,
        }
    }

    pub fn add(&mut self, parameters: Parameters, state: State) -> Result<u32, &'static str> {
        let id = self.next_id;
        self.next_id = self
            .next_id
            .checked_add(1)
            .ok_or("pendulum id space exhausted")?;
        self.entries.push(Entry {
            id,
            pendulum: Pendulum::new(parameters, state),
        });
        Ok(id)
    }

    pub fn remove(&mut self, id: u32) -> bool {
        let previous_len = self.entries.len();
        self.entries.retain(|entry| entry.id != id);
        previous_len != self.entries.len()
    }

    pub fn clear(&mut self) {
        self.entries.clear();
        self.elapsed_steps = 0;
    }

    pub fn advance(&mut self, step_count: u32) -> Result<(), &'static str> {
        for _ in 0..step_count {
            for entry in &mut self.entries {
                entry.pendulum.advance();
                if !entry.pendulum.state().is_finite() {
                    return Err("simulation produced a non-finite state");
                }
            }
            self.elapsed_steps = self
                .elapsed_steps
                .checked_add(1)
                .ok_or("simulation time overflow")?;
        }
        Ok(())
    }

    pub fn ids(&self) -> Vec<u32> {
        self.entries.iter().map(|entry| entry.id).collect()
    }

    pub fn pendulum(&self, id: u32) -> Option<&Pendulum> {
        self.entries
            .iter()
            .find(|entry| entry.id == id)
            .map(|entry| &entry.pendulum)
    }

    pub fn elapsed_steps(&self) -> u64 {
        self.elapsed_steps
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{dynamics::energy, integrator::STEP_SECONDS};

    fn add_test_pendulum(world: &mut World, theta1: f64, theta2: f64) -> u32 {
        world
            .add(
                Parameters::new(1.0, 1.0, 1.0, 1.0).unwrap(),
                State::at_rest(theta1, theta2).unwrap(),
            )
            .unwrap()
    }

    #[test]
    fn ids_remain_stable_after_removal() {
        let mut world = World::new();
        let first = add_test_pendulum(&mut world, 0.1, 0.2);
        let second = add_test_pendulum(&mut world, 0.3, 0.4);
        assert!(world.remove(first));
        let third = add_test_pendulum(&mut world, 0.5, 0.6);

        assert_eq!(world.ids(), vec![second, third]);
        assert_ne!(first, third);
    }

    #[test]
    fn identical_pendulums_remain_identical() {
        let mut world = World::new();
        let first = add_test_pendulum(&mut world, 0.8, -0.4);
        let second = add_test_pendulum(&mut world, 0.8, -0.4);
        world.advance(2_000).unwrap();
        assert_eq!(
            world.pendulum(first).unwrap().state(),
            world.pendulum(second).unwrap().state()
        );
    }

    #[test]
    fn total_energy_remains_close_over_sixty_seconds() {
        let mut world = World::new();
        let parameters = Parameters::new(1.2, 0.8, 1.1, 0.9).unwrap();
        let state = State::at_rest(1.1, -0.7).unwrap();
        let initial_energy = energy(parameters, state).total();
        let id = world.add(parameters, state).unwrap();

        world.advance((60.0 / STEP_SECONDS) as u32).unwrap();
        let final_energy = world.pendulum(id).unwrap().energy().total();
        let relative_error = (final_energy - initial_energy).abs() / initial_energy.abs();
        assert!(relative_error < 1e-4, "relative error was {relative_error}");
    }
}
