var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/client/reactivity/reactive.ts
var activeEffect = null;
var effectStack = [];
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

// src/client/components/core/functions/mixins/Accessible.ts
function Accessible(Base) {
  return class AccessibleComponent extends Base {
    constructor(...args) {
      super(...args);
      __publicField(this, "handleKeyDownBound");
      this.handleKeyDownBound = this.handleKeyDown.bind(this);
    }
    connectedCallback() {
      super.connectedCallback && super.connectedCallback();
      this.setupAccessibility();
    }
    disconnectedCallback() {
      super.disconnectedCallback && super.disconnectedCallback();
      this.removeEventListener("keydown", this.handleKeyDownBound);
    }
    setupAccessibility() {
      this.addEventListener("keydown", this.handleKeyDownBound);
      this.setupAriaStateReactivity();
    }
    setupAriaStateReactivity() {
      effect({
        updateAriaAttributes: () => {
          if ("expanded" in this.state) {
            this.setAttribute("aria-expanded", String(this.state.expanded));
          }
          if ("disabled" in this.state) {
            this.setAttribute("aria-disabled", String(this.state.disabled));
          }
        }
      });
    }
    handleKeyDown(event) {
      if (event.key === "Enter" || event.key === " ") {
        this.click();
        event.preventDefault();
      }
    }
    generateAriaLabel() {
      const heading = this.querySelector("h1, h2, h3, h4, h5, h6");
      return heading ? heading.textContent?.trim() || null : null;
    }
  };
}
export {
  Accessible
};
//# sourceMappingURL=Accessible.js.map
