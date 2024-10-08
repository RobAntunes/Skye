import { SkyeServer } from "./classes/SkyeServer.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { loggerMiddleware } from "./middleware/logger.ts";
import { setMIMEType } from "./middleware/MIMETypes.ts";
import { jsonParser } from "./middleware/jsonParser.ts";
import { corsMiddleware } from "./middleware/cors.ts";
import { join, extname } from "https://deno.land/std@0.203.0/path/mod.ts";
import { contentType } from "https://deno.land/std@0.203.0/media_types/mod.ts";
import { crypto } from "jsr:@std/crypto/crypto";

export type Middleware = (
  ctx: Context,
  next: () => Promise<void>
) => Promise<void>;

export interface Context {
  request: {
    method: string;
    url: string;
    headers: Headers;
    params: Record<string, string>;
    query: Record<string, string>;
    body?: any;
    original: Request;
  };
  response: {
    status: number;
    body: any;
    headers: Headers;
  };
  state: Record<string, any>;
}

const skyeServer = new SkyeServer();

// Add middlewares
skyeServer.use(loggerMiddleware);
skyeServer.use(setMIMEType);
skyeServer.use(errorHandler);
skyeServer.use(jsonParser);
skyeServer.use(corsMiddleware);

skyeServer.route("GET", "/", async (ctx) => {
  const filePath = join(Deno.cwd(), "public/index.html");
  try {
    const content = await Deno.readFile(filePath);
    ctx.response.headers.set("Content-Type", "text/html");
    ctx.response.body = content;
  } catch (error) {
    console.error(`Error serving root index.html:`, error);
    ctx.response.status = 404;
    ctx.response.body = "File not found";
  }
});

// Wildcard route to handle all GET requests
skyeServer.route("GET", "*", async (ctx) => {
  const url = new URL(ctx.request.url);
  const pathname = decodeURIComponent(url.pathname);
  const filePath = join(Deno.cwd(), "public", pathname);

  // Prevent directory traversal attacks
  const resolvedPath = join(filePath);
  const publicDir = join(Deno.cwd(), "public");
  if (!resolvedPath.startsWith(publicDir)) {
    ctx.response.status = 403;
    ctx.response.body = "Forbidden";
    return;
  }

  try {
    const content = await Deno.readFile(filePath);
    const ext = extname(filePath);
    const mimeType = contentType(ext) || "application/octet-stream";

    ctx.response.headers.set("Content-Type", mimeType);
    ctx.response.body = content;
  } catch (error) {
    console.error(`Error serving ${pathname}:`, error);
    ctx.response.status = 404;
    ctx.response.body = "File not found";
  }
});

skyeServer.route("POST", "api/hash", async (ctx) => {
  try {
    const { template } = ctx.request.body;
    if (!template) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Template not provided" };
      return;
    }

    // Perform the hashing using BLAKE3
    const encoder = new TextEncoder();
    const data = encoder.encode(template);
    const hashBuffer = await crypto.subtle.digest("BLAKE3", data);

    // Convert the ArrayBuffer to a hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    ctx.response.headers.set("Content-Type", "application/json");
    ctx.response.status = 200;
    ctx.response.body = { data: hexHash };
  } catch (err) {
    console.error("Error in /api/hash:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Hashing failed" };
  }
});

// Start the server
console.log(`Server starting on http://localhost:8000`);

Deno.serve({ hostname: "0.0.0.0", port: 8000 }, async (request: Request) => {
  return await skyeServer.handleRequest(request);
});
