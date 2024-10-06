import { reactive, effect } from "../../reactivity/reactive copy.ts";

export class SkyeComponent extends HTMLElement {
  state: any;

  constructor(initialState = {}) {  
    super();
    this.state = reactive(initialState);
  }

  connectedCallback() {
    const outer = this.render.bind(this);
    outer();
    effect({
      render() {
        outer();
      }
    });
  }

  disconnectedCallback() {
    // Handle cleanup or memory management if needed
  }

  render() {
    this.innerHTML = "";
    const template = this.renderTemplate();
    if (template) {
      this.appendChild(template);
    }
  }

  renderTemplate(): DocumentFragment | null {
    return document.createDocumentFragment();
  }
}