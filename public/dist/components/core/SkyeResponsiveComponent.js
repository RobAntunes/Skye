var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// src/client/reactivity/reactive.ts
var targetMap = /* @__PURE__ */ new WeakMap();
var reactiveMap = /* @__PURE__ */ new WeakMap();
var activeEffect = null;
var suspendedEffects = [];
function track(target, prop) {
  if (activeEffect) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      depsMap = /* @__PURE__ */ new Map();
      targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(prop);
    if (!dep) {
      dep = /* @__PURE__ */ new Set();
      depsMap.set(prop, dep);
    }
    dep.add(activeEffect);
  }
}
function trigger(target, prop) {
  const depsMap = targetMap.get(target);
  if (depsMap) {
    const effects = depsMap.get(prop);
    if (effects) {
      effects.forEach(runEffect);
    }
  }
}
function runEffect(effect2) {
  try {
    activeEffect = effect2;
    effect2();
  } catch (error) {
    if (error instanceof Promise) {
      suspendedEffects.push({ fn: effect2, target: null, prop: null });
      error.then(() => {
        const index = suspendedEffects.findIndex((e) => e.fn === effect2);
        if (index !== -1) {
          suspendedEffects.splice(index, 1);
        }
        runEffect(effect2);
      });
    } else {
      console.error("Effect error:", error);
    }
  } finally {
    activeEffect = null;
  }
}
function reactive(target) {
  if (reactiveMap.has(target)) {
    return reactiveMap.get(target);
  }
  const handler = {
    get(obj, prop, receiver) {
      const result = Reflect.get(obj, prop, receiver);
      track(obj, prop);
      return result;
    },
    set(obj, prop, value, receiver) {
      const oldValue = Reflect.get(obj, prop, receiver);
      const result = Reflect.set(obj, prop, value, receiver);
      if (oldValue !== value) {
        trigger(obj, prop);
      }
      return result;
    }
  };
  const proxy = new Proxy(target, handler);
  reactiveMap.set(target, proxy);
  return proxy;
}
function effect(effects) {
  Object.values(effects).forEach(runEffect);
}

// src/client/templates/engine.ts
function parseTemplate(template, state = {}) {
  const fragment = document.createDocumentFragment();
  const tokens = template.split("");
  let currentToken = "";
  const elements = [];
  tokens.forEach((char) => {
    currentToken += char;
    if (currentToken.endsWith("}}")) {
      elements.push(currentToken);
      currentToken = "";
    } else if (char === " " || char === "\n" || char === "	") {
      elements.push(currentToken);
      currentToken = "";
    }
  });
  elements.forEach((token) => {
    if (token.startsWith("{{") && token.endsWith("}}")) {
      const expression = token.slice(2, -2).trim();
      const value = new Function(...Object.keys(state), `return ${expression};`)(...Object.values(state));
      const textNode = document.createTextNode(value);
      fragment.appendChild(textNode);
    } else {
      const textNode = document.createTextNode(token);
      fragment.appendChild(textNode);
    }
  });
  return fragment;
}

// src/client/components/core/SkyeResponsiveComponent.ts
var SkyeResponsiveComponent = class extends HTMLElement {
  constructor(initialState = {}, responsive = true) {
    super();
    __publicField(this, "state");
    __publicField(this, "responsive");
    this.state = reactive(initialState);
    this.responsive = responsive;
    this.handleResize = this.handleResize.bind(this);
  }
  connectedCallback() {
    this.render();
    if (this.responsive) {
      globalThis.addEventListener("resize", this.handleResize);
      this.handleResize();
    }
    effect({
      render: () => this.render()
    });
    this.setupAccessibility();
  }
  disconnectedCallback() {
    if (this.responsive) {
      globalThis.removeEventListener("resize", this.handleResize);
    }
  }
  render() {
    const template = this.autoParseTemplate();
    this.innerHTML = "";
    this.appendChild(template);
  }
  autoParseTemplate() {
    return parseTemplate(this.template());
  }
  template() {
    return "";
  }
  handleResize() {
    const width = globalThis.innerWidth;
    if (width < 768) {
      this.classList.add("mobile");
    } else if (width >= 768 && width < 1024) {
      this.classList.add("tablet");
    } else {
      this.classList.add("desktop");
    }
  }
  setupAccessibility() {
    if (!this.getAttribute("role")) {
      this.setAttribute("role", "region");
    }
  }
};
customElements.define("skye-responsive-component", SkyeResponsiveComponent);
export {
  SkyeResponsiveComponent
};
//# sourceMappingURL=SkyeResponsiveComponent.js.map
