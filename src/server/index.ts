import { readAll } from "jsr:@std/io/read-all";
import { reactive } from "../reactivity/reactive copy.ts";
import { setMIMEType } from "../lib/middleware/MIMETypes.ts";

type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

export interface Context {
  request: {
    method: string;
    url: string;
    headers: Headers;
    params: Record<string, string>;
    query: Record<string, string>;
    body?: any;
  };
  response: {
    status: number;
    body: any;
    headers: Headers;
  };
  state: Record<string, any>;
}

class Router {
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

export class TresServer {
  private middlewares: Middleware[] = [];
  private router: Router = new Router();

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  route(
    method: string,
    path: string,
    handler: (ctx: Context) => Promise<void>
  ) {
    this.router.add(method, path, handler);
  }

  private async runMiddleware(
    ctx: Context,
    middlewares: Middleware[]
  ): Promise<void> {
    const composedMiddleware = async (index: number): Promise<void> => {
      if (index < middlewares.length) {
        await middlewares[index](ctx, () => composedMiddleware(index + 1));
      }
    };
    await composedMiddleware(0);
  }

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const ctx: Context = {
      request: {
        method: req.method,
        url: req.url,
        headers: req.headers,
        params: {},
        query: this.parseQuery(url.searchParams),
        body: undefined,
      },
      response: {
        status: 200,
        body: null,
        headers: new Headers(),
      },
      state: {},
    };

    try {
      // Run global middlewares
      await this.runMiddleware(ctx, this.middlewares);

      // Route matching
      const match = this.router.match(req.method, url.pathname);
      if (match) {
        ctx.request.params = match.params;
        await match.handler(ctx);
      } else {
        ctx.response.status = 404;
        ctx.response.body = { error: "Not Found" };
      }
    } catch (error) {
      console.error("Server error:", error);
      ctx.response.status = 500;
      ctx.response.body = { error: "Internal Server Error" };
    }

    return new Response(JSON.stringify(ctx.response.body), {
      status: ctx.response.status,
      headers: ctx.response.headers,
    });
  }

  private parseQuery(searchParams: URLSearchParams): Record<string, string> {
    const result: Record<string, string> = {};
    const paramString = searchParams.toString();
    if (paramString) {
      const pairs = paramString.split("&");
      for (const pair of pairs) {
        const [key, value] = pair.split("=");
        result[decodeURIComponent(key)] = decodeURIComponent(value || "");
      }
    }
    return result;
  }
}

// Middleware implementations
const jsonParser: Middleware = async (ctx, next) => {
  if (ctx.request.headers.get("content-type") === "application/json") {
    const body = await readAll(ctx.request.body);
    ctx.request.body = JSON.parse(new TextDecoder().decode(body));
  }
  await next();
};

const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("Error caught by middleware:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal Server Error" };
  }
};

const logger: Middleware = async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(
    `${ctx.request.method} ${ctx.request.url} - ${ctx.response.status} - ${ms}ms`
  );
};

// Server-side reactivity
const createReactiveMiddleware = () => {
  const state = reactive({
    // Your reactive state here
    connections: 0,
    lastAccess: new Date(),
  });

  const middleware: Middleware = async (ctx, next) => {
    state.connections++;
    state.lastAccess = new Date();
    ctx.state.reactive = state;
    await next();
  };

  return middleware;
};

// Example usage
const server = new TresServer();

server.use(setMIMEType)
server.use(errorHandler);
server.use(logger);
server.use(jsonParser);
server.use(createReactiveMiddleware());

server.route("GET", "/api/users/:id", async (ctx) => {
  const userId = ctx.request.params.id;
  ctx.response.body = {
    userId,
    message: "User details",
    stats: ctx.state.reactive,
  };
});
