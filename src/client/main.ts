import { SkyeComponent } from './components/core/SkyeComponent.ts';

// Define the custom element
customElements.define("skye-component", SkyeComponent);

// Example usage
class MyComponent extends SkyeComponent {
  constructor() {
    super({ count: 0 });
  }

  override renderTemplate() {
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