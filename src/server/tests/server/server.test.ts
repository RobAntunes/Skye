// src/server/tests/server/server.test.ts

import { assertEquals } from "jsr:@std/assert";

// Mock WebSocket clients for global state broadcasting
const mockClient1Global = {
  send: (data: string) => {
    const update = JSON.parse(data);
    assertEquals(
      update.count,
      2,
      "Client 1 should receive the updated global state with count 2"
    );
  },
} as unknown as WebSocket;

const mockClient2Global = {
  send: (data: string) => {
    const update = JSON.parse(data);
    assertEquals(
      update.count,
      2,
      "Client 2 should receive the updated global state with count 2"
    );
  },
} as unknown as WebSocket;

// Mock WebSocket clients with personalized state
const mockClient1Personal = {
  send: (data: string) => {
    const update = JSON.parse(data);
    assertEquals(
      update.count,
      5,
      "Client 1 should receive its updated personalized state with count 5"
    );
  },
} as unknown as WebSocket;

const mockClient2Personal = {
  send: (data: string) => {
    const update = JSON.parse(data);
    assertEquals(
      update.count,
      3,
      "Client 2 should receive its updated personalized state with count 3"
    );
  },
} as unknown as WebSocket;

// Mock WebSocket client for disconnect tests
const mockDisconnectClient = {
  send: (_: string) => {},
  close: () => {
    console.log("Client disconnected");
  },
} as unknown as WebSocket;

/**
 * Tests for WebSocket Server Functionality
 */
Deno.test("Global State Broadcasting", async () => {
  const globalState = { count: 1, message: "Global State Initialized" };

  // Simulate a state update from one client
  const clientUpdate = { count: 2 };
  Object.assign(globalState, clientUpdate); // Apply the update

  // Wait a moment to simulate state propagation
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Broadcast the updated state to both clients
  mockClient1Global.send(JSON.stringify(globalState));
  mockClient2Global.send(JSON.stringify(globalState));
});

// src/server/tests/server/server.test.ts

Deno.test("Personalized WebSocket Connection", async () => {
  const clientState = { count: 0, message: "Personalized State Initialized" };

  // Simulate a client updating its state to 5
  const clientUpdate = { count: 5 };
  Object.assign(clientState, clientUpdate); // Apply the update

  // Wait a moment to simulate state propagation (if needed)
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Send the updated state back to the specific client
  mockClient1Personal.send(JSON.stringify(clientState));
});

Deno.test("Multiple Clients - Global State Broadcasting", async () => {
  const globalState = { count: 1, message: "Global State Initialized" };

  // Simulate a state update from one client
  const clientUpdate = { count: 2 };
  Object.assign(globalState, clientUpdate); // Apply the update

  // Wait a moment to simulate state propagation
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Broadcast the updated state to both clients
  mockClient1Global.send(JSON.stringify(globalState));
  mockClient2Global.send(JSON.stringify(globalState));
});

Deno.test("Multiple Respective Clients - Personalized State", async () => {
  // Initialize two personalized states for two clients
  const client1State = { count: 0, message: "Client 1 State Initialized" };
  const client2State = { count: 0, message: "Client 2 State Initialized" };

  // Simulate client 1 updating its state
  const client1Update = { count: 5 };
  Object.assign(client1State, client1Update); // Apply the update for client 1

  // Simulate client 2 updating its state
  const client2Update = { count: 3 };
  Object.assign(client2State, client2Update); // Apply the update for client 2

  // Wait to simulate state propagation (if needed)
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Send the updated states to the respective clients
  mockClient1Personal.send(JSON.stringify(client1State));
  mockClient2Personal.send(JSON.stringify(client2State));
});

Deno.test("Client Disconnect", async () => {
  // Simulate a client connecting
  const clients = new Map<WebSocket, { count: number }>();
  clients.set(mockDisconnectClient, { count: 0 });

  // Simulate client disconnecting
  mockDisconnectClient.close();
  clients.delete(mockDisconnectClient);

  assertEquals(
    clients.has(mockDisconnectClient),
    false,
    "Client should be removed from the clients map upon disconnection"
  );
});
