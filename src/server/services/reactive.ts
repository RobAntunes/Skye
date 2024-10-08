// reactivity.ts
type EffectFn = () => void;

let activeEffect: EffectFn | null = null;
const targetMap = new WeakMap<object, Map<string | symbol, Set<EffectFn>>>();

export function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, prop, receiver) {
      track(target, prop);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      trigger(target, prop);
      return result;
    },
  });
}

function track(target: object, prop: string | symbol) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = new Map<string | symbol, Set<EffectFn>>();
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

function trigger(target: object, prop: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(prop);
  if (effects) {
    effects.forEach((effect) => effect());
  }
}

export function effect(effects: Record<string, EffectFn>) {
  Object.values(effects).forEach((effectFn) => {
    const wrappedEffect = () => {
      activeEffect = wrappedEffect;
      effectFn();
      activeEffect = null;
    };
    wrappedEffect();
  });
}