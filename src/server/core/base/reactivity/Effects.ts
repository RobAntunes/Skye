// src/core/Effects.ts

/**
 * Type definition for effect functions.
 */
type EffectFunction = () => void | Promise<void>;

/**
 * Interface for effect options.
 */
interface EffectOptions {
  cache?: boolean;
  retries?: number;
  debounce?: number;
  throttle?: number;
  immediate?: boolean;
}

/**
 * A simple EventEmitter implementation for managing events.
 */
class EventEmitter {
  private events: Map<string, Set<Function>> = new Map();

  /**
   * Subscribes a listener to an event.
   * @param event The event name.
   * @param listener The callback function.
   */
  public on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(listener);
  }

  /**
   * Unsubscribes a listener from an event.
   * @param event The event name.
   * @param listener The callback function.
   */
  public off(event: string, listener: Function): void {
    this.events.get(event)?.delete(listener);
  }

  /**
   * Emits an event, invoking all associated listeners.
   * @param event The event name.
   * @param args Arguments to pass to the listeners.
   */
  public emit(event: string, ...args: any[]): void {
    this.events.get(event)?.forEach((listener) => listener(...args));
  }

  /**
   * Subscribes a listener to an event, to be invoked only once.
   * @param event The event name.
   * @param listener The callback function.
   */
  public once(event: string, listener: Function): void {
    const onceListener = (...args: any[]) => {
      listener(...args);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }
}

/**
 * The Effects class integrates EventEmitter, Reactive functionalities,
 * and manages synchronous and asynchronous effects.
 */
export class Effects extends EventEmitter {
  /**
   * Holds the currently active effect function.
   */
  protected activeEffect: EffectFunction | null = null;

  /**
   * Maps reactive objects to their property dependencies.
   */
  private targetMap: WeakMap<
    object,
    Map<string | symbol, Set<EffectFunction>>
  > = new WeakMap();

  /**
   * Stores cached results of asynchronous operations.
   */
  private cacheStore: Map<Function, any> = new Map();

  /**
   * Stores active effect functions for potential management.
   */
  private activeEffects: Set<Function> = new Set();

  /**
   * Creates a reactive proxy for the given target object.
   * @param target The object to make reactive.
   * @returns A reactive proxy of the target object.
   */
  public reactive<T extends object>(target: T): T {
    return new Proxy(target, {
      get: (obj, prop: string | symbol, receiver) => {
        const result = Reflect.get(obj, prop, receiver);
        this.track(obj, prop); // Track dependency
        return result;
      },
      set: (obj, prop: string | symbol, value: any, receiver) => {
        const oldValue = obj[prop as keyof T];
        const result = Reflect.set(obj, prop, value, receiver);
        if (oldValue !== value) {
          this.trigger(obj, prop); // Trigger effects
        }
        return result;
      },
    });
  }

  /**
   * Tracks dependencies between reactive properties and the active effect.
   * @param target The reactive object.
   * @param key The property key being accessed.
   */
  protected track(target: object, key: string | symbol): void {
    if (this.activeEffect === null) return;

    let depsMap = this.targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map<string | symbol, Set<EffectFunction>>();
      this.targetMap.set(target, depsMap);
    }

    let dep = depsMap.get(key);
    if (!dep) {
      dep = new Set<EffectFunction>();
      depsMap.set(key, dep);
    }

    dep.add(this.activeEffect);
  }

  /**
   * Triggers effects associated with a reactive property when it changes.
   * @param target The reactive object.
   * @param key The property key being mutated.
   */
  protected trigger(target: object, key: string | symbol): void {
    const depsMap = this.targetMap.get(target);
    if (!depsMap) return;

    const dep = depsMap.get(key);
    if (!dep) return;

    dep.forEach((effect) => {
      if (effect) {
        effect();
      }
    });
  }

  /**
   * Defines and runs a synchronous effect function.
   * @param effectFn The effect function to run.
   * @param options Optional configurations for the effect.
   */
  public sync(effectFn: () => void, options: EffectOptions = {}): void {
    const wrappedEffect = () => {
      try {
        this.activeEffect = wrappedEffect;
        effectFn();
        this.emit("effectRun", { type: "sync", effectFn });
      } catch (error) {
        this.emit("effectError", { type: "sync", error });
        console.error("Sync Effect Error:", error);
      } finally {
        this.activeEffect = null;
      }
    };

    if (options.immediate !== false) {
      wrappedEffect();
    }

    // Store the effect for future triggers
    this.activeEffects.add(wrappedEffect);
  }

  /**
   * Defines and runs an asynchronous effect function.
   * @param effectFn The asynchronous effect function to execute.
   * @param options Optional configurations for the effect.
   */
  public async async(
    effectFn: () => Promise<void>,
    options: EffectOptions = {} as EffectOptions
  ): Promise<void> {
    const wrappedEffect = async () => {
      try {
        this.activeEffect = wrappedEffect;
        await effectFn();
        this.emit("effectRun", { type: "async", effectFn });
      } catch (error) {
        this.emit("effectError", { type: "async", error });
        console.error("Async Effect Error:", error);
      } finally {
        this.activeEffect = null;
      }
    };

    if (options.immediate !== false) {
      await wrappedEffect();
    }

    // Store the effect for future triggers
    this.activeEffects.add(wrappedEffect);
  }

  /**
   * Executes an asynchronous operation with comprehensive handling,
   * including caching, retries, and event emissions.
   * @param asyncOperation The asynchronous operation function.
   * @param options Optional configurations for the operation.
   * @returns The result of the asynchronous operation.
   */
  public async obtain(
    asyncOperation: () => Promise<any>,
    options: {
      cache?: boolean;
      retries?: number;
      onStart?: Function;
      onProgress?: Function;
      onComplete?: Function;
      onError?: Function;
      debounce?: number;
      throttle?: number;
    } = {}
  ): Promise<any> {
    const {
      cache = false,
      retries = 0,
      onStart,
      onProgress,
      onComplete,
      onError,
      debounce,
      throttle,
    } = options;

    // Check cache
    if (cache && this.cacheStore.has(asyncOperation)) {
      return this.cacheStore.get(asyncOperation);
    }

    const executeOperation = async (): Promise<any> => {
      if (onStart) onStart();
      this.emit("operationStart", { asyncOperation });

      try {
        let attempt = 0;
        while (attempt <= retries) {
          try {
            const result = await asyncOperation();
            if (onComplete) onComplete(result);
            this.emit("operationComplete", { asyncOperation, result });

            if (cache) {
              this.cacheStore.set(asyncOperation, result);
            }

            return result;
          } catch (error) {
            attempt++;
            if (attempt > retries) {
              if (onError) onError(error);
              this.emit("operationError", { asyncOperation, error });
              throw error;
            }
            // Optional delay before retrying
            await this.delay(1000);
          }
        }
      } catch (error) {
        console.error("Effect.Obtain Error:", error);
        throw error;
      }
    };

    // Apply debounce or throttle if specified
    if (debounce) {
      return this.debounce(executeOperation, debounce);
    } else if (throttle) {
      return this.throttle(executeOperation, throttle);
    } else {
      return executeOperation();
    }
  }

  /**
   * Executes an asynchronous effect without awaiting its completion.
   * Emits an event upon completion.
   * @param effectFn The asynchronous effect function to execute.
   */
  public future(effectFn: () => Promise<void>): void {
    const wrappedEffect = () => {
      effectFn()
        .then(() => {
          this.emit("effectRun", { type: "future", effectFn });
        })
        .catch((error) => {
          this.emit("effectError", { type: "future", error });
          console.error("Future Effect Error:", error);
        });
    };

    wrappedEffect();

    // Store the effect for potential future management
    this.activeEffects.add(wrappedEffect);
  }

  /**
   * Utility function to introduce a delay.
   * @param ms Milliseconds to delay.
   * @returns A promise that resolves after the specified delay.
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Debounce utility to delay function execution.
   * @param fn The function to debounce.
   * @param delayMs The delay in milliseconds.
   * @returns A debounced promise.
   */
  private debounce(fn: Function, delayMs: number): Promise<any> {
    let timeout: number;
    return new Promise((resolve, reject) => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        fn().then(resolve).catch(reject);
      }, delayMs);
    });
  }

  /**
   * Throttle utility to limit function execution frequency.
   * @param fn The function to throttle.
   * @param limitMs The time limit in milliseconds.
   * @returns A throttled promise.
   */
  private throttle(fn: Function, limitMs: number): Promise<any> {
    let inThrottle: boolean = false;
    return new Promise((resolve, reject) => {
      if (!inThrottle) {
        fn().then(resolve).catch(reject);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limitMs);
      }
    });
  }
}

/**
 * Export a singleton instance of Effects for consistent usage across the framework.
 */
export const effect = new Effects();
