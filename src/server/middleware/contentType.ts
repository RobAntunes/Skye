import type { Middleware } from "../server.ts";

export const contentTypeMiddleware: Middleware = async (ctx, next) => {
  console.log("hello from content type", Deno.cwd());
  const { response } = ctx;
  if (response.body && !response.headers.has("Content-Type")) {
    const contentType = detectContentType(response.body);
    if (contentType) {
      response.headers.set("Content-Type", contentType);
    }
  }
  await next();
};

function detectContentType(body: any): string | undefined {
  if (typeof body === "string") {
    return "text/html";
  } else if (body instanceof Uint8Array) {
    return "application/octet-stream";
  } else if (typeof body === "object") {
    return "application/json";
  }
  return undefined;
}