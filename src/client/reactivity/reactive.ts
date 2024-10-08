let activeEffect: Effect | null = null;
const effectStack: Effect[] = [];

class Dep {
  subscribers: Set<Effect> = new Set();

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
      activeEffect.deps.add(this);
    }
  }

  notify() {
    const effects = Array.from(this.subscribers); // Collect subscribers

    for (const effect of effects) {
      if (effect.suspended) {
        effect.resume();
      } else {
        effect.run();
      }
    }
  }
}

type EffectFnType = () => void | Promise<void>;

class Effect {
  key: string;
  fn: EffectFnType;
  deps: Set<Dep> = new Set();
  active: boolean = true;
  suspended: boolean = false;
  allowMutate: boolean = true;
  running: boolean = false; // Add this line

  constructor(fn: EffectFnType, key?: string) {
    this.key = key || "default";
    this.fn = fn;
  }

  run() {
    if (!this.active || this.running) return; // Prevent re-entrant execution

    this.running = true; // Set running to true

    cleanupEffect(this);

    try {
      effectStack.push(this);
      activeEffect = this;
      this.allowMutate = false;

      const result = this.fn();

      if (result instanceof Promise) {
        this.suspend();
        result.finally(() => {
          this.resume();
        });
      }
    } finally {
      this.allowMutate = true;
      this.running = false; // Set running to false
      effectStack.pop();
      activeEffect = effectStack[effectStack.length - 1] || null;
    }
  }

  suspend() {
    this.suspended = true;
  }

  resume() {
    if (this.suspended) {
      this.suspended = false;
    }
  }

  stop() {
    if (this.active) {
      cleanupEffect(this);
      this.active = false;
    }
  }
}

function cleanupEffect(effect: Effect) {
  effect.deps.forEach((dep) => {
    dep.subscribers.delete(effect);
  });
  effect.deps.clear();
}
export function effect(
  fnOrEffects:
    | (() => void | Promise<void>)
    | { [key: string]: () => void | Promise<void> }
): () => void {
  let effectInstances: Effect[] = [];

  if (typeof fnOrEffects === "function") {
    // Single function
    const effectInstance = new Effect(fnOrEffects, "default");
    effectInstance.run();
    effectInstances = [effectInstance];
  } else {
    // Object of functions
    effectInstances = Object.entries(fnOrEffects).map(([key, fn]) => {
      const effectInstance = new Effect(fn, key);
      effectInstance.run();
      return effectInstance;
    });
  }

  return () => {
    effectInstances.forEach((effectInstance) => effectInstance.stop());
  };
}

export function reactive<T extends object>(target: T): T {
  const depMap = new Map<PropertyKey, Dep>();

  const proxy = new Proxy(target, {
    get(obj, prop: PropertyKey, receiver) {
      let dep = depMap.get(prop);
      if (!dep) {
        dep = new Dep();
        depMap.set(prop, dep);
      }
      dep.depend();
      return Reflect.get(obj, prop, receiver);
    },
    set(obj, prop: PropertyKey, value, receiver) {
      if (activeEffect && !activeEffect.allowMutate) {
        throw new Error(
          `Cannot mutate reactive state during effect execution.`
        );
      }

      const oldValue = Reflect.get(obj, prop, receiver);
      const result = Reflect.set(obj, prop, value, receiver);

      if (oldValue !== value) {
        const dep = depMap.get(prop);
        if (dep) {
          dep.notify();
        }
      }
      return result;
    },
    // Other traps if needed
  });

  return proxy;
}
