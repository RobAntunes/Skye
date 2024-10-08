// src/client/functions/utils/randomUUID.ts
function randomUUID() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
}
export {
  randomUUID
};
//# sourceMappingURL=randomUUID.js.map
