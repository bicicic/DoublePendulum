/* tslint:disable */
/* eslint-disable */

export class PendulumSnapshot {
    private constructor();
    free(): void;
    [Symbol.dispose](): void;
    readonly energy1: number;
    readonly energy2: number;
    readonly id: number;
    readonly omega1: number;
    readonly omega2: number;
    readonly theta1: number;
    readonly theta2: number;
    readonly time: number;
    readonly total_energy: number;
    readonly x1: number;
    readonly x2: number;
    readonly y1: number;
    readonly y2: number;
}

export class SimulationWorld {
    free(): void;
    [Symbol.dispose](): void;
    add_pendulum(m1: number, m2: number, l1: number, l2: number, theta1: number, theta2: number): number;
    advance(step_count: number): void;
    clear(): void;
    constructor();
    pendulum_ids(): Uint32Array;
    remove_pendulum(id: number): boolean;
    snapshot(id: number): PendulumSnapshot;
    readonly step_seconds: number;
    readonly time: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly __wbg_pendulumsnapshot_free: (a: number, b: number) => void;
    readonly __wbg_simulationworld_free: (a: number, b: number) => void;
    readonly pendulumsnapshot_energy1: (a: number) => number;
    readonly pendulumsnapshot_energy2: (a: number) => number;
    readonly pendulumsnapshot_id: (a: number) => number;
    readonly pendulumsnapshot_omega1: (a: number) => number;
    readonly pendulumsnapshot_omega2: (a: number) => number;
    readonly pendulumsnapshot_theta1: (a: number) => number;
    readonly pendulumsnapshot_theta2: (a: number) => number;
    readonly pendulumsnapshot_time: (a: number) => number;
    readonly pendulumsnapshot_total_energy: (a: number) => number;
    readonly pendulumsnapshot_x1: (a: number) => number;
    readonly pendulumsnapshot_x2: (a: number) => number;
    readonly pendulumsnapshot_y1: (a: number) => number;
    readonly pendulumsnapshot_y2: (a: number) => number;
    readonly simulationworld_add_pendulum: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => [number, number, number];
    readonly simulationworld_advance: (a: number, b: number) => [number, number];
    readonly simulationworld_clear: (a: number) => void;
    readonly simulationworld_new: () => number;
    readonly simulationworld_pendulum_ids: (a: number) => [number, number];
    readonly simulationworld_remove_pendulum: (a: number, b: number) => number;
    readonly simulationworld_snapshot: (a: number, b: number) => [number, number, number];
    readonly simulationworld_step_seconds: (a: number) => number;
    readonly simulationworld_time: (a: number) => number;
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __externref_table_dealloc: (a: number) => void;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
