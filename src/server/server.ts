import { renderTemplate } from "./templates/render.ts";
import { SkyeServer } from "./classes/SkyeServer.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { loggerMiddleware } from "./middleware/logger.ts";
import { contentTypeMiddleware } from "./middleware/contentType.ts";
import { jsonParser } from "./middleware/jsonParser.ts";
import { corsMiddleware } from "./middleware/cors.ts";
import { join } from "https://deno.land/std@0.203.0/path/mod.ts";
import { effect, reactive } from "./services/reactive.ts";
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

skyeServer.route("GET", "/welcome", async (ctx) => {
  const data = reactive({ title: "Welcome to Skye Framework", count: 0 });

  effect({
    update: () => {
      data.count++;
    }
  });

  const templatePath = join(Deno.cwd(), "server", "templates", "welcome.html");

  try {
    const templateContent = await Deno.readTextFile(templatePath);
    const renderedHtml = renderTemplate(templateContent, data);
    ctx.response.headers.set("Content-Type", "text/html");
    ctx.response.body = renderedHtml;
  } catch (error) {
    console.error("Error rendering template:", error);
    ctx.response.status = 500;
    ctx.response.body = "Internal Server Error";
  }
});


skyeServer.route("GET", "/static/:filename", async (ctx) => {
  const filename = ctx.request.params.filename;
  const filePath = join(Deno.cwd(), "public", filename);

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

skyeServer.route("GET", "/welcome", async (ctx) => {
  const data = reactive({ title: "Welcome to Skye Framework", count: 0 });
  data.count++;

  const templatePath = join(Deno.cwd(), "templates", "welcome.html");

  try {
    const renderedHtml = await renderTemplate(templatePath, data);
    ctx.response.headers.set("Content-Type", "text/html");
    ctx.response.body = renderedHtml;
  } catch (error) {
    console.error("Error rendering template:", error);
    ctx.response.status = 500;
    ctx.response.body = "Internal Server Error";
  }
});

skyeServer.route("*", "*", async (ctx) => {
  ctx.response.status = 404;
  ctx.response.body = "404 Not Found";
});

// Autoload routes
for await (const dirEntry of Deno.readDir('./server/routes')) {
  if (dirEntry.isFile && dirEntry.name.endsWith('.ts')) {
    const routeModule = await import(`./routes/${dirEntry.name}`);
    if (routeModule.default) {
      routeModule.default(skyeServer);
    }
  }
}


for (const [path, config] of Object.entries(routes)) {
skyeServer.route("GET", path, async (ctx) => {
    const data = await config.fetchData(ctx.request.params);
    const renderedContent = config.template(data);

    ctx.response.headers.set("Content-Type", "text/html");
    ctx.response.body = renderedContent;
  });
}

// Start the server
console.log("Server running on http://localhost:8000");
Deno.serve({ hostname: "0.0.0.0", port: 8000 }, (req) =>
  skyeServer.handleRequest(req)
);