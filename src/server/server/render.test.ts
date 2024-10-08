// tests/templateRenderer.test.ts

import { hashTemplate, renderTemplate } from "../templates/render.ts";
import { assertEquals } from "jsr:@std/assert";

Deno.test("hashTemplate returns consistent hashes", async () => {
  const template = "<h1>{{title}}</h1>";
  const hash1 = await hashTemplate(template);
  const hash2 = await hashTemplate(template);
  assertEquals(hash1, hash2);
});

Deno.test("hashTemplate returns different hashes for different templates", async () => {
  const template1 = "<h1>{{title}}</h1>";
  const template2 = "<h1>{{name}}</h1>";
  const hash1 = await hashTemplate(template1);
  const hash2 = await hashTemplate(template2);
  assertEquals(hash1 !== hash2, true);
});

Deno.test("renderTemplate correctly renders templates", async () => {
  const template = "<h1>{{title}}</h1>";
  const data = { title: "Test Title" };
  const result = renderTemplate(template, data);
  assertEquals(await result, "<h1>Test Title</h1>");
});

Deno.test("renderTemplate sanitizes output", async () => {
  const template = "<div>{{content}}</div>";
  const data = { content: "<script>alert('XSS');</script>" };
  const result = renderTemplate(template, data);
  assertEquals(await result, "<div>&lt;script&gt;alert(&#39;XSS&#39;);&lt;/script&gt;</div>");
});