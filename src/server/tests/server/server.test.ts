import { assertEquals } from "jsr:@std/assert";
import { renderTemplate } from "../../templates/render.ts"; // Adjust the import path
import { reactive } from "../../services/reactive.ts";

Deno.test("Server-side template rendering with reactivity", async () => {
  const data = reactive({ title: "Test Title", count: 1 });
  const templatePath = "./templates/welcome.html";
  const rendered = await renderTemplate(templatePath, data);

  assertEquals(rendered.includes("<title>Test Title</title>"), true);
  assertEquals(rendered.includes("<h1>Test Title</h1>"), true);
  assertEquals(rendered.includes("You have visited this page 1 times."), true);

  // Simulate state change
  data.count++;
  // Since we're not in an actual server context, we need to manually re-render
  const updatedRendered = await renderTemplate(templatePath, data);

  assertEquals(
    updatedRendered.includes("You have visited this page 2 times."),
    true
  );
});
