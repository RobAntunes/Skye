import type { Middleware } from "../server.ts";

export const errorHandler: Middleware = async (ctx, next) => {
    try {
  console.log("hello from error", Deno.cwd());

      await next();
    } catch (error) {
      console.error("Error caught by middleware:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal Server Error" };
    }
  };