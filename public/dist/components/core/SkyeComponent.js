var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/client/reactivity/reactive.ts
var activeEffect = null;
var effectStack = [];
var Dep = class {
  constructor() {
    __publicField(this, "subscribers", /* @__PURE__ */ new Set());
  }
  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
      activeEffect.deps.add(this);
    }
  }
  notify() {
    const effects = Array.from(this.subscribers);
    for (const effect2 of effects) {
      if (effect2.suspended) {
        effect2.resume();
      } else {
        effect2.run();
      }
    }
  }
};
var Effect = class {
  // Add this line
  constructor(fn, key) {
    __publicField(this, "key");
    __publicField(this, "fn");
    __publicField(this, "deps", /* @__PURE__ */ new Set());
    __publicField(this, "active", true);
    __publicField(this, "suspended", false);
    __publicField(this, "allowMutate", true);
    __publicField(this, "running", false);
    this.key = key || "default";
    this.fn = fn;
  }
  run() {
    if (!this.active || this.running)
      return;
    this.running = true;
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
      this.running = false;
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
};
function cleanupEffect(effect2) {
  effect2.deps.forEach((dep) => {
    dep.subscribers.delete(effect2);
  });
  effect2.deps.clear();
}
function effect(fnOrEffects) {
  let effectInstances = [];
  if (typeof fnOrEffects === "function") {
    const effectInstance = new Effect(fnOrEffects, "default");
    effectInstance.run();
    effectInstances = [effectInstance];
  } else {
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
function reactive(target) {
  const depMap = /* @__PURE__ */ new Map();
  const proxy = new Proxy(target, {
    get(obj, prop, receiver) {
      let dep = depMap.get(prop);
      if (!dep) {
        dep = new Dep();
        depMap.set(prop, dep);
      }
      dep.depend();
      return Reflect.get(obj, prop, receiver);
    },
    set(obj, prop, value, receiver) {
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
    }
    // Other traps if needed
  });
  return proxy;
}

// src/client/templates/engine.ts
function parseTemplateString(templateString) {
  const template = document.createElement("template");
  template.innerHTML = templateString.trim();
  return template.content.cloneNode(true);
}

// src/client/components/core/SkyeComponent.ts
var SkyeComponent = class extends HTMLElement {
  constructor() {
    super();
    __publicField(this, "state");
    __publicField(this, "cleanupTasks", []);
    this.state = reactive({});
  }
  connectedCallback() {
    const cleanupRenderEffect = effect(() => this.render());
    this.addCleanupTask(cleanupRenderEffect);
  }
  disconnectedCallback() {
    this.cleanupTasks.forEach((cleanup) => cleanup());
    this.cleanupTasks = [];
  }
  render() {
    const template = this.template();
    const fragment = parseTemplateString(template);
    this.innerHTML = "";
    this.appendChild(fragment);
  }
  template() {
    return "";
  }
  // Helper method to add a cleanup task
  addCleanupTask(task) {
    this.cleanupTasks.push(task);
  }
  // Helper method to add event listeners with automatic cleanup
  addEventListenerWithCleanup(type, listener, options) {
    this.addEventListener(type, listener, options);
    this.addCleanupTask(() => this.removeEventListener(type, listener, options));
  }
};
export {
  SkyeComponent
};
//# sourceMappingURL=SkyeComponent.js.map
