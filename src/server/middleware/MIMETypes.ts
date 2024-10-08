import type { Context, Middleware } from "../index.ts";

const mimeTypes: Record<string, string> = {
  ".ts": "application/javascript",
  ".js": "application/javascript",
  ".jsx": "application/javascript",
  ".tsx": "application/javascript",
  ".mjs": "application/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".wav": "audio/wav",
  ".mp4": "video/mp4",
  ".woff": "application/font-woff",
  ".ttf": "application/font-ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "application/font-otf",
  ".wasm": "application/wasm",
};

export const setMIMEType: Middleware = async (
  ctx: Context,
  next: () => Promise<void>
) => {
  const url = new URL(ctx.request.url);
  const pathParts = url.pathname.split(".");

  // Debugging to ensure correct parsing

  const extension = pathParts.length > 1 ? `.${pathParts.pop()}` : "";

  const mimeType =
    mimeTypes[extension] ||
    (url.pathname === "/" ? "text/html" : "application/octet-stream");

  ctx.response.headers.set("Content-Type", mimeType);

  await next();
};
