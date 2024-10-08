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

// src/client/templates/utils/hashTemplate.ts
async function hashTemplate(template) {
  const response = await fetch("http://localhost:8000/api/hash", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ template })
  });
  const res = await response.json();
  if (response.ok) {
    return res.data;
  } else {
    throw new Error(`Hashing failed: ${res.error}`);
  }
}

// src/client/templates/utils/lazyRender.ts
var templateCache = /* @__PURE__ */ new Map();
async function renderTemplate(template, state, element) {
  try {
    const templateHash = await hashTemplate(template);
    const cachedTemplate = templateCache.get(template);
    let fragment;
    if (cachedTemplate && cachedTemplate.hash === templateHash) {
      fragment = cachedTemplate.fragment.cloneNode(true);
    } else {
      fragment = parseTemplate(template, state);
      templateCache.set(template, { hash: templateHash, fragment });
    }
    element.innerHTML = "";
    element.appendChild(fragment);
    effect({
      update: () => {
        const updatedFragment = parseTemplate(template, state);
        element.innerHTML = "";
        element.appendChild(updatedFragment);
      }
    });
  } catch (error) {
    console.error("Error in renderTemplate:", error);
    throw error;
  }
}

// src/client/templates/utils/debounceRender.ts
var updateTimeout = null;
function renderTemplateDebounced(template, state, element) {
  if (updateTimeout)
    clearTimeout(updateTimeout);
  updateTimeout = globalThis.setTimeout(() => {
    renderTemplate(template, state, element);
  }, 50);
}
export {
  renderTemplateDebounced
};
//# sourceMappingURL=debounceRender.js.map
