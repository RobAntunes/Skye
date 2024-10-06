import { SkyeServer } from "./classes/SkyeServer.ts";
import { loggerMiddleware } from "./middleware/logger.ts";
import { setMIMEType } from "./middleware/MIMETypes.ts";

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
  };
  response: {
    status: number;
    body: any;
    headers: Headers;
  };
  state: Record<string, any>;
}

const skyeServer = new SkyeServer();

skyeServer.use(loggerMiddleware);
skyeServer.use(setMIMEType);
//skyeServer.use(errorHandler);
//skyeServer.use(jsonParser);
//skyeServer.use(createReactiveMiddleware());

skyeServer.route("GET", "/:filename", async (ctx) => {
  const filename = ctx.request.params.filename;
  try {
    let filePath;
    console.log(filename);
    if (filename === "" || filename === "/") {
      filePath = "./public/index.html"; // Serve index.html for the root path
    } else if (filename.endsWith(".ts")) {
      filePath = `./src/client/${filename}`;
    } else {
      filePath = `./public/${filename}`;
    }
    const content = await Deno.readFile(filePath);
    const decoder = new TextDecoder("utf-8"); // Create a TextDecoder instance
    ctx.response.headers.append("Content-Type", "text/html");
    ctx.response.body = decoder.decode(content);
    console.log(ctx.response.body) // Decode the content before sending
  } catch (error) {
    // ... error handling ...
  }
});

const port = 8000;

console.log(`Server starting on http://localhost:${port}`);

Deno.serve({ port }, async (request: Request) => {
  return await skyeServer.handleRequest(request);
});
