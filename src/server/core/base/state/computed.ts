// src/reactivity/computed.ts

import { effects } from './EffectManager.ts';
import { Observable } from './Observable.ts';

/**
 * Creates a computed observable based on a getter function.
 * @param getter A function that computes the value.
 * @returns An Observable representing the computed value.
 */
export function computed<T>(getter: () => T): Observable<T> {
  const computedObservable = new Observable<T>();
  let value: T;
  let dirty = true;

  // Register an effect that updates the computed value when dependencies change
  effects.effect(() => {
    if (dirty) {
      value = getter();
      dirty = false;
      computedObservable.emit(value);
    }
  }, {
    lazy: true,
    scheduler: () => {
      dirty = true;
      // Emit to notify subscribers that the computed value has changed
      computedObservable.emit(value);
    }
  });

  // Subscribe to the computed observable to track dependencies
  const proxy = new Proxy({}, {
    get() {
      effects.track('computed');
      return value;
    },
    set() {
      throw new Error('Cannot set a computed property.');
    }
  });

  return computedObservable;
}