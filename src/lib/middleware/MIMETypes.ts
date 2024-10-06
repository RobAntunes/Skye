import type { Context } from "../../server/index.ts";

export function setMIMEType(ctx: Context, next: () => void): void {
  if (ctx.request.url.endsWith(".ts")) {
    ctx.request.headers.set("Content-Type", "application/json");
    ctx.response.headers.set("Content-Type", "application/json");
  }
  next();
}
