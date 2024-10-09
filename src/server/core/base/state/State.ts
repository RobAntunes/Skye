// src/core/State.js

import { Base } from '../Base.ts';
import { effect } from '../reactivity/Effects.ts'; // Assuming Skye provides a reactive function

export class State extends Base {
  state: any;
  storageKey: string;
  override notify(_prop: string | symbol, _newValue: any) {
    throw new Error("Method not implemented.");
  }
  override middlewares: any;
  constructor() {
    super();
    this.state = effect.reactive(this.createProxy({})); // Initialize as reactive
    this.storageKey = 'skye_app_state'; // Key for localStorage
    this.loadState(); // Load persisted state if available
  }

  /**
   * Creates a Proxy to intercept state mutations.
   * @param {Object} initialState - The initial state object.
   * @returns {Proxy} The proxied state object.
   */
  createProxy(initialState: {}) {
    const self = this;
    return new Proxy(initialState, {
      get(target, prop) {
        return target[prop];
      },
      set(target, prop, value) {
        const oldValue = target[prop];
        const newValue = self.applyMiddlewares(prop, value, oldValue);
        target[prop] = newValue;
        self.notify(prop, newValue); // Notify subscribers
        self.saveState(); // Persist state
        return true;
      },
    });
  }

  /**
   * Applies registered middleware functions to state mutations.
   * @param {string|symbol} key - The state key being mutated.
   * @param {*} newValue - The new value being assigned.
   * @param {*} oldValue - The previous value.
   * @returns {*} The potentially modified new value.
   */
  applyMiddlewares(key: string | symbol, newValue: any, oldValue: any) {
    return this.middlewares.reduce((value: any, middleware: (arg0: any, arg1: any, arg2: any) => any) => {
      return middleware(key, value, oldValue);
    }, newValue);
  }

  /**
   * Saves the current state to localStorage.
   */
  saveState() {
    try {
      const serializedState = JSON.stringify(this.state);
      localStorage.setItem(this.storageKey, serializedState);
    } catch (error) {
      console.error('Error saving state to localStorage:', error);
    }
  }

  /**
   * Loads the state from localStorage if available.
   */
  loadState() {
    try {
      const serializedState = localStorage.getItem(this.storageKey);
      if (serializedState) {
        const parsedState = JSON.parse(serializedState);
        Object.keys(parsedState).forEach(key => {
          this.state[key] = parsedState[key];
        });
      }
    } catch (error) {
      console.error('Error loading state from localStorage:', error);
    }
  }

  /**
   * Retrieves a value from the state.
   * @param {string|symbol} key - The state key to retrieve.
   * @returns {*} The value associated with the key.
   */
  get(key: string | number) {
    return this.state[key];
  }

  /**
   * Sets a value in the state.
   * @param {string|symbol} key - The state key to set.
   * @param {*} value - The value to assign.
   */
  set(key: string | number, value: any) {
    this.state[key] = value;
  }

  /**
   * Subscribes to changes of a specific state key.
   * @param {string|symbol} key - The state key to subscribe to.
   * @param {Function} callback - The callback to invoke on state changes.
   * @returns {Function} Unsubscribe function.
   */
  override subscribe(key: string, callback: { (data: any): void; (data: any): void; (data: any): void; (): void; (data: any): void; (data: any): void; (data: any): void; }) {
    return super.subscribe(key, callback);
  }

  /**
   * Creates a derived observable using the map operator.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {Function} projection - Function to transform the data.
   * @returns {symbol} The new observable key.
   */
  override map(sourceKey: { toString: () => any; }, projection: (arg0: any) => any) {
    return super.map(sourceKey, projection);
  }

  /**
   * Creates a derived observable using the filter operator.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {Function} predicate - Function to determine if data should be emitted.
   * @returns {symbol} The new observable key.
   */
  override filter(sourceKey: { toString: () => any; }, predicate: (arg0: any) => any) {
    return super.filter(sourceKey, predicate);
  }

  /**
   * Creates a derived observable using the debounce operator.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {number} duration - Debounce duration in milliseconds.
   * @returns {symbol} The new observable key.
   */
  override debounce(sourceKey: { toString: () => any; }, duration: number | undefined) {
    return super.debounce(sourceKey, duration);
  }

  /**
   * Creates a derived observable using a selector function.
   * @param {Function} selector - Function to derive data from the state.
   * @returns {symbol} The new observable key.
   */
  select(selector: (arg0: any) => any) {
    const derivedKey = Symbol('derived');
    this.subscribe('*', () => {
      try {
        const derivedData = selector(this.state);
        this.emit(derivedKey, derivedData);
      } catch (error) {
        console.error('Select operator error:', error);
      }
    });
    return derivedKey;
  }
  override emit(_derivedKey: symbol, _derivedData: any) {
    throw new Error("Method not implemented.");
  }

  /**
   * Subscribes to all state changes.
   * Useful for derived observables.
   * @param {Function} callback - Callback to invoke on any state change.
   * @returns {Function} Unsubscribe function.
   */
  subscribeAll(callback: any) {
    return this.subscribe('*', callback);
  }

  /**
   * Adds middleware functions to process state mutations.
   * @param  {...Function} middlewares - Middleware functions to add.
   */
  addMiddleware(...middlewares: any[]) {
    middlewares.forEach(middleware => this.use(middleware));
  }
override use(_middleware: any): void {
  throw new Error("Method not implemented.");
}
}

// Singleton instance
export const state = new State();
