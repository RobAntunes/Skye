// tests/component_test.ts

import { compileSFC } from "../services/compiler/sfcCompiler.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("MyComponent increments count on button click", async () => {
  // Compile the component
  await compileSFC("./components/MyComponent.skye");

  // Create an instance of the component
  const component = document.createElement("my-component") as any;

  // Append to the DOM
  document.body.appendChild(component);

  // Wait for the component to initialize
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Get the initial count
  let countText = component.shadowRoot.querySelector("button").textContent;
  assertEquals(countText, "Count: 0");

  // Click the button
  const button = component.shadowRoot.querySelector("button");
  button.click();

  // Wait for the state to update
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Get the updated count
  countText = component.shadowRoot.querySelector("button").textContent;
  assertEquals(countText, "Count: 1");

  // Clean up
  document.body.removeChild(component);
});