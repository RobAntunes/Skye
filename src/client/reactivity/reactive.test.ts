import { reactive, effect } from "./reactive.ts";
import { SkyeComponent } from "../components/core/SkyeComponent.ts";
import { Accessible } from "../components/core/functions/mixins/Accessible.ts";
import { composeMixins } from "../components/core/functions/mixins/compose.ts";

function testReactivitySystem() {
  const state = reactive({ count: 0 });
  let dummy = 0;

  effect({
    dummy() {
      state.count;
    },
  });

  console.assert(dummy === 0, `Expected dummy to be 0, got ${dummy}`);

  state.count = 1;
  console.assert(dummy === 1, `Expected dummy to be 1, got ${dummy}`);

  state.count += 1;
  console.assert(dummy === 2, `Expected dummy to be 2, got ${dummy}`);

}

testReactivitySystem();

class TestComponent extends SkyeComponent {
  constructor() {
    super();
    this.state.title = "Initial Title";
  }

  override template(): string {
    return `<h1>${this.state.title}</h1>`;
  }
}

function testComponentRender() {
  const component = new TestComponent();
  component.connectedCallback();

  // Type assertion to HTMLElement
  const element = component as unknown as HTMLElement;

  console.assert(
    element.innerHTML.includes("Initial Title"),
    "Component did not render initial title."
  );

  // Change state
  component.state.title = "Updated Title";

  // The effect should trigger and re-render
  setTimeout(() => {
    console.assert(
      element.innerHTML.includes("Updated Title"),
      "Component did not update title on state change."
    );
    console.log("Component render test passed.");
  }, 0);
}

testComponentRender();

class AccessibleComponent extends composeMixins(SkyeComponent, Accessible) {
  constructor() {
    super();
    this.state.expanded = false;
  }

  override template(): string {
    return `<div>Accessible Content</div>`;
  }
}

function testAccessibilityReactivity() {
  const component = new AccessibleComponent();
  component.connectedCallback();

  const element = component as unknown as HTMLElement;

  console.assert(
    element.getAttribute("aria-expanded") === "false",
    "Initial aria-expanded should be false."
  );

  // Change state
  component.state.expanded = true;

  // The effect should trigger and update the attribute
  setTimeout(() => {
    console.assert(
      element.getAttribute("aria-expanded") === "true",
      "aria-expanded should update to true on state change."
    );
    console.log("Accessibility reactivity test passed.");
  }, 0);
}

testAccessibilityReactivity();
