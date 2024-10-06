# Tech Debt and Functionalities to Implement Later

## Reactivity Engine

- **Fine-grained dependency tracking**: Explore more granular dependency tracking (e.g., at the property level within objects) to further optimize updates.
- **Asynchronous handling improvements**: Enhance the obtain function with features like cancellation, concurrency control, and debouncing/throttling.
- **Computed properties**: Implement computed properties that automatically update based on their dependencies.
- **Lazy evaluation**: Optimize effects to only re-execute when their dependencies have actually changed.
- **Effect cleanup**: Allow effects to perform cleanup actions (e.g., unsubscribing from events) when they are no longer needed.
Component System

- **Lifecycle hooks**: Introduce lifecycle hooks (similar to mounted, updated, unmounted in Vue) to allow components to perform actions at specific points in their lifecycle.
- **Props and Events**: Implement a system for passing data (props) to components and handling events emitted by components.
- **Slots**: Add support for slots to enable content composition and flexibility within components.
- **Component Composition**: Explore different component composition patterns (e.g., higher-order components, mixins) to promote code reuse and modularity.

### Enhancements and Considerations

- **Other Async Patterns**:  We can extend this to handle other asynchronous patterns, such as async/await, callbacks, and Observables.

- **Error Handling**:  We can improve error handling by providing more informative error messages or allowing developers to define custom error handlers for suspended effects.

- **State Management**:  We can integrate suspended effects with a state management solution to provide a centralized way to track and manage the loading, error, and success states of asynchronous operations.

- **Optimization**:  We can optimize the rerender function to only re-render the parts of the application that are affected by the resolved suspended effects.

## Other Areas

- **Server-Side Rendering (SSR)**: Implement SSR to improve initial load times and SEO.
- **Routing**: Add a routing system to handle navigation between different views or sections of the application.
- **AI-Powered Testing**: Develop the AI-powered testing features, including test case generation, code analysis, and feedback mechanisms.
- **Tooling**: 
  
  Build comprehensive tooling to support the development workflow, including a CLI, build system integrations, and debugging tools.

	Performance: Consider adding an option for more fine-grained control over how often effects rerun (e.g., via a throttling or debouncing mechanism in the reactivity engine) to further optimize performance.
	•	Templating & SSR: For the templating language, explore extending syntax for SSR, possibly using templates that auto-optimize based on content length or complexity.