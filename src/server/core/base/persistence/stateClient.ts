// src/client/state/StateClient.ts

export interface ServerState {
    count: number;
    message: string;
    // Add more properties as needed for your server-side state
  }

const ws = new WebSocket("ws://localhost:8080");

// Handle receiving state from the server
ws.onmessage = (event) => {
  const serverState = JSON.parse(event.data);
  // Update the client's state based on server state
  console.log("State received from server:", serverState);
};

// Send client-side state updates to the server
function sendStateUpdate(update: Partial<ServerState>) {
  ws.send(JSON.stringify(update));
}

// Example usage: send a state update to the server
sendStateUpdate({ count: 10 });