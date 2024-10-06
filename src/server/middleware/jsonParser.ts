import type { Middleware } from "../index.ts";
import { readAll } from "jsr:@std/io/read-all";

export const jsonParser: Middleware = async (ctx, next) => {
    if (ctx.request.headers.get("content-type") === "application/json") {
      const body = await readAll(ctx.request.body);
      ctx.request.body = JSON.parse(new TextDecoder().decode(body));
    }
    await next();
  };