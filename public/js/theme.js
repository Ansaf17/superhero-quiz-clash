const THEME_KEY = "damon_theme";

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.removeAttribute("data-theme");
  } else {
    document.body.setAttribute("data-theme", theme);
  }
}

function getSavedTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

document.addEventListener("DOMContentLoaded", () => {
  applyTheme(getSavedTheme());
});

window.DamonTheme = {
  getSavedTheme,
  setTheme,
  applyTheme
};