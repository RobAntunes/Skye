## Skye: A Modern Full-Stack JavaScript Framework

Skye is a new full-stack JavaScript framework designed for building high-performance, scalable web applications. It prioritizes developer experience, ease of use, and automated testing.

**Key Features:**

* **AI-Powered Automated Testing:** Eliminate manual testing with AI-generated test cases. Skye analyzes your components and state interactions to create comprehensive tests, saving you time and effort. (This feature can be accessed via a paid API or by integrating with other AI testing providers.)
* **WASM-First, Component-Based Reactivity:**  Experience blazing-fast performance with a WASM-powered reactivity engine (planned for post-MVP). Components update independently in response to state changes, eliminating the need for a virtual DOM and reducing unnecessary re-renders.
* **Two-Way Data Binding:** Simplify state management with intuitive two-way data binding. Components directly reflect changes in the underlying data, making your code cleaner and easier to reason about.
* **Modular Architecture:** Skye is highly modular, allowing you to use only the features you need. Choose from a variety of modules for routing, API integration, server-side rendering, and more.
* **Simple Reactivity:** Enjoy a simple and elegant reactivity system. Reassign state values directly without the need for complex setter functions.
* **Separation of Concerns:** Write maintainable code with a clear separation of concerns. Skye provides tooling to easily navigate between component logic, styles, and templates.
* **Custom Templating Language:** Leverage a custom templating language designed to seamlessly integrate with Skye's reactivity system.
* **TypeScript First:** Benefit from type safety and improved code readability with TypeScript.
* **Full-Stack Capabilities:** Build complete web applications with server-side rendering (SSR) and API integration modules.

**Getting Started:**

```typescript
import { reactive, effect } from "skye";

const state = reactive<{ count: number, name: string }>({ 
  count: 0, 
  name: "Skye" 
});

effect({
  console.log("Count:", state.count); 
  console.log("Name:", state.name);   
});
```

# Skye's Reactivity Engine

Skye features a powerful and efficient reactivity system that allows you to build dynamic and responsive applications. It automatically tracks dependencies between your data and your code, ensuring that your application stays in sync with any changes in the underlying state.

## Core Concepts

- **Reactive Objects:**  Objects created using `reactive()` become reactive. Any changes to their properties will trigger updates in the parts of your application that depend on those properties.

- **Effects:** Effects are functions that are automatically re-executed whenever their dependencies change. They are defined using the `effect()` function.

- **Dependency Tracking:** The reactivity system automatically tracks which reactive properties are accessed within an effect. When those properties change, the effect is re-executed.

## API

### `reactive(target)`

Creates a reactive proxy around the given `target` object.

**Parameters:**

- `target`: The object to be made reactive.

**Returns:**

- A reactive proxy of the `target` object.

**Example:**

```typescript
import { reactive } from 'Skyejs';

const state = reactive({ count: 0 });

state.count++; // This will trigger any effects that depend on 'count'

// Defines and runs one or more effects.
effect(effects)

// Parameters:

// effects: An object where the keys are arbitrary names and the values are effect functions.

// Example:

import { reactive, effect } from 'Skyejs';

const state = reactive({ count: 0 });

effect({
  log() {
    console.log("Count:", state.count);
  }
});

state.count++

// Manually triggers a re-render of the application. This can be useful for handling asynchronous effects or forcing updates.
rerender()

// Example:

import { rerender } from 'Skyejs';

// ... some asynchronous operation that updates the state ...

rerender(); // Trigger a re-render to reflect the changes
```
## Advanced Usage
- **Nested Objects**: The reactivity system automatically handles nested objects. Changes to properties within nested objects will trigger updates in the dependent effects.

- **Arrays**:  Changes to arrays (adding, removing, or modifying elements) will also trigger updates.

- **Asynchronous Effects**:  Effects can perform asynchronous operations. The rerender() function can be used to manually trigger updates after an asynchronous operation completes.

## Benefits
- **Simplified State Management**: The reactivity system automatically handles dependency tracking and updates, reducing the complexity of managing application state.

- **Improved Performance**:  Fine-grained reactivity ensures that only the necessary parts of the application are updated when the state changes, improving performance.

- **Enhanced Developer Experience**: The intuitive API and automatic dependency tracking make it easier to build dynamic and responsive applications.

**Suspended Functions**
Skye rerenders & updates state in real time and picks up where the state change left off so that you get instant updates without needing to batch, giving you complete control and easy reasoning about your components.

**Recall the `runEffect` function**

```typescript
function runEffect(effect: EffectFn): void {
  try {
    activeEffect = effect;
    effect();
  } catch (error) {
    if (error instanceof Promise) {
      suspendedEffects.push({ fn: effect, target: null!, prop: null! });
      error.then(() => {
        const index = suspendedEffects.findIndex(e => e.fn === effect);
        if (index !== -1) {
          suspendedEffects.splice(index, 1);
        }
        runEffect(effect);
      });
    } else {
      console.error("Effect error:", error);
    }
  } finally {
    activeEffect = null;
  }
}
```

## Advanced Reactivity Tuning

Skye provides fine-grained control over how reactivity and effects are handled, allowing you to optimize performance, control execution order, and manage state updates more efficiently.

### Core Reactivity Hooks

#### priority(order, fn)

Executes effects in a defined order of priority. Higher priority effects run before lower priority ones.

```typescript
priority(1, () => {
  effect(() => {
    console.log("High priority effect");
  });
});
```

#### debounce(delay, fn)

Ensures the effect is delayed and only executed after the specified delay has passed without further state changes.

```typescript
debounce(300, () => {
  effect(() => {
    console.log("Debounced effect");
  });
});
```

#### throttle(interval, fn)

Limits how frequently an effect can run, ensuring it only executes at most once during the specified interval.

```typescript
throttle(1000, () => {
  effect(() => {
    console.log("Throttled effect");
  });
});
```

#### batch(fn)

Groups multiple state updates or effects together, ensuring they are executed simultaneously to avoid unnecessary re-renders.

```typescript
batch(() => {
  effect(() => {
    console.log("Batched effect");
  });
});
```

#### lazy(fn)

Defers effect execution until explicitly triggered.

```typescript
lazy(() => {
  effect(() => {
    console.log("Lazy effect, only triggered when needed");
  });
});
```

#### pause(fn) and resume(fn)

Gives control over when an effect is paused and resumed, allowing effects to be deferred during heavy computations.

```typescript
pause(() => {
  effect(() => {
    console.log("Effect is paused");
  });
});

resume(() => {
  effect(() => {
    console.log("Effect resumed");
  });
});
```

#### limit(times, fn)

Restricts how many times an effect can run.

```typescript
limit(3, () => {
  effect(() => {
    console.log("This effect will only run 3 times");
  });
});
```

### Worker Pool for Parallel Processing

Skye introduces a worker pool for parallel execution, allowing you to offload heavy computations or async tasks into background workers, improving performance without blocking the main thread.

#### Creating a Worker Pool

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

#### Using parallel to Run Tasks in Parallel

Skye provides a parallel function to run effects in parallel using the worker pool.

```typescript
parallel(() => {
  effect(() => {
    // Heavy computation that runs in parallel
    console.log("Running in parallel");
  });
}, { maxWorkers: 4 });
```

Handling Asynchronous Operations: effect.obtain

Skye introduces the obtain function to manage complex asynchronous operations with options like caching, retries, pagination, and parallel processing.

obtain API

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

```typescript
effect.obtain(async () => {
  const data = await fetch('https://api.example.com/data').then(res => res.json());
  return data;
}, {
  cache: true,
  retries: 3,
  parallel: true,
  maxWorkers: 4,
});
```


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

## Conclusion

The Skye Server provides a powerful and flexible foundation for building modern web applications. By leveraging its advanced features like middleware, routing, and server-side reactivity, you can create scalable and efficient server-side applications that integrate seamlessly with the Skye framework.

Skye provides an advanced reactivity system, powerful async operation handling, and parallel execution features through worker pools. By combining these tools, Skye ensures high performance and scalability in modern web applications while giving developers full control over how their applications behave.

## TODO: ONGOING
