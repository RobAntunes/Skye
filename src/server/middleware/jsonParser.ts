import { type Middleware } from "../server.ts";

export const jsonParser: Middleware = async (ctx, next) => {
  console.log("hello from json type", Deno.cwd());
  if (ctx.request.method === "POST" || ctx.request.method === "PUT") {
    if (typeof ctx.request.body === "string") {
      try {
        ctx.request.body = JSON.parse(ctx.request.body);
      } catch (e) {
        console.error("Error parsing JSON body:", e);
        ctx.response.status = 400;
        return; // Exit early if there's an error
      }
    }
  }
  await next();
};