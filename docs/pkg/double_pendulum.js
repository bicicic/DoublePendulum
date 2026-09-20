/* @ts-self-types="./double_pendulum.d.ts" */

export class PendulumSnapshot {
    static __wrap(ptr) {
        const obj = Object.create(PendulumSnapshot.prototype);
        obj.__wbg_ptr = ptr;
        PendulumSnapshotFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PendulumSnapshotFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_pendulumsnapshot_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get energy1() {
        const ret = wasm.pendulumsnapshot_energy1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get energy2() {
        const ret = wasm.pendulumsnapshot_energy2(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get id() {
        const ret = wasm.pendulumsnapshot_id(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get omega1() {
        const ret = wasm.pendulumsnapshot_omega1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get omega2() {
        const ret = wasm.pendulumsnapshot_omega2(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get theta1() {
        const ret = wasm.pendulumsnapshot_theta1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get theta2() {
        const ret = wasm.pendulumsnapshot_theta2(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get time() {
        const ret = wasm.pendulumsnapshot_time(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get total_energy() {
        const ret = wasm.pendulumsnapshot_total_energy(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get x1() {
        const ret = wasm.pendulumsnapshot_x1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get x2() {
        const ret = wasm.pendulumsnapshot_x2(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get y1() {
        const ret = wasm.pendulumsnapshot_y1(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get y2() {
        const ret = wasm.pendulumsnapshot_y2(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) PendulumSnapshot.prototype[Symbol.dispose] = PendulumSnapshot.prototype.free;

export class SimulationWorld {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SimulationWorldFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_simulationworld_free(ptr, 0);
    }
    /**
     * @param {number} m1
     * @param {number} m2
     * @param {number} l1
     * @param {number} l2
     * @param {number} theta1
     * @param {number} theta2
     * @returns {number}
     */
    add_pendulum(m1, m2, l1, l2, theta1, theta2) {
        const ret = wasm.simulationworld_add_pendulum(this.__wbg_ptr, m1, m2, l1, l2, theta1, theta2);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return ret[0] >>> 0;
    }
    /**
     * @param {number} step_count
     */
    advance(step_count) {
        const ret = wasm.simulationworld_advance(this.__wbg_ptr, step_count);
        if (ret[1]) {
            throw takeFromExternrefTable0(ret[0]);
        }
    }
    clear() {
        wasm.simulationworld_clear(this.__wbg_ptr);
    }
    constructor() {
        const ret = wasm.simulationworld_new();
        this.__wbg_ptr = ret;
        SimulationWorldFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @returns {Uint32Array}
     */
    pendulum_ids() {
        const ret = wasm.simulationworld_pendulum_ids(this.__wbg_ptr);
        var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
        return v1;
    }
    /**
     * @param {number} id
     * @returns {boolean}
     */
    remove_pendulum(id) {
        const ret = wasm.simulationworld_remove_pendulum(this.__wbg_ptr, id);
        return ret !== 0;
    }
    /**
     * @param {number} id
     * @returns {PendulumSnapshot}
     */
    snapshot(id) {
        const ret = wasm.simulationworld_snapshot(this.__wbg_ptr, id);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return PendulumSnapshot.__wrap(ret[0]);
    }
    /**
     * @returns {number}
     */
    get step_seconds() {
        const ret = wasm.simulationworld_step_seconds(this.__wbg_ptr);
        return ret;
    }
    /**
     * @returns {number}
     */
    get time() {
        const ret = wasm.simulationworld_time(this.__wbg_ptr);
        return ret;
    }
}
if (Symbol.dispose) SimulationWorld.prototype[Symbol.dispose] = SimulationWorld.prototype.free;
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_5d9e815e6fdf150f: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_generic_0000000000000001: function(arg0, arg1) {
            // Cast intrinsic for `Ref(String) -> Externref`.
            const ret = getStringFromWasm0(arg0, arg1);
            return ret;
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./double_pendulum_bg.js": import0,
    };
}

const PendulumSnapshotFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_pendulumsnapshot_free(ptr, 1));
const SimulationWorldFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_simulationworld_free(ptr, 1));

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function takeFromExternrefTable0(idx) {
    const value = wasm.__wbindgen_externrefs.get(idx);
    wasm.__externref_table_dealloc(idx);
    return value;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('double_pendulum_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
