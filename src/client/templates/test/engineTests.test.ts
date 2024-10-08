import { SkyeComponent } from "../../components/core/SkyeComponent.ts";
import { renderTemplate } from "../utils/lazyRender.ts";

Deno.test("Template caching and hashing", async () => {
    const template = `<h1>{{ title }}</h1>`;
    const state = { title: "Skye Framework" };
    const element = document.createElement("div");
  
    // Initial render
    await renderTemplate(template, state, element);
    const initialHTML = element.innerHTML;
  
    // Update the state but without changing the template
    state.title = "Updated Title";
    await renderTemplate(template, state, element);
  
    // Ensure the DOM was updated correctly
    if (element.innerHTML !== "<h1>Updated Title</h1>") {
      throw new Error(`Expected <h1>Updated Title</h1> but got ${element.innerHTML}`);
    }
  
    // Change state back to the original, verify it's cached
    state.title = "Skye Framework";
    await renderTemplate(template, state, element);
  
    if (element.innerHTML === initialHTML) {
      throw new Error("Template was incorrectly re-rendered from cache.");
    }
  });

  Deno.test("Fine-grained reactivity", async () => {
    const template = `<h1>{{ title }}</h1><p>{{ description }}</p>`;
    const state = { title: "Skye Framework", description: "A modern JS framework" };
    const element = document.createElement("div");
  
    // Initial render
    await renderTemplate(template, state, element);
  
    // Update only the description
    state.description = "Updated description";
    await renderTemplate(template, state, element);
  
    // Ensure the title was not re-rendered
    if (element.querySelector("h1")?.textContent !== "Skye Framework") {
      throw new Error("Title should not have been re-rendered.");
    }
  
    // Ensure the description was updated
    if (element.querySelector("p")?.textContent !== "Updated description") {
      throw new Error("Description was not updated correctly.");
    }
  });

  Deno.test("DocumentFragment integration and caching", async () => {
    const component = new SkyeComponent();
    const fragment = component.autoParseTemplate();
  
    if (!(fragment instanceof DocumentFragment)) {
      throw new Error("autoParseTemplate did not return a DocumentFragment");
    }
  
    // Append to the DOM
    const element = document.createElement("div");
    element.appendChild(fragment.cloneNode(true));
  
    // Ensure the fragment's content is correct
    const h1 = element.querySelector("h1");
    if (!h1 || h1.textContent !== "{{ title }}") {
      throw new Error("DocumentFragment did not hydrate correctly.");
    }
  
    // Test caching by rendering again
    await renderTemplate("<h1>{{ title }}</h1>", { title: "New Title" }, element);
    const cachedHTML = element.innerHTML;
  
    await renderTemplate("<h1>{{ title }}</h1>", { title: "Cached Title" }, element);
    if (element.innerHTML === cachedHTML) {
      throw new Error("DocumentFragment was not rehydrated from cache.");
    }
  });