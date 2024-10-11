// src/server/core/Server.ts

import { reactive } from './core/base/reactivity/reactive.ts';
import { ServerState } from "./core/base/persistence/stateClient.ts";
import { effect } from "./core/base/reactivity/reactive.ts";

// Map to store individual WebSocket connections and states (for personalized state)
const clients = new Map<WebSocket, ServerState>();

// Global state for broadcasting to all clients
const globalState: ServerState = reactive({
  count: 0,
  message: "Global State: Welcome to the application!",
});

// Choose whether to use global or personalized state per client
const useGlobalState = false; // Toggle between global and individual state

const port = 8080;

const handler = async (request: Request): Promise<Response> => {
  if (request.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request);

    if (useGlobalState) {
      handleGlobalWebSocket(socket);
    } else {
      handlePersonalWebSocket(socket);
    }

    return response;
  }

  return new Response("Not a WebSocket request", { status: 400 });
};

// Serve the handler
Deno.serve({ port }, handler);

console.log(`WebSocket server running on ws://localhost:${port}`);

// Handle WebSocket connections for global state broadcasting
function handleGlobalWebSocket(socket: WebSocket) {
  console.log("Client connected to global state");

  // Send initial global state to the client
  socket.send(JSON.stringify(globalState));

  // Listen for incoming messages from the client
  socket.onmessage = (event) => {
    const clientUpdate = JSON.parse(event.data);
    Object.assign(globalState, clientUpdate); // Update global state reactively
  };

  socket.onclose = () => {
    console.log("Client disconnected from global state");
  };

  socket.onerror = (e) => {
    console.error("WebSocket error:", e);
  };

  // Broadcast global state changes to all connected clients
  effect({
    syncState() {
      // Broadcast the global state to every connected client
      clients.forEach((_clientState, clientSocket) => {
        clientSocket.send(JSON.stringify(globalState));
      });
    }
  });
}

// Handle WebSocket connections for personalized client state
function handlePersonalWebSocket(socket: WebSocket) {
  console.log("Client connected with personalized state");

  // Initialize a personalized state for each client
  const clientState: ServerState = reactive({
    count: 0,
    message: "Personalized State: Welcome to your session!",
  });

  // Store the client WebSocket and state
  clients.set(socket, clientState);

  // Send the initial personalized state to the client
  socket.send(JSON.stringify(clientState));

  // Listen for incoming messages from the client
  socket.onmessage = (event) => {
    const clientUpdate = JSON.parse(event.data);
    Object.assign(clientState, clientUpdate); // Update the client's personalized state
  };

  socket.onclose = () => {
    console.log("Client disconnected from personalized state");
    // Remove the client from the map
    clients.delete(socket);
  };

  socket.onerror = (e) => {
    console.error("WebSocket error:", e);
  };

  // Automatically send state updates to the client
  effect({
    syncState() {
      socket.send(JSON.stringify(clientState));  // Sync the personalized state
    }
  });
}