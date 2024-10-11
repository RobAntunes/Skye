# Introduction to Skye

## Skye’s Philosophy

Skye is designed to be a batteries-included, full-stack framework that embraces JavaScript’s core strengths while offering a lightweight, performance-oriented solution for building applications. Inspired by frameworks like Rails and Laravel, Skye provides developers with a full-featured toolkit to manage both client-side and server-side logic in an integrated, streamlined way. It rejects unnecessary complexity, focusing on developer experience and performance without sacrificing extensibility.

### Core Philosophy Points:

- Simplicity by Default, Power for Advanced Users: Skye is easy for beginners to pick up but provides advanced users with powerful low-level primitives for greater control.
- Leverage Core JavaScript Features: Instead of relying on heavy abstractions or dependencies, Skye builds on JavaScript’s native features like prototypal inheritance, events, and reactivity.
- Performance-Centric: Aim for performance on par with modern reactive frameworks (e.g., Solid.js), with minimal overhead and optimal use of JavaScript features like proxies and event loops.

### Goals and Objectives

1.	Full-Stack Native Framework:
Skye aims to be a complete full-stack framework, where both client and server sides are deeply integrated. This eliminates the need to stitch together multiple frameworks or libraries for different layers of the stack.
2.	Developer Experience (DX):
Simplify common tasks (e.g., state management, UI updates, server communication) while offering clear, easy-to-understand APIs. Skye focuses on intuitive syntax, like:
```ts
const state = reactive({count: 0});
state.count++

const effects = effect({
	log() {
		console.log(count);
	}
}); 
```

3.	Real-Time Updates with Resumability:
Skye implements real-time state updates with resumability, meaning the system efficiently updates the UI as state changes occur, and operations pick up exactly where they left off. This ensures seamless transitions during real-time interactions.
	
 4.	Global and Local State Management:
Skye supports both global state and personalized state for individual WebSocket connections, giving developers flexibility in managing application-wide state as well as user-specific data.
	
 5.	Flexible, Observable System:
Skye’s core is built around an observable and reactive system, where reactivity is tied to state updates, and events are used as a core primitive. This approach avoids heavy abstractions and optimizes for fine-grained reactivity.
	
 6.	Server-Side and Client-Side Rendering:
It efficiently handles both SSR (Server-Side Rendering) and CSR (Client-Side Rendering), allowing applications to hydrate efficiently and reduce the load on the client, without sacrificing interactivity.

### Problems and Pain Points Skye Solves

1.	Complexity in Full-Stack Development:
Developers often juggle multiple frameworks (client-side, server-side, state management). Skye unifies these layers into a single coherent experience, solving the issue of fragmentation between client-server logic.
	
 2.	Performance Bottlenecks:
Many frameworks introduce unnecessary overhead in managing state and UI updates. Skye’s use of proxies, optimized event systems, and real-time updates addresses these bottlenecks, focusing on performance without bloating the codebase.
	
 3.	State Management Overhead:
Traditional frameworks use overly complicated state management systems (e.g., useState, useReducer, Vuex, Redux). Skye simplifies this by replacing the notion of “state” with reactive objects and proxies that trigger updates automatically.
	
 4.	Complex Reactivity:
Managing reactivity with dependencies in frameworks like React or Vue can be cumbersome. Skye provides fine-grained reactivity through observables and effects, allowing the developer to create composable, reusable effects with minimal boilerplate.
	
 5.	WebSocket Communication:
Handling WebSocket connections for both global and personalized state is a challenge for many developers. Skye simplifies this by providing built-in support for global broadcasting as well as individual client connections.
	
 6.	Overhead of Heavy Abstractions:
Skye avoids virtual DOM, excessive rerendering, or complex diffing algorithms. It solves the performance issues created by frameworks that rely on these concepts by using JavaScript’s native features (proxies, Object.defineProperty, etc.) and event-driven systems.

### Vision

The vision for Skye is to become the go-to full-stack framework for JavaScript and TypeScript developers, much like Rails and Laravel are for their respective ecosystems. By focusing on:

-	Performance,
-	Real-time interactivity,
-	Developer ergonomics,
-	And a native feel for the web,

Skye aims to be a modern, powerful, yet lightweight solution that can handle everything from simple applications to complex, real-time, full-stack apps without excessive overhead.

This summary encapsulates the key aspects of Skye’s goals, philosophy, and problem-solving approach. Let me know if there are any areas you’d like to tweak or expand upon!

## Core Principles of Skye

- Real-Time State Updates: Skye provides instant, real-time updates to state without the need for enqueuing or delays. State updates trigger effects immediately and ensure the UI is rerendered with minimal overhead.

-   Global State Management: Skye includes a global state management system that propagates updates across all components and listens for changes using an event-driven architecture.

-   Prototypal Inheritance: Skye leverages JavaScript’s prototypal inheritance and events to create a performant and extensible framework. This reduces the need for heavy abstractions and complex APIs, making Skye easier to use and extend.

- Event-Driven Architecture: Events are the primitive in Skye. State updates, UI rendering, and other framework actions are all powered by an event-based system.

-   Type Safety: Skye makes full use of TypeScript’s advanced type system, providing great type safety and developer tooling out of the box.

### Reactivity System

Skye provides a fine-grained reactivity system that allows you to create reactive state with minimal overhead. You can work with primitives, objects, and arrays to track changes and trigger effects when state updates.

#### Reactive Properties

Use reactive() to make objects reactive. Nested objects are automatically made reactive, and updates to properties will trigger any effects associated with them.
```ts
const state = reactive({
  count: 0,
  user: {
    name: 'Alice',
    age: 25
  }
});
```

#### Effects

Effects are functions that run automatically when their dependencies (reactive state) change. In Skye, effects are declared using a simple object syntax, making it easier to register multiple effects.
```ts
import { effect } from './reactivity/effect.ts';

effect({
  logCount() {
    console.log('Count is: ', state.count);
  },
  isEven() {
    console.log("Count is even: ", state.count % 2 == 0);
  }
});
```

Effect Shorthand Syntax: The effect syntax is simplified using object notation, so developers can register multiple effects in one place.
```ts
effect({
  logCount() {
	console.log(`Count is: ${state.count}`);
  }
});

state.count = 1;  // Triggers the effect and logs "Count is: 1"
```

#### Global State

Global state in Skye is managed using a reactive event-driven system. State changes can propagate across all components using the global event bus, ensuring that all parts of the application respond to changes in real time.

#### Global Reactive State

To create global state, use the globalReactive function. This makes the state globally available and automatically triggers events when state changes.
```ts
import { globalReactive, globalEvents } from './state/State.ts';

const globalState = globalReactive({ count: 0 });

// Listen for global state changes
globalEvents.on('countChange', (newCount) => {
  console.log('Global count changed to:', newCount);
});

// Updating global state triggers the event
globalState.count += 1;
```

Global Event Bus: The event bus allows components to listen for global state changes and react accordingly, making it easier to handle cross-component communication.

#### Real-Time State Updates

Skye’s real-time update system ensures that any changes to the state are applied instantly, and the UI is rerendered without delays or queues. State updates trigger effects immediately, and re-renders are batched and executed using requestAnimationFrame for optimal performance. The framework then picks up seamlessly where it left off.

#### Real-Time Updates
```ts
import { realTimeUpdate } from './state/realTime.ts';

realTimeUpdate(() => {
  globalState.count += 1;  // This triggers real-time state updates and UI rerender
});
```

### Performance and Task Batching

Skye optimizes performance by batching state updates and effect execution. Effects are queued and run once after the state has been updated. The framework uses requestAnimationFrame to batch UI updates and avoid unnecessary reflows.

#### Batched Updates

Batched updates ensure that multiple state changes trigger only a single re-render.
```ts
import { realTimeUpdate } from './state/realTime.ts';

realTimeUpdate(() => {
  globalState.count += 1;
  globalState.count += 2;  // Both updates will be batched and trigger a single re-render
});
```

#### Prototypal Inheritance and Events

Skye leverages JavaScript’s prototypal inheritance and event-driven architecture to provide a lightweight and extensible system. By relying on core JavaScript language features, Skye minimizes overhead and simplifies the userland API.

### Prototypal Inheritance

Objects in Skye inherit behavior from their prototypes, reducing the need for heavy abstractions.

### Event System

#### Overview

The event system in Skye provides a powerful mechanism for handling real-time event-driven communication within your application. It allows you to register listeners for custom events and trigger those events dynamically.

#### Key Features:

- Event-Driven Architecture: Allows developers to listen to and trigger custom events with ease.
- Multiple Listeners: Multiple listeners can be registered for the same event, and all will be invoked when the event is triggered.
- Proxy-based Interception: Built on JavaScript proxies, the event system efficiently intercepts and responds to event triggers.

#### Basic Usage

To start using the event system, create an instance of the Interceptor class, register listeners using the on method, and trigger events using the trigger method.
```ts
const interceptor = new Interceptor<'foo' | 'bar'>();

// Add a listener for the 'foo' event
interceptor.on('foo', (value) => {
  console.log('Foo event triggered with:', value);
});

// Trigger the 'foo' event
interceptor.trigger('foo', 'Hello from Foo');
```

Example: Listening for and Triggering Events

Listeners can be added for any event key defined in the Interceptor. When an event is triggered, all listeners associated with that event will be invoked.
```ts
const interceptor = new Interceptor<'foo' | 'bar'>();

interceptor.on('foo', (value) => {
  console.log('Foo event:', value);
});

interceptor.on('bar', (value) => {
  console.log('Bar event:', value);
});

// Trigger events
interceptor.trigger('foo', 'Foo has been triggered!');
// Output: Foo event: Foo has been triggered!

interceptor.trigger('bar', 123);
// Output: Bar event: 123
```

#### Handling Multiple Listeners for the Same Event

You can register multiple listeners for the same event. When that event is triggered, all listeners will be called in the order they were registered.
```ts
const interceptor = new Interceptor<'foo'>();

interceptor.on('foo', (value) => {
  console.log('Listener 1:', value);
});

interceptor.on('foo', (value) => {
  console.log('Listener 2:', value);
});

interceptor.trigger('foo', 'Hello to both listeners');
// Output:
// Listener 1: Hello to both listeners
// Listener 2: Hello to both listeners
```

#### Event Isolation

Each event operates independently, meaning triggering one event does not affect others.
```ts
const interceptor = new Interceptor<'foo' | 'bar'>();

interceptor.on('foo', (value) => {
  console.log('Foo event received:', value);
});

interceptor.on('bar', (value) => {
  console.log('Bar event received:', value);
});

interceptor.trigger('foo', 'Foo Event');
// Output: Foo event received: Foo Event

interceptor.trigger('bar', 456);
// Output: Bar event received: 456
```

The event system in Skye provides an easy-to-use API for handling custom events, making it a powerful tool for real-time communication within your application.

### Type Safety

Skye is designed with TypeScript at its core, providing advanced type safety for all state, effects, and events. This allows developers to catch errors early and ensures reliable and predictable behavior in large applications.

Skye is a powerful yet lightweight framework that combines real-time reactivity, global state management, and prototypal inheritance to provide a modern, flexible development experience. Whether you’re building a small app or a large-scale application, Skye’s event-driven architecture and use of JavaScript’s core features ensure high performance and scalability.

Yes, you are correct in merging the two files. Since both statesync.ts and server.ts contained WebSocket-related code, consolidating them into a single server.ts file simplifies the structure and reduces redundancy. This will also help in managing server-side state and WebSocket handling in one place, making it easier to maintain.

# Skye Server:

The WebSocket server in Skye provides real-time communication between the client and server. This allows for reactive state management, where updates on either the client or server are instantly reflected on the other side.

#### WebSocket State Management Options

Skye’s WebSocket server provides two primary modes of state synchronization: Global State Broadcasting and Personalized WebSocket Connections. Users can choose the appropriate mode based on their application’s needs.

#### Global State Broadcasting

In this mode, all connected clients share a global state. Any updates to the state made by one client are automatically broadcast to all other connected clients. This mode is ideal for applications where all clients need to remain in sync, such as real-time collaboration tools, shared dashboards, and multiplayer games.

- Usage: Set useGlobalState = true in server.ts to enable global state broadcasting.

Example:
```ts
// Server-side: Global state setup
const globalState = reactive({
  count: 0,
  message: "Global State Initialized",
});

// Client-side: Receiving global state updates
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (event) => {
  const state = JSON.parse(event.data);
  console.log("Received global state:", state);
};

// Sending state updates
ws.send(JSON.stringify({ count: 1 }));
```

#### Personalized WebSocket Connections

In this mode, each client maintains its own personalized state. Updates made by one client are only sent back to that specific client, without affecting other clients. This mode is useful for applications that require individualized views, such as personalized dashboards, user-specific sessions, and private workspaces.

- Usage: Set useGlobalState = false in server.ts to enable personalized WebSocket connections.

Example:
```ts
// Server-side: Personalized state setup for each client
const personalizedState = reactive({
  count: 0,
  message: "Personalized State Initialized",
});

// Client-side: Receiving personalized state updates
const ws = new WebSocket("ws://localhost:8080");
ws.onmessage = (event) => {
  const state = JSON.parse(event.data);
  console.log("Received personalized state:", state);
};

// Sending personalized state updates
ws.send(JSON.stringify({ count: 1 }));
```

#### Toggling Between Modes

Skye makes it easy to toggle between global state broadcasting and personalized WebSocket connections. Simply change the useGlobalState variable in the server.ts file to switch modes.

Example:
```ts
// Toggling between global and personalized state modes
const useGlobalState = true;  // Set to false for personalized state
```

### Fine-Grained Reactivity

Skye’s reactivity system is fine-grained, meaning only the properties you access within an effect will trigger reactivity. For example, if you track state.count in one effect and update state.name, the effect tracking count will not run.
```ts
const state = reactive({ count: 1, name: 'Alice' });

effect(() => {
  console.log(`Count is: ${state.count}`);
});

effect(() => {
  console.log(`Name is: ${state.name}`);
});

state.count = 2;  // Only the effect that tracks count will trigger
state.name = 'Bob';  // Only the effect that tracks name will trigger
```
### Computed Properties

You can create computed properties using the computed() function. Computed properties automatically recompute when their dependencies (reactive properties) change.
```ts
const state = reactive({ count: 2 });

const doubleCount = computed(() => state.count * 2);
console.log(doubleCount.value);  // Logs: 4

state.count = 3;
console.log(doubleCount.value);  // Logs: 6
```

### Derived State

Derived state allows you to create state that is based on other state, similar to computed properties, but more declarative.
```ts
const state = reactive({ count: 5 });

const derivedCount = derived(() => state.count + 10);
console.log(derivedCount.value);  // Logs: 15

state.count = 10;
console.log(derivedCount.value);  // Logs: 20
```
