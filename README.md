# Skye: A Modern Full-Stack JavaScript Framework

Skye is a cutting-edge full-stack JavaScript framework designed for building high-performance, scalable web applications. It emphasizes developer experience, ease of use, and performance, enabling developers to create dynamic and responsive applications efficiently. Skye aims to be the batteries included default for the JavaScript ecosystem allowing any sole seasoned developer to create prdocuction ready apps, leveling the playing field while raising the bar.

Table of Contents

  1.	Key Features
  2.	Getting Started
  3.	Reactivity Engine
    -	Core Concepts
    -	API Reference
    - Advanced Reactivity Tuning
	4.	Template System
	  - Skye Templating Engine
	  -  Using skye Tagged Templates
	  -	Arbitrary JavaScript Execution
	5.	Responsive Utility Components
	  -	SkyeGrid
	  -	SkyeSpacing
    -	Extending Utility Components
	6.	Functional Components and Web Component Abstraction
	  - Defining Functional Components
	  -	Using effect and effect.obtain
	  -	Responsive and Accessible Components
	7.	Server
	  -	Key Features
	  -	Core Concepts
	  -	API Reference
	  -	Advanced Features
	8.	Performance Optimizations
	  -	Template Caching and Hashing
	  -	Fine-Grained Reactivity
	  -	Worker Pool for Parallel Processing

## Key Features

-	AI-Powered Automated Testing: Eliminate manual testing with AI-generated test cases. Skye analyzes your components and state interactions to create comprehensive tests, saving you time and effort. (Accessible via a paid API or by integrating with other AI testing providers.)
	
-	WASM-First, Component-Based Reactivity: Experience blazing-fast performance with a WASM-powered reactivity engine. Components update independently in response to state changes, eliminating the need for a virtual DOM and reducing unnecessary re-renders.
	
-	Two-Way Data Binding: Simplify state management with intuitive two-way data binding. Components directly reflect changes in the underlying data, making your code cleaner and easier to reason about.
	
-	Modular Architecture: Skye is highly modular, allowing you to use only the features you need. Choose from a variety of modules for routing, API integration, server-side rendering, and more.
	
-	Simple Reactivity: Enjoy a simple and elegant reactivity system. Reassign state values directly without the need for complex setter functions.
	
-	Separation of Concerns: Write maintainable code with a clear separation of concerns. Skye provides tooling to easily navigate between component logic, styles, and templates.
	
-	Custom Templating Language: Leverage a custom templating language designed to seamlessly integrate with Skye’s reactivity system.
	
-	TypeScript First: Benefit from type safety and improved code readability with TypeScript.
	
-	Full-Stack Capabilities: Build complete web applications with server-side rendering (SSR) and API integration modules.
	
-	Arbitrary JavaScript Execution in Templates: Use the powerful skye templating engine to execute arbitrary JavaScript functions within your HTML templates.

## Getting Started

### Installation

To get started with Skye, ensure you have Deno 2 installed on your machine.

```bash
deno run --watch --allow-read --allow-write --allow-net src/server/server.ts
```

### Basic Usage

```typescript
import { reactive, effect } from "skye";

const state = reactive<{ count: number, name: string }>({ 
  count: 0, 
  name: "Skye" 
});

effect({
  log() {
    console.log("Count:", state.count);
    console.log("Name:", state.name);
  }
});
```

### Reactivity Engine

Skye features a powerful and efficient reactivity system that allows you to build dynamic and responsive applications. It automatically tracks dependencies between your data and your code, ensuring that your application stays in sync with any changes in the underlying state.

Core Concepts

-	Reactive Objects: Objects created using reactive() become reactive. Any changes to their properties will trigger updates in the parts of your application that depend on those properties.
-	Effects: Effects are functions that are automatically re-executed whenever their dependencies change. They are defined using the effect() function.
-	Dependency Tracking: The reactivity system automatically tracks which reactive properties are accessed within an effect. When those properties change, the effect is re-executed.

## API Reference

```typescript
reactive(target)
```
Creates a reactive proxy around the given target object.

Parameters:

-	target: The object to be made reactive.

Returns:

-	A reactive proxy of the target object.

Example:
```typescript
import { reactive } from 'skye';

const state = reactive({ count: 0 });

state.count++; // This will trigger any effects that depend on 'count'
```

```typescript
effect(effects: Record<string, Function>)
```
Defines and runs one or more effects.

Parameters:

-	effects: An object where the keys are arbitrary names and the values are effect functions.

Example:

```typescript
import { reactive, effect } from 'skye';

const state = reactive({ count: 0 });

effect({
  log() {
    console.log("Count:", state.count);
  }
});

state.count++;
```

```typescript
rerender()
```
Manually triggers a re-render of the application. Useful for handling asynchronous effects or forcing updates.

Example:
```typescript
import { rerender } from 'skye';

// ... some asynchronous operation that updates the state ...

rerender(); // Trigger a forced re-render to reflect the changes
```

### Advanced Reactivity Tuning

Skye provides fine-grained control over how reactivity and effects are handled, allowing you to optimize performance, control execution order, and manage state updates more efficiently.

#### Priority

Executes effects in a defined order of priority. Higher priority effects run before lower priority ones.
```typescript
priority(1, () => {
  effect({
    doSomething() {
      console.log("High priority effect");
    }
  });
});
```

#### Debounce

Ensures the effect is delayed and only executed after the specified delay has passed without further state changes.
```typescript
debounce(300, () => {
  effect({
    doSomething() {
      console.log("Debounced effect");
    }
  });
});
```

#### Throttle

Limits how frequently an effect can run, ensuring it only executes at most once during the specified interval.
```typescript
throttle(1000, () => {
  effect({
    doSomething() {
      console.log("Throttled effect");
    }
  });
});
```

#### Batch

Groups multiple state updates or effects together, ensuring they are executed simultaneously to avoid unnecessary re-renders.
```typescript
batch(() => {
  effect({
    doSomething() {
      console.log("Batched effect");
    }
  });
});
```

#### Lazy

Defers effect execution until explicitly triggered.
```typescript
lazy(() => {
  effect({
    doSomething() {
      console.log("Lazy effect, only triggered when needed");
    }
  });
});
```

#### Pause and Resume

Gives control over when an effect is paused and resumed, allowing effects to be deferred during heavy computations.
```typescript
pause(() => {
  effect({
    doSomething() {
      console.log("Effect is paused");
    }
  });
});
```
```typescript
resume(() => {
  effect({
    doSomething() {
      console.log("Effect resumed");
    }
  });
});
```

#### Limit

Restricts how many times an effect can run.
```typescript
limit(3, () => {
  effect({
    doSomething() {
      console.log("This effect will only run 3 times");
    }
  });
});
```


## The Effects class 

The Effects class serves as the cornerstone of Skye’s reactive and event-driven architecture. It offers a unified interface for managing reactive state, handling events, and executing both synchronous and asynchronous effects. This streamlined approach enhances encapsulation, maintainability, and scalability, providing you with robust tools to build dynamic and responsive web applications.

Key Functionalities

1.	Reactive State Management:
    -	Reactive Proxies: Creates reactive proxies for state objects, enabling automatic tracking and updating of dependencies.
    - Dependency Tracking: Monitors which effects depend on which state properties, ensuring that changes trigger appropriate updates.
2.	Event Handling:
	  -	Event Subscription: Allows components and other parts of the application to subscribe to specific events.
	  -	Event Emission: Facilitates the emission of events, notifying all subscribed listeners.
	  -	One-Time Listeners: Supports listeners that are invoked only once, enhancing flexibility in event management.
3.	Effect Management:
    -	Synchronous Effects (sync): Executes effects immediately, suitable for straightforward state manipulations.
    - Asynchronous Effects (async): Handles effects that involve asynchronous operations, awaiting their completion.
	  -	Advanced Asynchronous Operations (obtain): Manages complex asynchronous tasks with features like caching, retries, debouncing, and throttling.
    - Fire-and-Forget Effects (future): Executes asynchronous effects without awaiting their completion, ideal for non-blocking operations.
4.	Utility Functions:
	  -	Delay: Introduces pauses in execution, useful for retry mechanisms.
	  -	Debounce and Throttle: Controls the frequency of effect executions to optimize performance and prevent excessive operations.

Documentation: Using the Effects Class

1. Importing the Effects Instance

To utilize the reactive and event-driven functionalities, import the singleton effects instance from the Effects module.
```ts
import { effects } from './core/Effects.ts';
import { reactive } from './core/reactive.ts';
```

2. Creating Reactive State

Use the reactive function to create a reactive state object. This object will automatically track dependencies and trigger effects upon state changes.
```ts
interface AppState {
  count: number;
  user: { name: string; age: number } | null;
}

const state = reactive<AppState>({
  count: 0,
  user: null,
});
```

3. Defining Effects

a. Synchronous Effects (sync)

Define effects that execute synchronously. These are ideal for simple state manipulations or computations.
```ts
effects.sync(() => {
  console.log(`Count has changed to: ${state.count}`);
});
```
	•	Parameters:
	•	effectFn: The synchronous function to execute.
	•	options (optional): Configuration options (e.g., immediate).

b. Asynchronous Effects (async)

Handle effects that involve asynchronous operations, such as data fetching or timers.
```ts
effects.async(async () => {
  const response = await fetch('/api/data');
  state.user = await response.json();
});
```
	•	Parameters:
	•	effectFn: The asynchronous function to execute.
	•	options (optional): Configuration options (e.g., immediate).

c. Advanced Asynchronous Operations (obtain)

Manage complex asynchronous tasks with enhanced control features.
```ts
effects.obtain(fetchUserData, {
  cache: true,
  retries: 3,
  onStart: () => console.log('Fetching user data...'),
  onComplete: (data) => console.log('User data fetched:', data),
  onError: (error) => console.error('Error fetching data:', error),
  debounce: 300,
});
```
	•	Parameters:
	•	asyncOperation: The asynchronous function to execute.
	•	options (optional):
	•	cache: Enables caching of the operation result.
	•	retries: Number of retry attempts upon failure.
	•	onStart: Callback invoked at the start of the operation.
	•	onProgress: Callback for progress updates.
	•	onComplete: Callback invoked upon successful completion.
	•	onError: Callback invoked upon encountering an error.
	•	debounce: Delays the execution by specified milliseconds.
	•	throttle: Limits the execution frequency to specified milliseconds.

d. Fire-and-Forget Effects (future)

Execute asynchronous effects without waiting for their completion. Useful for non-blocking operations.
```ts
//Todo: remove await and introduce and event on completion
effects.future(async () => {
  await sendAnalyticsData(state.user);
});
```
	•	Parameters:
	•	effectFn: The asynchronous function to execute.
	•	options (optional): Configuration options (e.g., immediate).

4. Event Handling

a. Subscribing to Events

Listen to specific events emitted by the Effects class.
```ts
effects.on('effectRun', (payload) => {
  console.log('An effect has run:', payload);
});
```
b. Unsubscribing from Events

Remove previously subscribed listeners to prevent memory leaks or unwanted behavior.
```ts
const listener = (payload) => {
  console.log('Effect completed:', payload);
};
```
```ts
effects.on('effectRun', listener);

// Later in the code
effects.off('effectRun', listener);
```
c. One-Time Listeners (once)

Listen to an event only once. The listener is automatically removed after its first invocation.
```ts
effects.once('operationComplete', (payload) => {
  console.log('Operation completed:', payload);
});
```

The Effects class is a unified solution that integrates reactive state management, event handling, and effect execution. It extends the EventEmitter class to facilitate event-driven interactions and incorporates reactive proxies for dynamic state updates.

Reactive State Management

reactive
```ts
public reactive<T extends object>(target: T): T
```
	•	Description: Creates a reactive proxy for the provided target object. Any changes to the reactive properties will automatically trigger associated effects.
	•	Parameters:
	•	target: The object to be made reactive.
	•	Returns: A reactive proxy of the target object.

Effect Execution

sync
```ts
public sync(effectFn: () => void, options?: EffectOptions): void
```
	•	Description: Defines and executes a synchronous effect function.
	•	Parameters:
	•	effectFn: The synchronous function to execute.
	•	options (optional): Configuration options.
	•	immediate (boolean): If false, the effect won’t run immediately upon definition. Defaults to true.

async
```ts
public async async(effectFn: () => Promise<void>, options?: EffectOptions): Promise<void>

	•	Description: Defines and executes an asynchronous effect function.
	•	Parameters:
	•	effectFn: The asynchronous function to execute.
	•	options (optional): Configuration options.
	•	immediate (boolean): If false, the effect won’t run immediately upon definition. Defaults to true.
```
obtain
```ts
public async obtain(
  asyncOperation: () => Promise<any>,
  options?: {
    cache?: boolean;
    retries?: number;
    onStart?: Function;
    onProgress?: Function;
    onComplete?: Function;
    onError?: Function;
    debounce?: number;
    throttle?: number;
  }
): Promise<any>
```
	•	Description: Executes an asynchronous operation with advanced handling features like caching, retries, debouncing, and throttling.
	•	Parameters:
	•	asyncOperation: The asynchronous function to execute.
	•	options (optional): Configuration options.
	•	cache (boolean): Enables caching of the operation result.
	•	retries (number): Number of retry attempts upon failure.
	•	onStart (Function): Callback invoked at the start of the operation.
	•	onProgress (Function): Callback for progress updates.
	•	onComplete (Function): Callback invoked upon successful completion.
	•	onError (Function): Callback invoked upon encountering an error.
	•	debounce (number): Delays execution by specified milliseconds.
	•	throttle (number): Limits execution frequency to specified milliseconds.
	•	Returns: The result of the asynchronous operation.

future
```ts
public future(effectFn: () => Promise<void>, options?: EffectOptions): void
```
	•	Description: Executes an asynchronous effect without awaiting its completion. Suitable for fire-and-forget operations.
	•	Parameters:
	•	effectFn: The asynchronous function to execute.
	•	options (optional): Configuration options.
	•	immediate (boolean): If false, the effect won’t run immediately upon definition. Defaults to true.
1. Utility Functions

delay
```ts
private delay(ms: number): Promise<void>
```
	•	Description: Introduces a delay in execution.
	•	Parameters:
	•	ms: Milliseconds to delay.
	•	Returns: A promise that resolves after the specified delay.

debounce
```ts
private debounce(fn: Function, delayMs: number): Promise<any>
```
	•	Description: Delays function execution by the specified milliseconds, preventing rapid successive executions.
	•	Parameters:
	•	fn: The function to debounce.
	•	delayMs: The delay in milliseconds.
	•	Returns: A debounced promise.

throttle
```ts
private throttle(fn: Function, limitMs: number): Promise<any>
```
	•	Description: Limits the frequency of function executions to once per specified interval.
	•	Parameters:
	•	fn: The function to throttle.
	•	limitMs: The time limit in milliseconds.
	•	Returns: A throttled promise.

### Events

The Effects class emits various events to notify subscribed listeners about the lifecycle stages of effects and operations. Components and other parts of the application can listen to these events to perform actions in response.

Available Events

	1.	effectRun
	•	Description: Emitted when an effect (synchronous, asynchronous, or future) is executed.
	•	Payload:
```ts
{
  type: 'sync' | 'async' | 'future';
  effectFn: EffectFunction;
}
```

	2.	effectError
	•	Description: Emitted when an error occurs during the execution of an effect.
	•	Payload:
```ts
{
  type: 'sync' | 'async' | 'future';
  error: any;
}
```

	3.	operationStart
	•	Description: Emitted at the start of an asynchronous operation managed by obtain.
	•	Payload:
```ts
{
  asyncOperation: Function;
}
```

	4.	operationComplete
	•	Description: Emitted upon the successful completion of an asynchronous operation managed by obtain.
	•	Payload:
```ts
{
  asyncOperation: Function;
  result: any;
}
```

	5.	operationError
	•	Description: Emitted when an error occurs during an asynchronous operation managed by obtain.
	•	Payload:
```ts
{
  asyncOperation: Function;
  error: any;
}
```


#### Subscribing to Events

Use the on method to subscribe to events.
```ts
effects.on('effectRun', (payload) => {
  console.log('An effect has run:', payload);
});

effects.on('operationComplete', (payload) => {
  console.log('Operation completed:', payload);
});
```
Unsubscribing from Events

Use the off method to remove event listeners.
```ts
const effectRunListener = (payload) => {
  console.log('Effect run:', payload);
};

effects.on('effectRun', effectRunListener);

// Later in the code
effects.off('effectRun', effectRunListener);
```
One-Time Event Listeners

Use the once method to listen to an event only once.
```ts
effects.once('operationError', (payload) => {
  console.error('Operation failed:', payload);
});
```

### Worker Pool for Parallel Processing

Skye introduces a worker pool for parallel execution, allowing you to offload heavy computations or async tasks into background workers, improving performance without blocking the main thread.

Creating a Worker Pool:
```typescript
class WorkerPool {
  constructor(maxWorkers: number) {
    // Initialize workers
  }

  submitTask(task: any) {
    // Submit tasks to the worker pool
  }

  // Handle task execution, message passing, etc.
}
```

### Using parallel to Run Tasks in Parallel:
```typescript
parallel(() => {
  effect({
    doStuff() {
      // Heavy computation that runs in parallel
      console.log("Running in parallel");
    }
  });
}, { maxWorkers: 4 });
```

### Handling Asynchronous Operations: effect.obtain

Skye introduces the obtain function to manage complex asynchronous operations with options like caching, retries, pagination, and parallel processing.

API:

#####	Parameters:
-	asyncOperation: A function that returns a promise (e.g., an API call).
-	options: An object containing:
-	cache: Enables caching of the result.
-	paginate: Handles pagination for large datasets.
-	maxCacheAge: Controls how long the cache is valid.
-	retries: Number of retries if the operation fails.
-	parallel: Enables running the operation in parallel using a worker pool.
-	maxWorkers: Defines the number of workers for parallel execution.
-	batch: Batches multiple async operations for efficiency.

Example Usage:
```typescript
effect.obtain({
  async getData(
    cache: true,
      retries: 3,
      parallel: true,
      maxWorkers: 4,
  ) {
    const data = await fetch('https://api.example.com/data');
    const res = await data.json();
    return res;
  }
});
```

### Template System

Skye’s templating system is designed to be powerful and flexible, allowing developers to seamlessly integrate arbitrary JavaScript within HTML templates using the skye tagged template literals.

### Skye Templating Engine

Skye's templating engine allows you to create dynamic HTML templates with embedded JavaScript logic. It provides an intuitive way to manage template rendering, variable interpolation, and arbitrary JavaScript execution.

### Using skye Tagged Templates

Skye uses tagged template literals to process and render templates. You can execute arbitrary JavaScript functions within your templates by using the skye tag.

Example:

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{ title }}</title>
    <link rel="stylesheet" href="/static/styles.css" />
  </head>
  <body>
    <h1>{{ title }}</h1>
    <p>You have visited this page {{ count }} times.</p>
    {{ skye`${
      () => { 
        console.log("This is arbitrary JavaScript inside a template"); 
        return "This text is returned from the skye function";
    }}` }}
    <p>{{ skye`Current time: ${new Date().toLocaleTimeString()}` }}</p>
    <script src="/public/app.js"></script>
  </body>
</html>

Explanation:

	•	Variable Interpolation:
	•	{{ title }} and {{ count }} are placeholders that get replaced with actual values from the route handler’s context.
	•	Arbitrary JavaScript Execution:
	•	{{ skye`${() => { … } }` }}: Executes the provided function on the server side, logs a message to the server console, and replaces the placeholder with the returned string.
	•	{{ skye`Current time: ${new Date().toLocaleTimeString()}` }}: Embeds the current time into the rendered HTML.

### Arbitrary JavaScript Execution

Skye allows embedding and executing arbitrary JavaScript within your templates, providing full flexibility to manipulate data, perform computations, or interact with external APIs directly within your HTML.

Example:
```typescript
<p>{{ skye`${() => { 
  console.log("Executing complex logic");
  const greeting = "Hello, Skye!";
  return greeting;
}` }}</p>
```
Rendered Output:

<p>Hello, Skye!</p>

Server Console Output:

Executing complex logic

### Responsive Utility Components

Skye provides a set of responsive utility components that simplify building responsive layouts. These components leverage CSS variables, viewport-based sizing, Flexbox/Grid layouts, and utility classes to offer flexibility and ease of use.

#### SkyeGrid

<SkyeGrid> is a responsive grid container that automatically adjusts the number of columns based on screen size.

Usage:

<SkyeGrid>
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</SkyeGrid>

Default Behavior:

	•	Mobile (below 768px): One column
	•	Tablet (768px - 1024px): Two columns
	•	Desktop (1024px and above): Three columns

Extending SkyeGrid:

You can create custom grid layouts by extending the SkyeGrid component.

Example:
```typescript
class CustomGrid extends SkyeGrid {
  handleResize() {
    const gridContainer = this.querySelector('.grid-container');
    if (window.innerWidth < 640) {
      gridContainer.style.gridTemplateColumns = '1fr';
    } else if (window.innerWidth >= 640 && window.innerWidth < 960) {
      gridContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
      gridContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
  }
}
```

SkyeSpacing

<SkyeSpacing> is a responsive spacing container that adjusts padding based on screen size.

Usage:

<SkyeSpacing>
  <p>This content has responsive padding based on the viewport size.</p>
</SkyeSpacing>

Default Behavior:

	•	Mobile (below 768px): Small padding
	•	Tablet (768px - 1024px): Medium padding
	•	Desktop (1024px and above): Large padding

### Extending Utility Components

Skye’s utility components are designed to be easily extensible, allowing developers to customize or create new components tailored to their needs.

Example: Extending SkyeGrid
```typescript
class CustomGrid extends SkyeGrid {
  handleResize() {
    const gridContainer = this.querySelector('.grid-container');
    if (window.innerWidth < 640) {
      gridContainer.style.gridTemplateColumns = '1fr';
    } else if (window.innerWidth >= 640 && window.innerWidth < 960) {
      gridContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
      gridContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }
  }
}
```

## Single File Components and Web Component Abstraction

Skye introduces a powerful abstraction layer above native web components, enabling developers to define functional components that compile down to web components. This offers a simpler API for defining components while leveraging the power and efficiency of native web components for performance and compatibility.

### Defining Single File Components

A single file component in Skye is defined as a simple template that written with html, css, and javascript. Skye automatically handles the lifecycle, rendering, and reactivity of the component but provides hooks to allow the developer the have control over every aspect of the component and it's lifecycle.

Example: Simple File Component
```ts
import { reactive, effect } from 'skye';

<script lang="ts">
  const state = reactive({ count: 0 });

  effect({
    doSomething() {
      console.log('Component mounted or state updated.');
    }
  });
<script>

<div>
  <h1 class="heading">Count: {state.count}</h1>
  <button onclick={() => state.count++}>Increment</button>
</div>

<style>
  .heading {
    ...
  }
</style>
}
```

### Key Features:

- Automatic Rendering: The MyComponent functional component will automatically rerender when state.count is updated.
-	Simplified API: No need to manage the lifecycle or manually handle rendering. Skye manages it behind the scenes.
-	Web Component Integration: The functional component is transformed into a native web component under the hood, ensuring compatibility and performance.
-	Automatic Cleanup: Effects inside the component, such as the effect() hook, are cleaned up automatically when the component is removed from the DOM.

### Using effect and effect.obtain

**effect**: Automatically handles side effects, such as data fetching or event listeners, when the component is mounted or updated.

Example: Fetching Data with effect
```typescript
import { reactive, effect } from 'skye';

<script lang="ts">
  const state = reactive({ data: null });

  effect.obtain({
    getData() {
      fetch('/api/data')
        .then(response => response.json())
        .then(data => state.data = data);
      // Cleanup (like removing listeners or aborting requests) happens automatically when the component is removed
    }
  });

  <div>
    {state.data ? (
       <p>Data: {state.data}</p>
    ) : (
       <p>Loading...</p>
    )}
  </div>

  <style>
    p {
      ...
    }
  </style>
```

Explanation:

	•	effect.obtain: Manages asynchronous operations with options for caching, retries, parallel processing, etc.
	•	Automatic Cleanup: Cleanup for effects is managed by Skye, eliminating the need for explicit unmounting logic.

### Responsive and Accessible Components

Components in Skye are responsive and accessible by default, with the flexibility to opt-out or customize behavior as needed.

Example: Responsive Functional Component
// responsive;
```html
<div class="responsive-container">
  <p>This component is responsive by default.</p>
</div>
```

### Key Points:

-	Default Responsiveness: Components adjust their layout based on viewport size.
-	Accessibility: Built-in accessibility features ensure components are usable by all users.
-	Customization: Easily extend or override default behaviors using JavaScript.

### kye Utility Components: Extending Single File Components

Skye provides a set of utility components that can be used inside templates or functional components to handle common responsive and layout patterns.

Example: Using SkyeGrid in a Functional Component
```typescript
<script>
import { SkyeGrid } from './components/utilities/SkyeGrid';

  <div>
    <SkyeGrid>
      <div class="card">Card 1</div>
      <div class="card">Card 2</div>
      <div class="card">Card 3</div>
    </SkyeGrid>
  <div>
```

Explanation:

	•	Reusable Layouts: Utilize utility components like SkyeGrid to create consistent and responsive layouts.
	•	Extensibility: Extend utility components to customize behavior as per application needs.

## Server

The Skye Server is a powerful and flexible server implementation designed to work seamlessly with the Skye framework. It provides a robust foundation for building scalable and reactive web applications.

### Key Features

-	Advanced Routing: Support for pattern matching and route parameters.
-	Flexible Middleware System: Easy integration of custom middleware for various purposes.
-	Built-in Error Handling: Graceful error management and informative error responses.
-	Logging: Built-in request and response logging for debugging and monitoring.
-	Server-side Reactivity: Manages server-side state reactively while keeping requests and responses stateless.
-	TypeScript Support: Fully typed for improved developer experience and code reliability.

### Core Concepts

#### Context Object

The Context object is central to Skye’s Server. It encapsulates all the information about the current request and response, and is passed through all middleware and route handlers.

(WIP)
```typescript
interface Context {
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
```

### Middleware

Middleware functions in Skye Server have the following signature:
```typescript
type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;
```
Middleware can perform operations before and after the next middleware or route handler is called. They can modify the Context object, handle errors, or perform any other necessary operations.

### Routing

The Skye Server supports flexible routing with pattern matching and route parameters. Routes are defined using the route method:
```typescript
server.route(method: string, path: string, handler: (ctx: Context) => Promise<void>);
```
Route parameters (e.g., :id in /users/:id) are automatically parsed and available in ctx.request.params.

## API Reference

### SkyeServer

The main server class that manages routes, middleware, and handles incoming requests.

Constructor:
```typescript
constructor();
```
Methods:

- use(middleware: Middleware): void
Adds a middleware function to the server.
Example:
```ts
server.use(loggerMiddleware);
```
-	route(method: string, path: string, handler: (ctx: Context) => Promise<void>): void
Defines a new route with the specified HTTP method, path, and handler.
Example:
```ts
server.route("GET", "/api/users/:id", async (ctx) => {
  const userId = ctx.request.params.id;
  ctx.response.body = { userId, message: "User details" };
});
```

-	handleRequest(req: Request): Promise<Response>
Handles an incoming HTTP request by processing middleware and routing.

Usage:
This method is typically used internally by the server and doesn’t need to be called manually.

#### Middleware Examples

-	Logger Middleware:
Logs incoming requests.
```ts
const loggerMiddleware: Middleware = async (ctx, next) => {
  console.log(`Incoming request: ${ctx.request.method} ${ctx.request.url}`);
  await next();
  console.log(`Response status: ${ctx.response.status}`);
};
```

Content Type Middleware:
Sets the Content-Type header based on response content.
```ts
const contentTypeMiddleware: Middleware = async (ctx, next) => {
  await next();
  if (typeof ctx.response.body === 'string') {
    ctx.response.headers.set("Content-Type", "text/html");
  }
};
```

Error Handling Middleware:
Catches and handles errors gracefully.
```ts
const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("Unhandled error:", error);
    ctx.response.status = 500;
    ctx.response.body = "Internal Server Error";
  }
};
```


Example Usage

server.ts:
```ts
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
```

### Performance Optimizations

Skye incorporates several performance optimizations to ensure high efficiency and responsiveness in your applications.

#### Template Caching and Hashing

Skye caches templates to prevent unnecessary re-rendering, enhancing overall performance. It uses the BLAKE3 hashing algorithm to compare the current template with the cached version.

How It Works:

1.	Template Hashing: Each template is hashed using BLAKE3 before rendering.
2.	Cache Check: Before rendering, Skye checks if the current template’s hash matches the cached hash. If unchanged, it skips re-rendering.
3.	Cache Update: If the template has changed, Skye updates the cache with the new hash and renders the template.


### Fine-Grained Reactivity

Skye’s reactivity system ensures that only the parts of the DOM affected by state changes are updated, minimizing unnecessary DOM manipulations.

How It Works:

-	Dependency Tracking: Each dynamic expression within the template is tracked and updated only when its corresponding state changes.
-	Selective Updates: Only the affected DOM elements are updated, enhancing performance, especially in large or frequently updated components.


### Handling Asynchronous Operations

Skye provides mechanisms to manage complex asynchronous operations efficiently, ensuring smooth application performance and responsiveness.

**effect.obtain**

Manages asynchronous operations with advanced options like caching, retries, pagination, and parallel processing.

Parameters:

	•	asyncOperation: A function that returns a promise (e.g., an API call).
	•	options: An object containing:
	•	cache: Enables caching of the result.
	•	paginate: Handles pagination for large datasets.
	•	maxCacheAge: Controls how long the cache is valid.
	•	retries: Number of retries if the operation fails.
	•	parallel: Enables running the operation in parallel using a worker pool.
	•	maxWorkers: Defines the number of workers for parallel execution.
	•	batch: Batches multiple async operations for efficiency.

Example Usage:
```ts
effect.obtain({
  async getData(
      cache: true,
      retries: 3,
      parallel: true,
      maxWorkers: 4,
    ) {
    const data = await fetch('https://api.example.com/data');
    const res = await data.json();
    return res;
   }
})
```

**TODO - ONGOING**

## Observables



1. Introduction to Observables in Skye

  Observables are a cornerstone of reactive programming, allowing your application to handle asynchronous data streams efficiently. In Skye, observables provide a simple yet powerful mechanism to emit data over time, subscribe to these emissions, and apply transformations or filters as needed.

  Key Benefits:

	  •	Simplicity: Easy to understand and use without the overhead of complex libraries.
	  • Composable: Combine multiple observables seamlessly.
	  •	Reactive: Automatically respond to data changes, enhancing interactivity.

2. Core Observable Functionalities

 a. Creating Observables

Use the create method to initialize a new observable. This method returns a unique symbol that identifies the observable.
```ts
// Create a new observable for user data
const userDataObservable = effects.observables.create();

// Create a new observable for notifications
const notificationsObservable = effects.observables.create();
```
 b. Subscribing to Observables

Subscribe to an observable to listen for data emissions. The subscribe method returns an unsubscribe function to stop listening when needed.
```ts
// Subscribe to user data observable
const unsubscribeUser = effects.observables.subscribe(userDataObservable, (data) => {
  console.log('User Data Received:', data);
});

// Subscribe to notifications observable
const unsubscribeNotification = effects.observables.subscribe(notificationsObservable, (message) => {
  console.log('New Notification:', message);
});
```

 c. Emitting Data

Emit data to all subscribers of a specific observable using the emit method.
```ts
// Emit user data
effects.observables.emit(userDataObservable, { id: 'u123', name: 'Alice', email: 'alice@example.com' });
```

// Emit a notification message
```ts
effects.observables.emit(notificationsObservable, 'You have a new message!');
```

 d. Unsubscribing
Use the unsubscribe function returned by the subscribe method to stop listening to an observable.
```ts
// Unsubscribe from user data observable
unsubscribeUser();
```

// Unsubscribe from notifications observable
```ts
unsubscribeNotification();
```
 e. Completing Observables

Complete an observable to remove all subscribers and prevent further emissions.
```ts
// Complete the user data observable
effects.observables.complete(userDataObservable);

// Complete the notifications observable
effects.observables.complete(notificationsObservable);
```


1. Enhancing Observables with Operators

Skye provides a few essential operators for observables: map, filter, and debounce. These operators allow you to transform and control the flow of data within observables.

  - a. Map Operator

Transforms each emitted value using a projection function.

```ts
// Create a 'data' observable
const dataObservable = effects.observables.create();

// Create a mapped observable that extracts the user's name
const userNameObservable = effects.observables.map(dataObservable, (data) => data.name);

// Subscribe to the mapped observable
effects.observables.subscribe(userNameObservable, (name) => {
  console.log('User Name:', name);
});

// Emit data
effects.observables.emit(dataObservable, { id: 'u123', name: 'Alice', email: 'alice@example.com' });
// Output: User Name: Alice
```

b. Filter Operator

Filters emitted values based on a predicate function.

```ts
// Create a 'notifications' observable
const notificationsObservable = effects.observables.create();

// Create a filtered observable for messages containing 'urgent'
const urgentNotifications = effects.observables.filter(notificationsObservable, (message) => message.includes('urgent'));

// Subscribe to the filtered observable
effects.observables.subscribe(urgentNotifications, (message) => {
  console.log('Urgent Notification:', message);
});

// Emit notifications
effects.observables.emit(notificationsObservable, 'You have a new message.');
effects.observables.emit(notificationsObservable, 'Urgent: Server downtime at midnight.');
// Output:
// Urgent Notification: Urgent: Server downtime at midnight.
```

 c. Debounce Operator

Delays emissions until a specified duration has passed without a new emission, useful for handling rapid, successive data points.

```ts
// Create a 'search' observable
const searchObservable = effects.observables.create();

// Create a debounced observable with a 300ms delay
const debouncedSearch = effects.observables.debounce(searchObservable, 300);

// Subscribe to the debounced observable
effects.observables.subscribe(debouncedSearch, (query) => {
  console.log('Search Query:', query);
});

// Emit search queries rapidly
effects.observables.emit(searchObservable, 'A');
effects.observables.emit(searchObservable, 'Ap');
effects.observables.emit(searchObservable, 'App');
effects.observables.emit(searchObservable, 'Appl');
effects.observables.emit(searchObservable, 'Apple');
// Only 'Apple' will be logged after 300ms of inactivity
// Output after 300ms:
// Search Query: Apple
```

## State

### Introduction

Skye’s State Management system is designed to handle both client-side and server-side states efficiently. By centralizing state control on the server, Skye enhances security, scalability, and data integrity, while providing a reactive and intuitive interface for developers.

The State class provides a centralized, reactive state management system with the following features:

	•	Global Reactive State: Centralized state accessible throughout the application.
	•	Selective Subscriptions: Components can subscribe to specific state slices.
	•	Real-Time Reactivity: Utilize WebSockets for instant state synchronization between server and clients.
	•	Derived State with Operators: Supports map, filter, and debounce operators for derived data.
	•	Middleware Support: Allows intercepting and processing state mutations.
	•	Persistence: Automatically saves and loads state.
	•	Automatic UI Updates: Integrates seamlessly with Skye’s reactivity system for automatic UI rendering upon state changes.
	•	Centralized State Store: Manage application state on the server for enhanced security and persistence.
	•	Namespacing: Organized method namespaces for clarity and to prevent naming collisions.
	•	Minimal Boilerplate: Simple and intuitive API reduces development overhead.



### Architecture Overview

Skye’s State Management comprises two primary components:

	1.	Server-Side StateStore: Manages the global application state, handles subscriptions, applies middleware, and persists data.
	2.	Client-Side StateManager: Connects to the server via WebSockets, subscribes to state changes, and provides an API for components to interact with the state.

This architecture ensures that state is securely managed on the server while providing reactive and efficient updates to connected clients.

#### Server-Side State Management

Centralizing state on the server enhances security and allows for persistent state across user sessions.

#### StateStore Class

The StateStore class manages the global state, handles subscriptions, applies middleware, and interacts with the dedicated data layer for optional persistence.

#### Middleware Integration

Middleware functions allow you to intercept and process state mutations for purposes like authentication, validation, and logging.


#### Client-Side State Management

On the client side, Skye provides a StateManager class that connects to the server via WebSockets, allowing components to interact with the global state seamlessly.

##### Integrating with Components

Components can utilize the StateManager to interact with the global state seamlessly.

### Advanced Features

#### Derived State

Derived state allows you to compute values based on the existing state without storing redundant data.

#### Persistence

Skye’s State Management system automatically persists state changes to the selected in memory or disk database, ensuring data durability across server restarts and user sessions.

	•	Automatic Saving: Every state mutation triggers a save operation.
	•	Automatic Loading: Upon server startup, the state is loaded, restoring the application’s state.

#### Middleware Support

Middleware functions enable you to intercept and process state mutations for purposes like authentication, validation, and logging.


### API Reference

#### StateManager

Description:
StateManager is a client-side class that manages the connection to the server-side state store via WebSockets. It provides methods to get, set, and subscribe to state changes.

##### Methods:

- get(key: string | symbol): any
Retrieves the value associated with the specified state key.
-	set(key: string | symbol, value: any): void
Sets the value for the specified state key and sends the update to the server.
-	subscribe(key: string | symbol, callback: Function): Function
Subscribes to changes of a specific state key. Returns an unsubscribe function.

##### Usage Example:
```ts
import { stateManager } from './core/StateManager.js';

// Get current user
const user = stateManager.get('user');

// Set user data
stateManager.set('user', { id: 'u123', name: 'Alice', email: 'alice@example.com' });

// Subscribe to user changes
const unsubscribe = stateManager.subscribe('user', (newUser) => {
  console.log('User updated:', newUser);
});

// To unsubscribe
unsubscribe();
```


#### StateStore

##### Description:
StateStore is a server-side class that manages the global application state. It handles state mutations, applies middleware, persists data to Redis, and notifies subscribers of state changes.

##### Methods:

-	use(middleware: Function): void
Adds a middleware function to process state mutations.
-	setState(key: string, value: any): Promise<void>
Sets the value for the specified state key, applies middleware, saves to Redis, and notifies subscribers.
-	getAllState(): Object
Retrieves the entire state object.
-	subscribe(callback: Function): Function
Subscribes to all state changes. Returns an unsubscribe function.

##### Usage Example:
```ts
const { StateStore } = require('./StateStore.js');
const { loggerMiddleware } = require('./middleware/logger.js');

const stateStore = new StateStore();

// Use logging middleware
stateStore.use(loggerMiddleware);

// Set user data
stateStore.setState('user', { id: 'u123', name: 'Alice', email: 'alice@example.com' });

// Subscribe to state changes
const unsubscribe = stateStore.subscribe((key, value) => {
  console.log(`State changed - ${key}:`, value);
});

// To unsubscribe
unsubscribe();
```