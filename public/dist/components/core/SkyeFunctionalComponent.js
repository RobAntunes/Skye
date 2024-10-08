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
function parseTemplate(template, state = {}) {
  const fragment = document.createDocumentFragment();
  const bindings = [];
  let index = 0;
  const length = template.length;
  while (index < length) {
    const openIndex = template.indexOf("{{", index);
    if (openIndex === -1) {
      const text = template.slice(index);
      fragment.appendChild(document.createTextNode(text));
      break;
    }
    if (openIndex > index) {
      const text = template.slice(index, openIndex);
      fragment.appendChild(document.createTextNode(text));
    }
    const closeIndex = template.indexOf("}}", openIndex + 2);
    if (closeIndex === -1) {
      const text = template.slice(openIndex);
      fragment.appendChild(document.createTextNode(text));
      break;
    }
    const expression = template.slice(openIndex + 2, closeIndex).trim();
    const textNode = document.createTextNode("");
    fragment.appendChild(textNode);
    updateTextNode(textNode, expression, state);
    bindings.push({ node: textNode, expression });
    index = closeIndex + 2;
  }
  bindings.forEach(({ node, expression }) => {
    effect({
      update() {
        updateTextNode(node, expression, state);
      }
    });
  });
  return fragment;
}
function updateTextNode(node, expression, state) {
  try {
    const value = new Function(...Object.keys(state), `return ${expression};`)(...Object.values(state));
    node.textContent = value;
  } catch (error) {
    console.error(`Error evaluating expression "${expression}":`, error);
    node.textContent = "";
  }
}

// src/client/components/core/SkyeFunctionalComponent.ts
function SkyeFunctionalComponent(componentFn) {
  class SkyeFunctionalComponent2 extends HTMLElement {
    // Track listeners and side effects
    constructor() {
      super();
      __publicField(this, "state");
      __publicField(this, "sideEffects", /* @__PURE__ */ new Set());
      this.state = reactive({});
    }
    connectedCallback() {
      this.render();
      effect({
        render: () => this.render()
      });
    }
    render() {
      const template = componentFn();
      this.innerHTML = "";
      this.appendChild(parseTemplate(template));
    }
    // Override the standard document.addEventListener to track it for cleanup
    addEventListener(type, listener, options) {
      super.addEventListener(type, listener, options);
      this.sideEffects.add(() => document.removeEventListener(type, listener, options));
    }
    removeSideEffects() {
      this.sideEffects.forEach((cleanup) => cleanup());
      this.sideEffects.clear();
    }
    disconnectedCallback() {
      this.removeSideEffects();
    }
  }
  return customElements.define("skye-functional-component", SkyeFunctionalComponent2);
}
export {
  SkyeFunctionalComponent
};
//# sourceMappingURL=SkyeFunctionalComponent.js.map
