import { reactive } from "../../client/reactivity/reactive.ts";
import type { Context, Middleware } from "../server.ts";

// Server-side reactivity
export const createReactiveMiddleware = () => {
    const state = reactive({
      // Your reactive state here
      connections: 0,
      lastAccess: new Date(),
    });
  
    const middleware: Middleware = async (ctx: Context, next: () => void) => {
      state.connections++;
      state.lastAccess = new Date();
      ctx.state.reactive = state;
      await next();
    };
  
    return middleware;
  };