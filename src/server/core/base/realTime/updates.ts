import { EventEmitter } from "../reactivity/EventEmitter.ts";
import { activeEffect } from "../reactivity/reactive.ts";

// Trigger rerender after state updates
export function realTimeUpdate(updater: () => void): void {
  const effectQueue = new Set<() => void>();
  let isBatching = false;

  if (!isBatching) {
    isBatching = true;
    queueMicrotask(() => {
      updater(); // Apply the state updates
      effectQueue.forEach((effect) => effect()); // Run effects tied to state updates
      effectQueue.clear();
      isBatching = false;
      scheduleRerender(); // Ensure UI is re-rendered after state changes
    });
  }
}

// Optimizing nested object reactivity by only creating reactivity where necessary
export function defineOptimizedReactive<T extends object>(target: T): T {
  const events = new EventEmitter();

  Object.keys(target).forEach((key) => {
    const value = Reflect.get(target, key);
    if (typeof value === "object" && value !== null) {
      Reflect.set(target, key, defineOptimizedReactive(value)); // Recursive nesting
    }
    const descriptor = Reflect.getOwnPropertyDescriptor(target, key);
    if (descriptor && descriptor.configurable) {
      defineReactiveProperty(target, key as keyof T, value, events);
    }
  });

  return target;
}

// Define properties that minimize unnecessary updates
function defineReactiveProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K],
  events: EventEmitter<{ [key: string]: any }>,
): void {
  let internalValue = value;
  const effects = new Set<() => void>();

  Reflect.defineProperty(obj, key, {
    get() {
      if (activeEffect) {
        effects.add(activeEffect);
      }
      return internalValue;
    },
    set(newValue) {
      if (newValue !== internalValue) {
        internalValue = newValue;
        events.emit(key as string, newValue);
        effects.forEach((effect) => effect());
      }
    },
    configurable: true,
    enumerable: true,
  });
}

function scheduleRerender() {
  requestAnimationFrame(() => {
    // Render the UI in response to state changes
  });
}
