// src/middleware/contentType.ts

import {type Middleware } from "../server.ts"; // Adjust the import path as necessary
import { contentType as getContentType } from "jsr:@std/media-types";

export const contentTypeMiddleware: Middleware = async (ctx, next) => {
  await next(); // Allow route handlers to set response.body first

  const { request, response } = ctx;

  // If Content-Type is already set, do nothing
  if (response.headers.has("Content-Type")) {
    return;
  }

  // Determine Content-Type based on the request URL's file extension
  const url = new URL(request.url);
  const pathname = url.pathname;
  const extension = pathname.split(".").pop();

  if (extension) {
    let mime = getContentType(extension);

    // Explicitly handle .ts files by setting MIME type to application/javascript
    if (extension === "ts") {
      mime = "application/javascript";
    }

    // Explicitly set `text/html` for .html files
    if (extension === "html") {
      mime = "text/html";
    }

    if (mime) {
      response.headers.set("Content-Type", mime);
      return;
    }
  }

  // Fallback: Check if it's the root ("/") and serve as HTML
  if (url.pathname === "/") {
    response.headers.set("Content-Type", "text/html");
    return;
  }

  // Fallback: Detect Content-Type based on response body
  if (response.body) {
    const fallbackContentType = detectContentType(response.body);
    if (fallbackContentType) {
      response.headers.set("Content-Type", fallbackContentType);
    }
  }
};

/**
 * Fallback method to detect Content-Type based on response body.
 *
 * @param body - The response body.
 * @returns The detected Content-Type or undefined.
 */
function detectContentType(body: any): string | undefined {
  if (typeof body === "string" || body instanceof String) {
    // Set to text/html for string content (HTML response)
    return "text/html";
  } else if (body instanceof Uint8Array) {
    return "application/octet-stream";
  } else if (typeof body === "object" || Object.getOwnPropertyNames(body).length > 0) {
    console.log(body);
    return "application/json";
  }
  return undefined;
}