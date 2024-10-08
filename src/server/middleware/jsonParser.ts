import { type Middleware } from "../index.ts";

export const jsonParser: Middleware = async (ctx, next) => {
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