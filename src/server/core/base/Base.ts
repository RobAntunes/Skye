export abstract class Base {
  protected subscribers: Map<any, any>;
  protected middlewares: Function[];

  constructor() {
    this.subscribers = new Map(); // Map of state keys to sets of subscriber callbacks
    this.middlewares = []; // Array of middleware functions
  }

  /**
   * Adds a middleware function.
   * @param {Function} middleware - The middleware function to add.
   */
  protected abstract use(middleware: Function): void;

  /**
   * Notifies subscribers of a state change.
   * @param {string|symbol} key - The state key that changed.
   * @param {*} value - The new value of the state.
   */
  protected abstract notify(key: string | symbol, value: any): void;

  /**
   * Subscribes to changes of a specific state key.
   * @param {string|symbol} key - The state key to subscribe to.
   * @param {Function} callback - The callback to invoke on state changes.
   * @returns {Function} Unsubscribe function.
   */
  protected abstract subscribe(key: string | symbol, callback: Function): Function;

  /**
   * Applies the map operator to transform emitted data.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {Function} projection - Function to transform the data.
   * @returns {symbol} The new observable key.
   */
  protected abstract map(sourceKey: string | symbol, projection: (data: any) => any): symbol;

  /**
   * Applies the filter operator to selectively emit data.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {Function} predicate - Function to determine if data should be emitted.
   * @returns {symbol} The new observable key.
   */
  protected abstract filter(sourceKey: string | symbol, predicate: (data: any) => boolean): symbol;

  /**
   * Applies the debounce operator to delay emissions.
   * @param {string|symbol} sourceKey - The source state key.
   * @param {number} duration - Debounce duration in milliseconds.
   * @returns {symbol} The new observable key.
   */
  protected abstract debounce(sourceKey: string | symbol, duration: number): symbol;

  /**
   * Emits data to subscribers of a specific key.
   * @param {string|symbol} key - The state key to emit data for.
   * @param {*} value - The data to emit.
   */
  protected abstract emit(key: string | symbol, value: any): void;
}