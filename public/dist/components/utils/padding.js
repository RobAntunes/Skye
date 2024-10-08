// src/client/lib/utils/breakpoints.ts
var breakpoints_default = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

// src/client/components/utils/padding.ts
var SkyePadding = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  static get observedAttributes() {
    return [
      "all",
      "top",
      "bottom",
      "left",
      "right",
      "all-sm",
      "top-sm",
      "bottom-sm",
      "left-sm",
      "right-sm",
      "all-md",
      "top-md",
      "bottom-md",
      "left-md",
      "right-md",
      "all-lg",
      "top-lg",
      "bottom-lg",
      "left-lg",
      "right-lg",
      "all-xl",
      "top-xl",
      "bottom-xl",
      "left-xl",
      "right-xl"
    ];
  }
  attributeChangedCallback(_name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.updateStyle();
    }
  }
  updateStyle() {
    this.shadowRoot.innerHTML = `
          <style>
            :host {
              display: block; 
              padding: ${this.getAttribute("all") || "0"}; // Apply 'all' padding directly
              padding-top: ${this.getAttribute("top") || "0"};
              padding-bottom: ${this.getAttribute("bottom") || "0"};
              padding-left: ${this.getAttribute("left") || "0"};
              padding-right: ${this.getAttribute("right") || "0"};
    
              // Apply responsive padding (example for small breakpoint)
              @media (min-width: ${breakpoints_default.sm}) {
                padding: ${this.getAttribute("all-sm") || "0"};
                padding-top: ${this.getAttribute("top-sm") || "0"};
                // ... other responsive padding properties ...
              }
    
              // ... other breakpoint media queries ...
            }
          </style>
          <slot></slot> 
        `;
  }
};
customElements.define("Skye-p", SkyePadding);
//# sourceMappingURL=padding.js.map
