import { TresComponent } from './src/components/core/TresComponent.ts';

export class App extends TresComponent {
  constructor() {
    super({
      count: 0,
      message: 'Welcome to Tres.js!'
    });
  }

  override renderTemplate() {
    const template = document.createDocumentFragment();
    const appDiv = document.createElement('div');
    appDiv.innerHTML = `
      <h1>${this.state.message}</h1>
      <p>Count: ${this.state.count}</p>
      <button id="increment">Increment</button>
      <user-component></user-component>
    `;
    
    const incrementButton = appDiv.querySelector('#increment');
    incrementButton?.addEventListener('click', () => {
      this.state.count++;
    });

    template.appendChild(appDiv);
    return template;
  }
}

customElements.define('app-root', App);