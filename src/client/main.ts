import { SkyeComponent } from './components/core/SkyeComponent.ts';

// Example usage
class MyComponent extends SkyeComponent {
  constructor() {
    super();
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