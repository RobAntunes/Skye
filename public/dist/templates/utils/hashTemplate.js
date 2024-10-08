// src/client/templates/utils/hashTemplate.ts
async function hashTemplate(template) {
  const response = await fetch("http://localhost:8000/api/hash", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ template })
  });
  const res = await response.json();
  if (response.ok) {
    return res.data;
  } else {
    throw new Error(`Hashing failed: ${res.error}`);
  }
}
export {
  hashTemplate
};
//# sourceMappingURL=hashTemplate.js.map
