import type { Middleware, Context } from "../server.ts";
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
        original: req
      },
      response: {
        status: 200,
        body: {},
        headers: new Headers(),
      },
      state: {},
    };
  
    try {
      // Read and parse the request body
      if (req.method === "POST" || req.method === "PUT") {
        const contentType = req.headers.get("Content-Type") || "";
        if (contentType.includes("application/json")) {
          ctx.request.body = await req.json();
        } else if (contentType.includes("text/")) {
          ctx.request.body = await req.text();
        } else if (contentType.includes("application/octet-stream")) {
          ctx.request.body = await req.arrayBuffer();
        } else {
          ctx.request.body = await req.text();
        }
      }
  
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
  
    // Ensure the response body is properly serialized
    const responseBody =
      typeof ctx.response.body === "string" || ctx.response.body instanceof Uint8Array
        ? ctx.response.body
        : JSON.stringify(ctx.response.body);
  
    // Ensure Content-Type header is set
    if (!ctx.response.headers.has("Content-Type")) {
      ctx.response.headers.set("Content-Type", "application/javascript");
    }
  
    return new Response(responseBody, {
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
