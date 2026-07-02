// The demo page imports package internals to render the SAME output the CLI
// writes to disk — the product itself is `npx varth …`, not this import.
import { defineThemes } from "../src/index";

const configSource = `import type { VarthConfig } from "var-th";

const config: VarthConfig = {
  themes: {
    // pencil on paper
    light: {
      accent: "#3d6fb4",
      accentText: "#ffffff",
      bg: "#fdfcf7",
      surface: "#ffffff",
      text: "#2b2b33",
      muted: "#6f6f7a",
      border: "#2b2b33",
      shadow: "4px 4px 0 rgb(43 43 51 / 0.16)",
      radius: "6px",
    },
    // chalk on board
    dark: {
      accent: "#7fa9e0",
      accentText: "#14202e",
      bg: "#212932",
      surface: "#28323d",
      text: "#e7ecf2",
      muted: "#9aa7b5",
      border: "#cfd8e3",
      shadow: "4px 4px 0 rgb(0 0 0 / 0.35)",
      radius: "6px",
    },
  },
  properties: "auto",
  ramps: { brand: { base: "#3d6fb4", steps: 10 } },
  out: { css: "varth.css", js: "varth.js" },
};

export default config;`;

// Must stay in sync with the snippet above — the page renders both.
const th = defineThemes({
  themes: {
    light: {
      accent: "#3d6fb4",
      accentText: "#ffffff",
      bg: "#fdfcf7",
      surface: "#ffffff",
      text: "#2b2b33",
      muted: "#6f6f7a",
      border: "#2b2b33",
      shadow: "4px 4px 0 rgb(43 43 51 / 0.16)",
      radius: "6px",
    },
    dark: {
      accent: "#7fa9e0",
      accentText: "#14202e",
      bg: "#212932",
      surface: "#28323d",
      text: "#e7ecf2",
      muted: "#9aa7b5",
      border: "#cfd8e3",
      shadow: "4px 4px 0 rgb(0 0 0 / 0.35)",
      radius: "6px",
    },
  },
  properties: "auto",
  ramps: { brand: { base: "#3d6fb4", steps: 10 } },
});

th.inject(); // CSS in + persisted theme re-applied, one call

// --- code panes -----------------------------------------------------------

document.getElementById("config-code")!.textContent = configSource;
document.getElementById("css-out")!.textContent = th.toCSS();

// --- theme switcher — typed core API, no framework -------------------------

const switcher = document.getElementById("switcher")!;

const syncActive = () => {
  const current = th.getTheme();
  for (const b of switcher.querySelectorAll("button"))
    b.classList.toggle("active", b.dataset.set === current);
};

switcher.addEventListener("click", (e) => {
  const mode = (e.target as HTMLElement).dataset.set as
    | "light"
    | "dark"
    | "system"
    | undefined;
  if (!mode) return;
  th.setTheme(mode); // applies data-theme + persists to localStorage
  syncActive();
});

syncActive();

// --- ramp ------------------------------------------------------------------

const ramp = document.getElementById("ramp")!;
for (let i = 1; i <= 10; i++) {
  const s = document.createElement("div");
  s.className = "swatch";
  s.style.background = `var(--th-brand-${i})`;
  s.innerHTML = `<span>${i}</span>`;
  ramp.appendChild(s);
}

const picker = document.getElementById("brand-picker") as HTMLInputElement;
const brandValue = document.getElementById("brand-value")!;
picker.addEventListener("input", () => {
  document.documentElement.style.setProperty("--th-brand", picker.value);
  brandValue.textContent = picker.value;
});
