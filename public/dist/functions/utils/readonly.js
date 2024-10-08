// src/client/functions/utils/readonly.ts
function readonly(target) {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      return Reflect.get(obj, prop, receiver);
    },
    set(_obj, prop, _value) {
      throw new Error(`Cannot set property '${String(prop)}' on read-only state.`);
    },
    deleteProperty(_obj, prop) {
      throw new Error(`Cannot delete property '${String(prop)}' on read-only state.`);
    },
    defineProperty(_obj, prop, _descriptor) {
      throw new Error(`Cannot define property '${String(prop)}' on read-only state.`);
    },
    setPrototypeOf(_obj, _proto) {
      throw new Error(`Cannot set prototype on read-only state.`);
    }
  });
}
export {
  readonly
};
//# sourceMappingURL=readonly.js.map
