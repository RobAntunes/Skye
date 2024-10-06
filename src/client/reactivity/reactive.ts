// Types
type ReactiveTarget<T> = T;
type EffectFn = () => void;
type SuspendedEffect = {
  fn: EffectFn;
  target: ReactiveTarget<any>;
  prop: string | symbol;
};

// Dependency Tracker
let suspendedEffects: SuspendedEffect[] = [];

// Dependency Tracker for component-specific reactivity
const targetMap = new WeakMap<object, Map<string | symbol, Set<EffectFn>>>();

// This will store reactive proxies to avoid re-wrapping the same objects
const reactiveMap = new WeakMap<object, any>();

let activeEffect: EffectFn | null = null;

function track(target: object, prop: string | symbol): void {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(prop);
    if (!dep) {
      dep = new Set();
      depsMap.set(prop, dep);
    }
    dep.add(activeEffect);
  }
}

function trigger(target: object, prop: string | symbol): void {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(prop);
  if (effects) {
    effects.forEach(runEffect);
  }
}

function runEffect(fn: EffectFn): void {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// function runSuspendedEffects() {
//   suspendedEffects.forEach(({ fn }) => fn());
//   suspendedEffects = [];
// }

export function reactive<T extends object>(target: T): T {
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  const proxy = new Proxy(target, {
    get(obj, prop, receiver) {
      const result = Reflect.get(obj, prop, receiver);
      track(obj, prop); // Track dependencies
      return typeof result === "object" && result !== null
        ? reactive(result)
        : result;
    },
    set(obj, prop, value, receiver) {
      const oldValue = Reflect.get(obj, prop, receiver);
      const result = Reflect.set(obj, prop, value, receiver);
      if (oldValue !== value) {
        trigger(obj, prop); // Trigger effects when a change occurs
      }
      return result;
    },
  });

  reactiveMap.set(target, proxy);
  return proxy;
}

export function effect(effects: { [key: string]: EffectFn }): void {
  Object.values(effects).forEach(runEffect);
}

export async function rerender(): Promise<void> {
  const maxIterations = 10; // Prevent infinite loops
  let iterations = 0;

  while (suspendedEffects.length > 0 && iterations < maxIterations) {
    const currentSuspended = [...suspendedEffects];
    suspendedEffects = [];

    await Promise.all(
      currentSuspended.map(async ({ fn }) => {
        await Promise.resolve();
        runEffect(fn);
      })
    );

    iterations++;
  }

  if (iterations === maxIterations) {
    console.warn(
      "Max iterations reached in rerender. There might be an infinite loop."
    );
  }
}
