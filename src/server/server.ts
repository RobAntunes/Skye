import { renderTemplate } from "./templates/render.ts";
import { SkyeServer } from "./classes/SkyeServer.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { loggerMiddleware } from "./middleware/logger.ts";
import { contentTypeMiddleware } from "./middleware/contentType.ts";
import { jsonParser } from "./middleware/jsonParser.ts";
import { corsMiddleware } from "./middleware/cors.ts";
import { join } from "https://deno.land/std@0.203.0/path/mod.ts";
import { reactive } from "./services/reactive.ts";
// @ts-ignore
import { routes } from "../server/data/mappings.ts";
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

// Middleware
skyeServer.use(loggerMiddleware);
skyeServer.use(contentTypeMiddleware);
skyeServer.use(errorHandler);
skyeServer.use(jsonParser);
skyeServer.use(corsMiddleware);

skyeServer.route("GET", "/static/:filename", async (ctx) => {
  const filename = ctx.request.params.filename;
  const filePath = join(Deno.cwd(), "public", filename);
  console.log(filePath);

  try {
    const content = await Deno.readFile(filePath);
    const ext = filename.split(".").pop();
    const contentType = getContentType(ext);
    ctx.response.headers.set("Content-Type", contentType);
    ctx.response.body = content;
  } catch (error) {
    console.error(`Error serving static file ${filename}:`, error);
    ctx.response.status = 404;
    ctx.response.body = "File not found";
  }
});

function getContentType(ext: string | undefined): string {
  const mimeTypes: Record<string, string> = {
    css: "text/css",
    js: "application/javascript",
    html: "text/html",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    svg: "image/svg+xml",
    // Add other MIME types as needed
  };
  return mimeTypes[ext || ""] || "application/octet-stream";
}

skyeServer.route("GET", "/welcome", async (ctx: Context) => {
  const data = reactive({
    title: "Welcome to Skye Framework",
    user: { isLoggedIn: true, name: "Alice" },
  });
  const templatePath = join(
    Deno.cwd(),
    "src",
    "server",
    "static",
    "welcome.html"
  );
  console.log(templatePath);

  const renderedContent = await renderTemplate(templatePath, data);
  console.log(renderedContent);
  ctx.response.headers.set("Content-Type", "text/html");
  ctx.response.body = renderedContent;
});

skyeServer.route("*", "*", async (ctx) => {
  ctx.response.status = 404;
  ctx.response.body = "404 Not Found";
});

// Autoload routes
// for await (const dirEntry of Deno.readDir('.server/routes')) {
//   if (dirEntry.isFile && dirEntry.name.endsWith('.ts')) {
//     const routeModule = await import(`./routes/${dirEntry.name}`);
//     if (routeModule.default) {
//       routeModule.default(skyeServer);
//     }
//   }
// }

// for (const [path, config] of Object.entries(routes)) {
// skyeServer.route("GET", path, async (ctx) => {
//     const _data = await config.fetchData(ctx.request.params);
//     const renderedContent = config.template

//     ctx.response.headers.set("Content-Type", "text/html");
//     ctx.response.body = renderedContent;
//   });
// }

// Start the server
console.log("Server running on http://localhost:8000");
Deno.serve({ hostname: "0.0.0.0", port: 8000 }, (req) => {
  console.log(Deno.cwd());
  return skyeServer.handleRequest(req);
});
