// Define the type for reactive targets (objects or arrays)
type ReactiveTarget = Record<string, any> | Array<any>;

// Track active effects
export let activeEffect: (() => void) | null = null;
const effectStack: Array<() => void> = [];

// Manage the effect stack
function pushEffect(fn: () => void) {
  effectStack.push(fn);
  activeEffect = fn;
}

function popEffect() {
  effectStack.pop();
  activeEffect = effectStack[effectStack.length - 1] || null;
}

// Store dependencies for each property
const targetMap = new WeakMap<
  ReactiveTarget,
  Map<string | symbol, Set<() => void>>
>();

// Track dependencies by registering the active effect with the property
function track(target: ReactiveTarget, prop: string | symbol) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }
    let deps = depsMap.get(prop);
    if (!deps) {
      deps = new Set();
      depsMap.set(prop, deps);
    }
    deps.add(activeEffect); // Register the active effect for this property
  }
}

// Trigger effects associated with a property
function trigger(target: ReactiveTarget, prop: string | symbol) {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    const effects = depsMap.get(prop);
    if (effects) {
      effects.forEach((effect) => {
        effect(); // Run each effect associated with the property
      });
    }
  }
}

// Define reactive properties for objects and arrays
function defineReactiveProperty<T extends ReactiveTarget>(
  target: T,
  key: keyof T,
  value: T[keyof T]
) {
  Object.defineProperty(target, key, {
    get() {
      track(target, key.toString()); // Track access to the property
      return value;
    },
    set(newValue) {
      if (newValue !== value) {
        value = newValue;
        trigger(target, key.toString()); // Trigger effects when the value changes
      }
    },
    configurable: true,
    enumerable: true,
  });
}

// Core reactive function to make objects reactive
export function reactive<T extends ReactiveTarget>(target: T): T {
  Object.keys(target).forEach((key) => {
    const value = Reflect.get(target, key);
    if (typeof value === "object" && value !== null) {
      Reflect.set(target, key, reactive(value)); // Recursively make nested objects reactive
    }
    defineReactiveProperty(target, key as keyof T, value); // Define reactivity for each property
  });

  return new Proxy(target, {
    get(target, prop: string | symbol, receiver) {
      const value = Reflect.get(target, prop, receiver);
      track(target, prop); // Track the property access
      return value;
    },
    set(target, prop: string | symbol, value: any, receiver) {
      const oldValue = Reflect.get(target, prop, receiver);
      const result = Reflect.set(target, prop, value, receiver);
      if (oldValue !== value) {
        trigger(target, prop); // Trigger reactivity on property update
      }
      return result;
    },
  });
}

// Effect function that takes an object with methods only
export function effect(effectObj: Record<string, () => void>) {
  Object.keys(effectObj).forEach((key) => {
    const fn = effectObj[key];
    const wrappedEffect = () => {
      if (activeEffect !== fn) {
        try {
          pushEffect(fn); // Push the effect to the stack
          fn(); // Execute the effect
        } finally {
          popEffect(); // Pop the effect from the stack when done
        }
      }
    };
    wrappedEffect(); // Execute each effect immediately
  });
}

// Computed properties that depend on reactive state
export function computed<T>(getter: () => T): { value: T } {
  let cachedValue: T;
  let dirty = true; // Flag to determine if the value is "dirty" and needs recomputing

  const result = {
    get value() {
      if (dirty) {
        cachedValue = getter();
        dirty = false;
      }
      return cachedValue;
    },
  };

  effect({
    recalculate() {
      dirty = true; // Mark dirty when dependencies change
    },
  });

  return result;
}

// Derived state based on other reactive properties
export function derived<T>(selector: (state: any) => T): { value: T } {
  const result = {
    value: selector({}), // Initialize with the selector function
  };

  effect({
    recalculate() {
      result.value = selector({});
    },
  });

  return result;
}
