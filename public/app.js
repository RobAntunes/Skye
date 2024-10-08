// public/app.js
document.addEventListener("DOMContentLoaded", () => {
  // Interactivity code
  const incrementButton = document.querySelector("#incrementButton");
  const countDisplay = document.querySelector("#countDisplay");

  if (incrementButton && countDisplay) {
    incrementButton.addEventListener("click", () => {
      // Implement client-side logic if needed
      alert("Button clicked!");
    });
  }
});