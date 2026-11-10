// Minimal observable state store.

export function createStore(initial) {
  let state = { ...initial };
  const listeners = new Set();

  return {
    get: () => state,
    set(patch) {
      const changed = Object.keys(patch).some((k) => !Object.is(state[k], patch[k]));
      if (!changed) return;
      const prev = state;
      state = { ...prev, ...patch };
      for (const fn of [...listeners]) fn(state, prev);
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
