// tests/helpers/mock-storage.mjs
// In-memory Web Storage API implementation for isolating tests

export class MockLocalStorage {
  constructor(initialData = {}) {
    this.store = { ...initialData };
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }

  dump() {
    return { ...this.store };
  }
}
