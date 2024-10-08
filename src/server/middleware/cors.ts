import { type Context } from "../server.ts";

export const corsMiddleware = async (
  ctx: Context,
  next: () => Promise<void>
) => {
  // Set CORS headers
  ctx.response.headers.set("Access-Control-Allow-Origin", "*"); // Allow all origins (change "*" to specific domain if needed)
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  ); // Allowed HTTP methods
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  ); // Allowed headers
  ctx.response.headers.set("Access-Control-Allow-Credentials", "true"); // Allow credentials if needed

  // Handle preflight OPTIONS request
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No Content
    return;
  }

  // Proceed to the next middleware
  await next();
};
