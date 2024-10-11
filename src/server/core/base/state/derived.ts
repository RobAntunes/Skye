// src/reactivity/derived.ts

import { effects } from '../reactivity/Effects.ts';
import { Observable } from '../reactivity/Observable.ts';
import { state } from "./State.ts";

/**
 * Creates a derived observable based on a selector function.
 * @param selector A function that derives data from the state.
 * @returns An Observable representing the derived value.
 */
export function derived<T>(selector: (state: any) => T): Observable<T> {
  const derivedObservable = new Observable<T>();
  let value: T;
  let dirty = true;

  // Register an effect that updates the derived value when dependencies change
  effects(() => {
    if (dirty) {
      value = selector(state); // Assuming effects.state holds the reactive state
      dirty = false;
      derivedObservable.emit(value);
    }
  }, {
    lazy: true,
    scheduler: () => {
      dirty = true;
      // Emit to notify subscribers that the derived value has changed
      derivedObservable.emit(value);
    }
  });

  return derivedObservable;
}