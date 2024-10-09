// TODO: Make abstract

export class Base {
  subscribers: Map<any, any>;
  middlewares: Function;
  constructor() {
    this.subscribers = new Map(); // Map of state keys to sets of subscriber callbacks
    this.middlewares = [] as Function[]; // Array of middleware functions
  }

  /**
   * Adds a middleware function.
   * @param {Function} middleware - The middleware function to add.
   */
  use(middleware: Function) {
    if (typeof middleware !== "function") {
      throw new Error("Middleware must be a function.");
    } else (this.middlewares as Function[]).push(middleware);
  }

  /**
   * Notifies subscribers of a state change.
   * @param {string|symbol} key - The state key that changed.
   * @param {*} value - The new value of the state.
   */
  notify(key: { toString: () => any }, value: any) {
    const callbacks = this.subscribers.get(key);
    if (callbacks) {
      callbacks.forEach((callback: (arg0: any) => void) => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Error in subscriber for "${key.toString()}":`, error);
        }
      });
    }
  }

  /**
   * Subscribes to changes of a specific state key.
   * @param {string|symbol} key - The state key to subscribe to.
   * @param {Function} callback - The callback to invoke on state changes.
   * @returns {Function} Unsubscribe function.
   */
  subscribe(
    key: any,
    callback: { (data: any): void; (data: any): void; (data: any): void }
  ) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add(callback);

    // Return an unsubscribe function
    return () => {
      this.subscribers.get(key).delete(callback);
      if (this.subscribers.get(key).size === 0) {
        this.subscribers.delete(key);
      }
    };
  }

  /**
   * Applies the map operator to transform emitted data.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {Function} projection - Function to transform the data.
   * @returns {symbol} The new observable key.
   */
  map(sourceKey: { toString: () => any }, projection: (arg0: any) => any) {
    const mappedKey = Symbol(`map_${sourceKey.toString()}`);
    this.subscribe(sourceKey, (data: any) => {
      try {
        const projectedData = projection(data);
        this.emit(mappedKey, projectedData);
      } catch (error) {
        console.error("Map operator error:", error);
      }
    });
    return mappedKey;
  }

  /**
   * Applies the filter operator to selectively emit data.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {Function} predicate - Function to determine if data should be emitted.
   * @returns {symbol} The new observable key.
   */
  filter(sourceKey: { toString: () => any }, predicate: (arg0: any) => any) {
    const filteredKey = Symbol(`filter_${sourceKey.toString()}`);
    this.subscribe(sourceKey, (data: any) => {
      try {
        if (predicate(data)) {
          this.emit(filteredKey, data);
        }
      } catch (error) {
        console.error("Filter operator error:", error);
      }
    });
    return filteredKey;
  }

  /**
   * Applies the debounce operator to delay emissions.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {number} duration - Debounce duration in milliseconds.
   * @returns {symbol} The new observable key.
   */
  debounce(sourceKey: { toString: () => any }, duration: number | undefined) {
    const debouncedKey = Symbol(`debounce_${sourceKey.toString()}`);
    let timeout: number | null | undefined = null;
    this.subscribe(sourceKey, (data: any) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        this.emit(debouncedKey, data);
      }, duration);
    });
    return debouncedKey;
  }

  /**
   * Emits data to subscribers of a specific key.
   * @param {string|symbol} key - The state key to emit data for.
   * @param {*} value - The data to emit.
   */
  emit(key, value: any) {
    this.notify(key, value);
  }
}
