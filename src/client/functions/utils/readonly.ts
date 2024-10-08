export function readonly<T extends object>(target: T): T {
    return new Proxy(target, {
      get(obj, prop: PropertyKey, receiver) {
        // Directly return the property without tracking dependencies
        return Reflect.get(obj, prop, receiver);
      },
      set(_obj, prop: PropertyKey, _value: any) {
        throw new Error(`Cannot set property '${String(prop)}' on read-only state.`);
      },
      deleteProperty(_obj, prop: PropertyKey) {
        throw new Error(`Cannot delete property '${String(prop)}' on read-only state.`);
      },
      defineProperty(_obj, prop: PropertyKey, _descriptor: PropertyDescriptor) {
        throw new Error(`Cannot define property '${String(prop)}' on read-only state.`);
      },
      setPrototypeOf(_obj, _proto: object | null) {
        throw new Error(`Cannot set prototype on read-only state.`);
      },
    });
  }