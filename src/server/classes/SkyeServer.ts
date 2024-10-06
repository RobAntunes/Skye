import type { Middleware, Context } from "../index.ts";
import { Router } from "./Router.ts";

export class SkyeServer {
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

    return new Response(ctx.response.body, {
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
