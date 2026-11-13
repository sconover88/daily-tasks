// Measures every text and control colour pairing the app renders.
// Run with: npm run contrast
// WCAG 2 contrast ratio and APCA Lc (0.0.98G-4g) are reported separately.

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

// WCAG 2 relative luminance and ratio
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminance = (h) => {
  const [r, g, b] = hex(h).map(lin);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const wcag = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (hi + 0.05) / (lo + 0.05);
};

// APCA 0.0.98G-4g
const screenY = (h) => {
  const [r, g, b] = hex(h).map((c) => c ** 2.4);
  return 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
};
const softClamp = (y) => (y > 0.022 ? y : y + (0.022 - y) ** 1.414);
const apca = (text, bg) => {
  const t = softClamp(screenY(text));
  const b = softClamp(screenY(bg));
  if (Math.abs(b - t) < 0.0005) return 0;
  let out;
  if (b > t) {
    const s = (b ** 0.56 - t ** 0.57) * 1.14;
    out = s < 0.1 ? 0 : s - 0.027;
  } else {
    const s = (b ** 0.65 - t ** 0.62) * 1.14;
    out = s > -0.1 ? 0 : s + 0.027;
  }
  return out * 100;
};

const text = [
  ["Primary text", "#141314", "Page ground", "#fcfcfd", "16px / 400"],
  ["Primary text", "#141314", "Surface", "#f4f3f4", "16px / 400"],
  ["Secondary text", "#454545", "Page ground", "#fcfcfd", "14px / 500"],
  ["Secondary text", "#454545", "Surface", "#f4f3f4", "16px / 400"],
  ["Muted text", "#5c5c5c", "Page ground", "#fcfcfd", "14px / 500"],
  ["Muted text", "#5c5c5c", "Surface", "#f4f3f4", "13px / 400"],
  ["Action label", "#fcfcfd", "Action fill", "#111113", "14–16px / 500"],
  ["Inverse text", "#fcfcfd", "Accent (Done today)", "#2563eb", "14px / 600"],
  ["Danger text", "#991b1b", "Page ground", "#fcfcfd", "14px / 500"],
  ["Danger text", "#991b1b", "Surface", "#f4f3f4", "13px / 600"],
  ["Inverse text", "#fcfcfd", "Danger fill", "#991b1b", "14px / 600"],
];

const nonText = [
  ["Control edge", "#858585", "Page ground", "#fcfcfd"],
  ["Control edge", "#858585", "Surface", "#f4f3f4"],
  ["Checked fill", "#111113", "Surface", "#f4f3f4"],
  ["Focus ring", "#141314", "Page ground", "#fcfcfd"],
  ["Focus ring", "#141314", "Surface", "#f4f3f4"],
];

console.log("Text pairings");
console.log("| Text | On | Size / weight | WCAG 2 | APCA |");
console.log("|---|---|---|---|---|");
for (const [n, f, bn, b, size] of text) {
  console.log(`| ${n} \`${f}\` | ${bn} \`${b}\` | ${size} | ${wcag(f, b).toFixed(2)}:1 | Lc ${apca(f, b).toFixed(1)} |`);
}
console.log("\nNon-text (WCAG 1.4.11 needs 3:1)");
console.log("| Element | On | WCAG 2 |");
console.log("|---|---|---|");
for (const [n, f, bn, b] of nonText) {
  console.log(`| ${n} \`${f}\` | ${bn} \`${b}\` | ${wcag(f, b).toFixed(2)}:1 |`);
}
