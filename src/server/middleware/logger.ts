import type { Middleware } from "../server.ts";

export const loggerMiddleware: Middleware = async (ctx, next) => {
  console.log("hello from logger", Deno.cwd());
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  
  // Measure response time
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  
  // Log the response
  console.log(`${ctx.request.method} ${ctx.request.url} - ${ctx.response.status} (${ms}ms)`);
};