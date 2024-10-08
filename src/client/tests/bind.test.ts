import { compileSFC } from "../services/compiler/sfcCompiler.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("MyComponent updates name on input change", async () => {
  await compileSFC("./components/MyComponent.skye");
  const component = document.createElement("my-component") as any;
  document.body.appendChild(component);

  await new Promise((resolve) => setTimeout(resolve, 0));

  const input = component.shadowRoot.querySelector("input");
  const output = component.shadowRoot.querySelector("p");

  // Simulate user typing "Alice" into the input
  input.value = "Alice";
  input.dispatchEvent(new Event("input"));

  // Wait for the state to update
  await new Promise((resolve) => setTimeout(resolve, 0));

  // Check that the output displays the updated name
  const outputText = output.textContent;
  assertEquals(outputText, "Hello, Alice!");

  document.body.removeChild(component);
});
