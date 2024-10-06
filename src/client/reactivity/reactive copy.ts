// Types
type ReactiveTarget<T> = T;
type EffectFn = () => void;
type SuspendedEffect = {
  fn: EffectFn;
  target: ReactiveTarget<any>;
  prop: string | symbol;
};

// Dependency Tracker
const targetMap = new WeakMap<ReactiveTarget<any>, Map<any, Set<EffectFn>>>();
const reactiveMap = new WeakMap<object, any>();

let activeEffect: EffectFn | null = null;
let suspendedEffects: SuspendedEffect[] = [];

function track(target: ReactiveTarget<any>, prop: string | symbol): void {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map();
      targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(prop);
    if (!dep) {
      dep = new Set<EffectFn>();
      depsMap.set(prop, dep);
    }
    dep.add(activeEffect);
  } 
}

function trigger(target: ReactiveTarget<any>, prop: string | symbol): void {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    const effects = depsMap.get(prop);
    if (effects) {
      effects.forEach(runEffect);
    }
  }
}

function runEffect(effect: EffectFn): void {
  try {
    activeEffect = effect;
    effect();
  } catch (error) {
    if (error instanceof Promise) {
      suspendedEffects.push({ fn: effect, target: null!, prop: null! });
      error.then(() => {
        const index = suspendedEffects.findIndex(e => e.fn === effect);
        if (index !== -1) {
          suspendedEffects.splice(index, 1);
        }
        runEffect(effect);
      });
    } else {
      console.error("Effect error:", error);
    }
  } finally {
    activeEffect = null;
  }
}

export function reactive<T extends object>(target: T): T {
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }

  const handler: ProxyHandler<T> = {
    get(obj: T, prop: string | symbol, receiver: any) {
      const result = Reflect.get(obj, prop, receiver);
      track(obj, prop);
      return result;
    },
    set(obj: T, prop: string | symbol, value: any, receiver: any) {
      const oldValue = Reflect.get(obj, prop, receiver);
      const result = Reflect.set(obj, prop, value, receiver);
      if (oldValue !== value) {
        trigger(obj, prop);
      }
      return result;
    },
  };

  const proxy = new Proxy(target, handler);
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
    console.warn('Max iterations reached in rerender. There might be an infinite loop.');
  }
}