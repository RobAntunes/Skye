import type { EventMap, EventCore, Listener } from "./EventsCore.ts";

export class ScopedEventEmitter<Scope, Events extends EventMap> {
    private scope: Scope;
    private eventSystem: EventCore<Events>;
  
    constructor(scope: Scope, eventSystem: EventCore<Events>) {
      this.scope = scope;
      this.eventSystem = eventSystem;
    }
  
    public emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
      console.log(`Event emitted from scope: ${this.scope}`);
      this.eventSystem.emit(event, ...args);
    }
  
    public on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
      this.eventSystem.on(event, listener);
    }
  
    public off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
      this.eventSystem.off(event, listener);
    }
  }