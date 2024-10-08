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

// src/client/templates/test/engineTests.test.ts
Deno.test("Template caching and hashing", async () => {
  const template = `<h1>{{ title }}</h1>`;
  const state = { title: "Skye Framework" };
  const element = document.createElement("div");
  await renderTemplate(template, state, element);
  const initialHTML = element.innerHTML;
  state.title = "Updated Title";
  await renderTemplate(template, state, element);
  if (element.innerHTML !== "<h1>Updated Title</h1>") {
    throw new Error(`Expected <h1>Updated Title</h1> but got ${element.innerHTML}`);
  }
  state.title = "Skye Framework";
  await renderTemplate(template, state, element);
  if (element.innerHTML === initialHTML) {
    throw new Error("Template was incorrectly re-rendered from cache.");
  }
});
Deno.test("Fine-grained reactivity", async () => {
  const template = `<h1>{{ title }}</h1><p>{{ description }}</p>`;
  const state = { title: "Skye Framework", description: "A modern JS framework" };
  const element = document.createElement("div");
  await renderTemplate(template, state, element);
  state.description = "Updated description";
  await renderTemplate(template, state, element);
  if (element.querySelector("h1")?.textContent !== "Skye Framework") {
    throw new Error("Title should not have been re-rendered.");
  }
  if (element.querySelector("p")?.textContent !== "Updated description") {
    throw new Error("Description was not updated correctly.");
  }
});
Deno.test("DocumentFragment integration and caching", async () => {
  const component = new SkyeComponent();
  const fragment = component.autoParseTemplate();
  if (!(fragment instanceof DocumentFragment)) {
    throw new Error("autoParseTemplate did not return a DocumentFragment");
  }
  const element = document.createElement("div");
  element.appendChild(fragment.cloneNode(true));
  const h1 = element.querySelector("h1");
  if (!h1 || h1.textContent !== "{{ title }}") {
    throw new Error("DocumentFragment did not hydrate correctly.");
  }
  await renderTemplate("<h1>{{ title }}</h1>", { title: "New Title" }, element);
  const cachedHTML = element.innerHTML;
  await renderTemplate("<h1>{{ title }}</h1>", { title: "Cached Title" }, element);
  if (element.innerHTML === cachedHTML) {
    throw new Error("DocumentFragment was not rehydrated from cache.");
  }
});
//# sourceMappingURL=engineTests.test.js.map
