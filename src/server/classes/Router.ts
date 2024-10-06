import type { Context } from "../index.ts";

export class Router {
    private routes: Map<string, Map<string, (ctx: Context) => Promise<void>>> =
      new Map();
  
    add(method: string, path: string, handler: (ctx: Context) => Promise<void>) {
      if (!this.routes.has(method)) {
        this.routes.set(method, new Map());
      }
      this.routes.get(method)!.set(path, handler);
    }
  
    match(
      method: string,
      path: string
    ): {
      handler: (ctx: Context) => Promise<void>;
      params: Record<string, string>;
    } | null {
      const methodRoutes = this.routes.get(method);
      if (!methodRoutes) return null;
  
      for (const [routePath, handler] of methodRoutes.entries()) {
        const params: Record<string, string> = {};
        const routeParts = routePath.split("/");
        const pathParts = path.split("/");
  
        if (routeParts.length === pathParts.length) {
          let match = true;
          for (let i = 0; i < routeParts.length; i++) {
            if (routeParts[i].startsWith(":")) {
              params[routeParts[i].slice(1)] = pathParts[i];
            } else if (routeParts[i] !== pathParts[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            return { handler, params };
          }
        }
      }
  
      return null;
    }
  }