  const effect = (fn) => {
    subscribers.add(fn);
    fn();
  };
  
  let subscribers = new Set();
  function notifySubscribers() {
    subscribers.forEach(sub => sub());
  }
  
  // SkyeComponent class
  class SkyeComponent extends HTMLElement {
    constructor(initialState = {}) {  
      super();
      this.state = reactive(initialState);
    }
  
    connectedCallback() {
      const outer = this.render.bind(this);
      outer();
      effect(outer);
    }
  
    disconnectedCallback() {
      // Handle cleanup
    }
  
    render() {
      this.innerHTML = "";
      const template = this.renderTemplate();
      if (template) {
        this.appendChild(template);
      }
    }
  
    renderTemplate() {
      return document.createDocumentFragment();
    }
  }
  
  // Define the custom element
  customElements.define("skye-component", SkyeComponent);
  
  // Example usage
  class MyComponent extends SkyeComponent {
    constructor() {
      super({ count: 0 });
    }
  
    renderTemplate() {
      const fragment = document.createDocumentFragment();
      const button = document.createElement('button');
      button.textContent = `Count: ${this.state.count}`;
      button.addEventListener('click', () => {
        this.state.count++;
      });
      fragment.appendChild(button);
      return fragment;
    }
  }
  
  customElements.define("my-component", MyComponent);