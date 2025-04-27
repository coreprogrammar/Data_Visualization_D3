
// homeAssets/themeToggle.js

function toggleTheme() {
    document.body.classList.toggle("light-mode");
    const theme = document.body.classList.contains("light-mode") ? "light" : "dark";
    localStorage.setItem("theme", theme);
  
    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
      btn.innerHTML = theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode";
    }
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
  
    if (savedTheme === "light") {
      document.body.classList.add("light-mode");
    }
  
    const btn = document.getElementById("themeToggleBtn");
    if (btn) {
      btn.innerHTML = document.body.classList.contains("light-mode")
        ? "🌙 Dark Mode"
        : "☀️ Light Mode";
    }
  });
  