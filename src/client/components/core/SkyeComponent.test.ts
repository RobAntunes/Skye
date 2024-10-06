import { SkyeComponent } from "./SkyeComponent.ts";

// Extend SkyeComponent to create a simple test component
class UserComponent extends SkyeComponent {
    constructor() {
      super({ user: { name: 'John Doe' } });  // Initialize with some state
    }
  
    // Implement the renderTemplate method to generate the component's HTML
    override renderTemplate(): DocumentFragment {
      const fragment = document.createDocumentFragment();
      
      const welcomeMessage = document.createElement('h1');
      welcomeMessage.textContent = `Welcome, ${this.state.user.name}!`;
  
      fragment.appendChild(welcomeMessage);
      return fragment;
    }
  }
  
  // Define custom element
  customElements.define('user-component', UserComponent);
  
  // Test it in the HTML
  document.body.innerHTML = `<user-component></user-component>`;