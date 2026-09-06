/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        // Bread Coop brand colors
        "core-orange": "#EA5817",
        "primary-orange": "#ea6023",
        "orange-0": "#ffc080",
        "orange-1": "#d14a0f",
        "orange-2": "#b83c08",
        "primary-jade": "#286b63",
        "jade-0": "#9cacc6",
        "jade-1": "#72849d",
        "jade-2": "#134a44",
        "primary-blue": "#1c5bb9",
        "blue-0": "#a8c3ea",
        "blue-1": "#588ddb",
        "blue-2": "#1b4a90",
        "paper-main": "#f6f3eb",
        "paper-0": "#fdfcf9",
        "paper-1": "#f0ebe0",
        "paper-2": "#eae2d6",
        "surface-ink": "#1b201a",
        "surface-grey": "#808080",
        "surface-grey-2": "#595959",
        "surface-brown": "#513c35",
        "surface-brown-1": "#301f18",
        "system-green": "#32a800",
        "system-red": "#df0b00",
        "system-warning": "#ce7f00",
        "text-standard": "#171414",
        white: "#ffffff",
        black: "#000000",
      },
      fontFamily: {
        breadDisplay: [
          "var(--font-breadDisplay)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        breadBody: [
          "var(--font-breadBody)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        roboto: ["var(--font-roboto)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
