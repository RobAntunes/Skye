import { TresServer, type Context } from "./src/server/index.ts";
import { App } from "./App.ts";
import { UserComponent } from "./src/components/custom/UserComponent.ts";

// Initialize the server
const server = new TresServer();

server.use(async (ctx: Context, next) => {
  console.log(`Request received: ${ctx.request.method} ${ctx.request.url}`);
  await next();
});

server.use(async (ctx: Context, next) => {
  ctx.response.headers.append("Access-Control-Allow-Origin", "*");
  await next();
});

server.route("GET", "/api/users/:id", async (ctx) => {
  const userId = ctx.request.params.id;
  ctx.response.body = { userId, name: "John Doe" };
});

// Start the server
Deno.serve({ port: 4507 }, async (req) => await server.handleRequest(req));

// Initialize the frontend
function initializeFrontend() {
  const app = new App();
  document.getElementById("app")?.appendChild(app);

  // Initialize other components
  customElements.define("user-component", UserComponent);
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", initializeFrontend);

// Log that everything is started
console.log(
  "Tres.js application started. Frontend initialized and server running on http://localhost:8000"
);
