// src/client/reactivity/effect.ts
var suspendedEffects = [];
function effect(fn) {
  const iterator = effectGenerator(fn);
  function run() {
    const result = iterator.next();
    if (!result.done) {
      suspendedEffects.push(run);
    }
  }
  run();
}
function triggerEffects() {
  const effectsToRun = [...suspendedEffects];
  suspendedEffects.length = 0;
  effectsToRun.forEach((effectFn) => effectFn());
}
export {
  effect,
  triggerEffects
};
//# sourceMappingURL=effect.js.map
