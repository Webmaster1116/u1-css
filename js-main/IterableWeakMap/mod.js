export class IterableWeakMap {
    #weakMap = new WeakMap();
    #refSet = new Set();
    #finalizationGroup = new FinalizationRegistry(IterableWeakMap.#cleanup);

    static #cleanup({ set, ref }) {
        set.delete(ref);
    }

    constructor(iterable) {
        for (const [key, value] of iterable) {
            this.set(key, value);
        }
    }

    set(key, value) {
        const ref = new WeakRef(key);

        this.#weakMap.set(key, { value, ref });
        this.#refSet.add(ref);
        this.#finalizationGroup.register(key, {
            set: this.#refSet,
            ref
        }, ref);
    }

    get(key) {
        const entry = this.#weakMap.get(key);
        return entry && entry.value;
    }

    delete(key) {
        const entry = this.#weakMap.get(key);
        if (!entry) {
            return false;
        }

        this.#weakMap.delete(key);
        this.#refSet.delete(entry.ref);
        this.#finalizationGroup.unregister(entry.ref);
        return true;
    }

    *[Symbol.iterator]() {
        for (const ref of this.#refSet) {
            const key = ref.deref();
            if (!key) continue;
            const { value } = this.#weakMap.get(key);
            yield [key, value];
        }
    }

    entries() {
        return this[Symbol.iterator]();
    }

    *keys() {
        for (const [key, value] of this) {
            yield key;
        }
    }

    *values() {
        for (const [key, value] of this) {
            yield value;
        }
    }
}