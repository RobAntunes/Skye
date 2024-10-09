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
<<<<<<< HEAD
    console.log("Count:", state.count);
    console.log("Name:", state.name);
  }
=======
        console.log("Count:", state.count);
        console.log("Name:", state.name);
    }
>>>>>>> 5ce7c2686487e600b6abe0b27528c6dfcf2ac66c
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

<<<<<<< HEAD
**TODO - ONGOING**
=======
## Skye: Hybrid Responsiveness and Utility Components

Skye provides a hybrid responsiveness solution, allowing you to build responsive components effortlessly, with flexibility to customize or opt out when needed. This system combines CSS variables, viewport-based sizing, Flexbox/Grid layouts, and utility classes, giving developers full control over responsiveness.

### Key Features:

- Opt-in Responsiveness: Skye’s components are responsive by default, but developers can easily opt-out or customize the behavior.
- Custom Utility Components: Pre-built, extensible components like SkyeGrid and SkyeSpacing provide common responsive patterns that can be used directly in templates.
- Easy Customization: Developers can extend the provided utility components or create new ones using JavaScript, giving them more flexibility than pure CSS solutions.
- Viewport-Based Sizing: Automatically adjust layouts, padding, margins, and font sizes based on the viewport, ensuring fluid scaling across devices.

### Opt-in/Opt-out Responsiveness

By default, Skye components are responsive. If you wish to disable this behavior, simply pass responsive = false when extending SkyeResponsiveComponent.

Example: Opting Out of Responsiveness

```typescript
class MyComponent extends SkyeResponsiveComponent {
  constructor() {
    super({}, false); // Opt out of responsiveness
  }

  template(): string {
    return `<p>This component is not responsive by default.</p>`;
  }
}

customElements.define('my-component', MyComponent);
```

## Responsive Utility Components

Skye includes a set of responsive utility components that make it easy to handle layouts, spacing, and other common patterns.

### SkyeGrid

<skye-grid> is a responsive grid container that automatically adjusts the number of columns based on screen size.

Usage:

```html
<skye-grid>
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</skye-grid>
```

By default:

	•	Mobile (below 768px): One column
	•	Tablet (768px - 1024px): Two columns
	•	Desktop (1024px and above): Three columns

You can extend the grid component to define custom column layouts.

### SkyeSpacing

```html
<skye-spacing> is a responsive spacing container that adjusts padding based on screen size.
```

Usage:

´´´html
<skye-spacing>
  <p>This content has responsive padding based on the viewport size.</p>
</skye-spacing>
```

By default:

	•	Mobile (below 768px): Small padding
	•	Tablet (768px - 1024px): Medium padding
	•	Desktop (1024px and above): Large padding

### Extending Utility Components

You can easily extend the utility components to customize their behavior:

Example: Custom SkyeGrid

```typescript
class CustomGrid extends SkyeGrid {
  handleResize() {
    // Custom column layouts
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

customElements.define('custom-grid', CustomGrid);
```

### Viewport-Based Sizing and CSS Variables

Skye uses global CSS variables to automatically scale layouts, padding, and font sizes based on the viewport. These variables can be overridden or customized:

```css
:root {
  --font-size-sm: calc(1vw + 0.5em);
  --font-size-md: calc(1.5vw + 0.75em);
  --font-size-lg: calc(2vw + 1em);
  
  --padding-sm: calc(1vw + 5px);
  --padding-md: calc(1.5vw + 10px);
  --padding-lg: calc(2vw + 15px);
  
  --container-width-sm: 90vw;
  --container-width-md: 80vw;
  --container-width-lg: 70vw;
}
```

By default, these variables are applied to components like <skye-grid> and <skye-spacing>. You can override them globally or on a per-component basis to customize behavior.

Skye’s hybrid responsiveness system gives you the flexibility to create responsive layouts without needing to manage breakpoints or write custom media queries. Using the provided utility components, you can easily extend and customize responsive behavior using JavaScript, offering more flexibility than traditional CSS utility classes.

## Skye: Functional Components and Web Component Abstraction

Skye introduces a powerful abstraction layer above native web components, enabling developers to define functional components that boil down to web components behind the scenes. This offers a simpler API for defining components while leveraging the power and efficiency of native web components for performance and compatibility.

### Functional Components in Skye

Functional components in Skye allow developers to define their UI declaratively using JavaScript. These components are lightweight and reactive, automatically updating when state changes occur. Under the hood, Skye transforms these functional components into native web components.

### Key Features

- Declarative UI: Define your UI with simple, functional components that are easy to reason about.
- Native Web Components: Skye compiles your functional components into efficient web components for native browser support.
- Automatic Reactivity: Skye’s reactivity engine ensures your components update automatically when state changes.
- Responsiveness and Accessibility: Skye components are responsive and accessible by default, with easy customization options.
- Automatic Cleanup: Skye automatically handles cleanup of effects and state when components are unmounted, so developers don’t need to manage unmounting.

### Defining Functional Components

A functional component in Skye is defined as a simple function that returns a UI structure. Skye automatically handles the lifecycle, rendering, and reactivity of the component.

Example: Simple Functional Component

```typescript
import { SFC, effect } from 'skye';

function MyComponent() {
  const state = reactive({ count: 0 });

  effect({
   doSomething() {
      console.log('Component mounted or state updated.');
    }
  });

  return (
    <div>
      <h1>Count: {state.count}</h1>
      <button onclick={() => state.count++}>Increment</button>
    </div>
  );
} 

export default functionalComponent(MyComponent);
```

### Key Features:

- Automatic Rendering: The MyComponent functional component will automatically rerender when state.count is updated.
-	Simplified API: You don’t need to manage the lifecycle or manually handle rendering. Skye handles it behind the scenes.
- Web Component Integration: This functional component is transformed into a native web component under the hood, ensuring compatibility and performance.
- Automatic Cleanup: Effects inside the component, such as the effect() hook, are cleaned up automatically when the component is removed from the DOM.

### Functional Components with effect

The effect() function in Skye automatically handles side effects, such as data fetching or event listeners, when the component is mounted or updated. Since Skye automatically cleans up effects, there is no need for an explicit onUnmount.

Example: Fetching Data with effect

```typescript
import { SFC, effect } from 'skye';

function FetchDataComponent() {
  const state = reactive({ data: null });

  effect.obtain({
    getData() {
      fetch('/api/data')
      .then(response => response.json())
      .then(data => state.data = data);
    // Cleanup (like removing listeners or aborting requests) happens automatically when the component is removed
    }
  });

  return (
    <div>
      {state.data ? (
        <p>Data: {state.data}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default functionalComponent(FetchDataComponent);
```

effect Hook:

	•	Runs on Mount: Automatically handles side effects when the component is first rendered or when the state changes.
	•	Automatic Cleanup: Cleanup for effects is managed by Skye, so developers don’t need to manually handle it.

### Responsive and Accessible Functional Components

As with all Skye components, functional components are responsive and accessible by default. You can opt out of or extend the default behavior as needed.

Example: Responsive Functional Component

```typescript
import { functionalComponent } from 'skye';

function ResponsiveComponent() {
  return (
    <div class="responsive-container">
      <p>This component is responsive by default.</p>
    </div>
  );
}

export default functionalComponent(ResponsiveComponent);
```

In this example, the component will adjust its layout based on the screen size, utilizing the hybrid responsiveness solution provided by Skye.

### Skye Utility Components: Extending Functional Components

Skye also provides a set of utility components that can be used inside templates or functional components to handle common responsive and layout patterns. These components can be extended and customized using JavaScript, allowing developers to tailor them to their needs.

Example: SkyeGrid in a Functional Component

```typescript
import { functionalComponent } from 'skye';
import { SkyeGrid } from './components/utilities/SkyeGrid';

function CardLayout() {
  return (
    <SkyeGrid>
      <div class="card">Card 1</div>
      <div class="card">Card 2</div>
      <div class="card">Card 3</div>
    </SkyeGrid>
  );
}

export default functionalComponent(CardLayout);
```
Here, the SkyeGrid utility component is used inside a functional component to provide a responsive grid layout.

### Extending Utility Components

Developers can extend and customize Skye’s utility components. This makes it easy to reuse and adapt components like grids, spacing containers, and more, all while benefiting from Skye’s responsiveness and reactivity.

Example: Extending a Utility Component

```typescript
import { SkyeGrid } from './components/utilities/SkyeGrid';

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

customElements.define('custom-grid', CustomGrid);
```


## Rendering Engine with Caching, Reactivity, and Optimizations

### Template Caching and Hashing

In Skye, templates are cached to prevent unnecessary re-rendering, improving overall performance. We use a fast hashing algorithm (BLAKE3) to compare the current template with the cached version.

How It Works:

- Template Hashing: Each template is hashed using BLAKE3 before rendering.
- Cache Check: Before rendering, Skye checks if the current template’s hash matches the cached hash. If the template hasn’t changed, it skips re-rendering.
- Cache Update: If the template has changed, Skye updates the cache with the new hash and renders the template.

Example:

```typescript
async function hashTemplate(template: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(template);
  const res = await crypto.subtle.digest("BLAKE3", data);
  return byteArrayToHexString(res);
}

const templateCache = new Map<string, { hash: string, renderFunction: Function }>();

export async function renderTemplate(template: string, state: Record<string, any>, element: HTMLElement) {
  const templateHash = await hashTemplate(template);

  const cachedTemplate = templateCache.get(template);
  if (cachedTemplate && cachedTemplate.hash === templateHash) {
    // Skip re-rendering if the template hasn’t changed
    return;
  }

  // Parse the template and update the cache
  const tokens = parseTemplate(template);
  const templateFunction = new Function(...Object.keys(state), `return \`${tokens.join('')}\`;`);
  templateCache.set(template, { hash: templateHash, renderFunction: templateFunction });

  const renderContent = templateFunction(...Object.values(state));
  element.innerHTML = renderContent;

  // Fine-grained reactivity ensures minimal DOM updates
  effect({
    update() {
      const updatedContent = templateFunction(...Object.values(state));
      if (element.innerHTML !== updatedContent) {
        element.innerHTML = updatedContent;
      }
    }
  });
}
```

### Fine-Grained Reactivity

Skye’s reactivity system ensures that only the parts of the DOM affected by state changes are updated, minimizing unnecessary DOM manipulations.

How It Works:

-	Each dynamic expression within the template is tracked and updated only when its corresponding state changes.
-	This approach ensures fine-grained updates to the DOM, significantly boosting performance in large or frequently updated components.

Example:

```typescript
const dependencies = new Map<string, Function>();

function renderTemplateWithReactivity(template: string, state: Record<string, any>, element: HTMLElement) {
  const tokens = parseTemplate(template);

  tokens.forEach((token, index) => {
    if (token.startsWith('{{') && token.endsWith('}}')) {
      const expression = token.slice(2, -2).trim();
      dependencies.set(expression, () => {
        const result = new Function(...Object.keys(state), `return ${expression};`)(...Object.values(state));
        if (element.children[index]) {
          element.children[index].textContent = result;
        }
      });
    }
  });

  tokens.forEach((token, index) => {
    if (!token.startsWith('{{')) {
      if (element.children[index]) {
        element.children[index].textContent = token;
      }
    } else {
      dependencies.get(token.slice(2, -2).trim())?.();
    }
  });

  effect({
    update: () => {
      dependencies.forEach(fn => fn());
    }
  });
}
```

### Arbitrary Javascript
Skye forgoes a formal templating language and instead gives you the full power of javascript inside html.
Use what you know without limitations, skye lets you interpolate variables, define variables and run functions, and interpolate the return value from arbitrarily complax expressions.

```typescript
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
    <p>{{ skye`${() => { 
      console.log("This is arbitrary JavaScript inside a template"); 
      return "This text is returned from the skye function";
    }}` }}</p>
    <p>{{ skye`Current time: ${new Date().toLocaleTimeString()}` }}</p>
    <script src="/public/app.js"></script>
  </body>
</html>
```

### Performance Optimizations

In addition to caching and reactivity, Skye introduces several other performance optimizations:

	1.	Memoized Expressions: Skye caches the results of expensive expressions, reducing redundant computations.
	2.	Debounced or Batched State Updates: Skye can group multiple state changes together, preventing frequent, costly re-renders during rapid state changes.

# Skye Server

The Skye Server is a powerful and flexible server implementation designed to work seamlessly with the Skye framework. It provides a robust foundation for building scalable and reactive web applications.

## Key Features

- **Advanced Routing**: Support for pattern matching and route parameters.
- **Flexible Middleware System**: Easy integration of custom middleware for various purposes.
- **Built-in Error Handling**: Graceful error management and informative error responses.
- **Logging**: Built-in request and response logging for debugging and monitoring.
- **Server-side Reactivity**: Novel approach to managing server-side state reactively while the request and response remain stateless.
- **TypeScript Support**: Fully typed for improved developer experience and code reliability.

## Basic Usage

```typescript
import { SkyeServer } from './skye-server';

const server = new SkyeServer();

// Add middleware
server.use(errorHandler);
server.use(logger);
server.use(jsonParser);

// Define routes
server.route("GET", "/api/users/:id", async (ctx) => {
  const userId = ctx.request.params.id;
  ctx.response.body = { userId, message: "User details" };
});

server.route("POST", "/api/users", async (ctx) => {
  const userData = ctx.request.body;
  ctx.response.body = { message: "User created", user: userData };
});

// Start the server
Deno.serve({ port: 8000 }, (req) => server.handleRequest(req));
```

## Core Concepts

### Context Object

The `Context` object is at the heart of the Skye's Server. It encapsulates all the information about the current request and response, and is passed through all middleware and route handlers. (Incomplete)

```typescript
interface Context {
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
```

### Middleware

Middleware functions in Skye Server have the following signature:

```typescript
type Middleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;
```

Middleware can perform operations before and after the next middleware or route handler is called. They can modify the `Context` object, handle errors, or perform any other necessary operations.

### Routing

The Skye Server supports flexible routing with pattern matching and route parameters. Routes are defined using the `route` method:

```typescript
server.route(method: string, path: string, handler: (ctx: Context) => Promise<void>)
```

Route parameters (e.g., `:id` in `/users/:id`) are automatically parsed and available in `ctx.request.params`.

### Server-side Reactivity

Skye Server introduces a novel concept of server-side reactivity. This allows you to maintain reactive state on the server, which can be useful for various purposes such as caching, real-time updates, or session management.

```typescript
const createReactiveMiddleware = () => {
  const state = reactive({
    connections: 0,
    lastAccess: new Date(),
  });

  return async (ctx: Context, next: () => Promise<void>) => {
    state.connections++;
    state.lastAccess = new Date();
    ctx.state.reactive = state;
    await next();
  };
};

server.use(createReactiveMiddleware());
```

This reactive state can be accessed and modified in your route handlers or other middleware.

The Skye Server provides a powerful and flexible foundation for building modern web applications. By leveraging its advanced features like middleware, routing, and server-side reactivity, you can create scalable and efficient server-side applications that integrate seamlessly with the Skye framework.

Skye provides an advanced reactivity system, powerful async operation handling, and parallel execution features through worker pools. By combining these tools, Skye ensures high performance and scalability in modern web applications while giving developers full control over how their applications behave.

## TODO: ONGOING
>>>>>>> 5ce7c2686487e600b6abe0b27528c6dfcf2ac66c
