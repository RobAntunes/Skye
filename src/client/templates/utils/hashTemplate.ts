export async function hashTemplate(template: string): Promise<string> {
  const response = await fetch("http://localhost:8000/api/hash", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ template }),
  });

  const res = await response.json();

  if (response.ok) {
    return res.data;
  } else {
    throw new Error(`Hashing failed: ${res.error}`);
  }
}