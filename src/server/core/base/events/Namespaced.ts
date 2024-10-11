import { EventCore, type EventMap, type Listener } from "./EventsCore.ts";

export class Namespaced<Events extends EventMap> extends EventCore<Events> {
    private namespace: string;
  
    constructor(namespace: string) {
      super();
      this.namespace = namespace;
    }
  
    public override emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
      super.emit(`${this.namespace}:${String(event)}` as K, ...args);
    }
  
    public override on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
      super.on(`${this.namespace}:${String(event)}` as K, listener);
    }
  
    public override off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
      super.off(`${this.namespace}:${String(event)}` as K, listener);
    }
  }