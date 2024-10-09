// server_test.ts (example using Deno's testing library)
import { assertEquals } from "jsr:@std/assert";
import { renderTemplate } from "../../templates/render.ts"; // Adjust the import path accordingly

Deno.test("Test server-side template rendering", async () => {
  const data = { title: "Test Title" };
  const templatePath = "./templates/welcome.html";
  const rendered = await renderTemplate(templatePath, data);
  assertEquals(rendered.includes("<title>Test Title</title>"), true);
  assertEquals(rendered.includes("<h1>Test Title</h1>"), true);
});