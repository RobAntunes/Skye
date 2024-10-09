export class Observables{
    effects: any;
    observables: Map<any, any>;
    constructor(effectsInstance: any) {
        this.effects = effectsInstance
      this.observables = new Map(); // Stores observables with unique symbols as keys
    }
  
    /**
     * Creates a new observable.
     * @returns {symbol} Unique identifier for the observable.
     */
    create() {
      const id = Symbol('observable');
      this.observables.set(id, { subscribers: [], completed: false });
      return id;
    }
  
    /**
     * Subscribes to an observable.
     * @param {symbol} observableId - The ID of the observable.
     * @param {Function} callback - Callback to handle emitted data.
     * @returns {Function} Unsubscribe function.
     */
    subscribe(observableId: any, callback: { (data: any): void; (data: any): void; (data: any): void; }) {
      const observable = this.observables.get(observableId);
      if (!observable) {
        throw new Error('Observable does not exist.');
      }
      if (observable.completed) {
        throw new Error('Cannot subscribe to a completed observable.');
      }
      observable.subscribers.push(callback);
  
      // Return an unsubscribe function
      return () => {
        this.unsubscribe(observableId, callback);
      };
    }
  
    /**
     * Emits data to all subscribers of an observable.
     * @param {symbol} observableId - The ID of the observable.
     * @param {*} data - Data to emit.
     */
    emit(observableId: symbol, data: any) {
      const observable = this.observables.get(observableId);
      if (!observable) {
        throw new Error('Observable does not exist.');
      }
      if (observable.completed) {
        throw new Error('Cannot emit data to a completed observable.');
      }
      observable.subscribers.forEach((callback: (arg0: any) => void) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Observable callback error:', error);
        }
      });
    }
  
    /**
     * Unsubscribes a specific callback from an observable.
     * @param {symbol} observableId - The ID of the observable.
     * @param {Function} callback - The callback to remove.
     */
    unsubscribe(observableId: any, callback: any) {
      const observable = this.observables.get(observableId);
      if (!observable) {
        throw new Error('Observable does not exist.');
      }
      observable.subscribers = observable.subscribers.filter((cb: any) => cb !== callback);
    }
  
    /**
     * Completes an observable, removing all subscribers and preventing further emissions.
     * @param {symbol} observableId - The ID of the observable.
     */
    complete(observableId: any) {
      const observable = this.observables.get(observableId);
      if (!observable) {
        throw new Error('Observable does not exist.');
      }
      observable.subscribers = [];
      observable.completed = true;
    }
  
    /**
     * Applies a transformation to the emitted data using the map operator.
     * @param {symbol} observableId - The source observable ID.
     * @param {Function} projection - Function to transform the data.
     * @returns {symbol} New observable ID.
     */
    map(observableId: any, projection: (arg0: any) => any) {
      const newObservableId = this.create();
      this.subscribe(observableId, (data: any) => {
        try {
          const projectedData = projection(data);
          this.emit(newObservableId, projectedData);
        } catch (error) {
          console.error('Map operator error:', error);
        }
      });
      return newObservableId;
    }
  
    /**
     * Filters the emitted data based on a predicate function.
     * @param {symbol} observableId - The source observable ID.
     * @param {Function} predicate - Function to test each emitted item.
     * @returns {symbol} New observable ID.
     */
    filter(observableId: any, predicate: (arg0: any) => any) {
      const newObservableId = this.create();
      this.subscribe(observableId, (data: any) => {
        try {
          if (predicate(data)) {
            this.emit(newObservableId, data);
          }
        } catch (error) {
          console.error('Filter operator error:', error);
        }
      });
      return newObservableId;
    }
  
    /**
     * Debounces the emitted data, emitting only after a specified duration of silence.
     * @param {symbol} observableId - The source observable ID.
     * @param {number} duration - Debounce duration in milliseconds.
     * @returns {symbol} New observable ID.
     */
    debounce(observableId: any, duration: number | undefined) {
      const newObservableId = this.create();
      let timeout: number | null | undefined = null;
      this.subscribe(observableId, (data: any) => {
        clearTimeout(timeout as number & null);
        timeout = setTimeout(() => {
          this.emit(newObservableId, data);
        }, duration);
      });
      return newObservableId;
    }
  }