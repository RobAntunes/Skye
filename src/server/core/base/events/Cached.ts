import { EventCore, type EventMap, type Listener } from "./EventsCore.ts";

export class CachingEventBus<Events extends EventMap> extends EventCore<Events> {
    private eventCache: Map<keyof Events, Events[keyof Events]> = new Map();
  
    public override emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
      this.eventCache.set(event, args);
      super.emit(event, ...args);
    }
  
    public override on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
      super.on(event, listener);
      if (this.eventCache.has(event)) {
        listener(...(this.eventCache.get(event) as Events[K]));
      }
    }
  }