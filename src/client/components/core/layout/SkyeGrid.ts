// import { SkyeResponsiveComponent } from "../functions/mixins/Responsive.ts";

// class SkyeGrid extends SkyeResponsiveComponent {
//   override template(): string {
//     return `
//         <div class="grid-container">
//           <slot></slot>
//         </div>
//       `;
//   }

//   handleResize() {
//     super.handleResize(); // Call the default responsive handler
//     const gridContainer = this.querySelector(".grid-container") as HTMLDivElement;

//     if (gridContainer) {
//       if (globalThis.innerWidth < 768) {
//         gridContainer.style.gridTemplateColumns = "1fr"; // Single column on mobile
//       } else if (globalThis.innerWidth >= 768 && globalThis.innerWidth < 1024) {
//         gridContainer.style.gridTemplateColumns = "1fr 1fr"; // Two columns on tablet
//       } else {
//         gridContainer.style.gridTemplateColumns = "1fr 1fr 1fr"; // Three columns on desktop
//       }
//     }
//   }
// }

// customElements.define("skye-grid", SkyeGrid);
