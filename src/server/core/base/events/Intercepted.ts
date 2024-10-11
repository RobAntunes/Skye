import type { Listener } from "./EventsCore.ts";

type Events = {
  [key: string]: any;
};

export class Interceptor<K extends keyof Events> {
  private listeners: { [key in K]?: Listener<Events[key]>[] } = {};

  on<EventKey extends K>(
    event: EventKey,
    listener: Listener<Events[EventKey]>
  ) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]?.push(listener); // Store all listeners
  }

  trigger<EventKey extends K>(event: EventKey, value: Events[EventKey]) {
    this.listeners[event]?.forEach((listener) => listener(value)); // Trigger all listeners
  }
}
