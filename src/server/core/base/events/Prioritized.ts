import { type Listener, type EventMap, EventCore } from "./EventsCore.ts";

interface PrioritizedEvent {
    listener: Listener<any>;
    priority: number;
  }
  
  export class PrioritizedEventBus<Events extends EventMap> extends EventCore<Events> {
    private prioritizedEvents: Map<keyof Events, PrioritizedEvent[]> = new Map();
  
    public onWithPriority<K extends keyof Events>(
      event: K,
      listener: Listener<Events[K]>,
      priority: number = 0
    ): void {
      if (!this.prioritizedEvents.has(event)) {
        this.prioritizedEvents.set(event, []);
      }
      this.prioritizedEvents.get(event)!.push({ listener, priority });
      this.prioritizedEvents.get(event)!.sort((a, b) => b.priority - a.priority); // Higher priority first
    }
  
    public override emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
      const prioritizedListeners = this.prioritizedEvents.get(event);
      if (prioritizedListeners) {
        prioritizedListeners.forEach(({ listener }) => {
          listener(...args);
        });
      } else {
        super.emit(event, ...args); // Fall back to normal emit
      }
    }
  }