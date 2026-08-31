import "../chunk-FWCSY2DS.mjs";
import { LINKS } from "./links.mjs";
const SOLIDARITY_TOOLS = [
  {
    id: "solidarity-fund",
    title: "Solidarity Fund",
    shortDescription: "Give without giving",
    description: "Community coming together to fund what matters to us. Bake $BREAD and support projects you believe in.",
    color: "orange",
    buttonClass: "bg-primary-orange text-white",
    webLink: LINKS.solidarityFund,
    comingSoon: false
  },
  {
    id: "stacks",
    title: "Stacks",
    shortDescription: "Save money together.",
    description: "Financial goals. Achieved together.",
    color: "blue",
    buttonClass: "",
    colorOverrides: {
      bg: "--color-primary-blue",
      hoverBg: "--color-blue-2"
    },
    webLink: LINKS.stacks,
    comingSoon: false
  },
  {
    id: "safety-net",
    title: "Safety Net",
    shortDescription: "Cover each other.",
    description: "Collective support guides us through crisis. Build emergency funds with people you trust.",
    color: "jade",
    buttonClass: "",
    colorOverrides: {
      bg: "--color-primary-jade",
      hoverBg: "--color-jade-2"
    },
    comingSoon: true
  }
];
function getSolidarityToolsByIds(ids) {
  return SOLIDARITY_TOOLS.filter((tool) => ids.includes(tool.id));
}
function getVisibleSolidarityTools(hiddenIds = []) {
  return SOLIDARITY_TOOLS.filter((tool) => !hiddenIds.includes(tool.id));
}
export {
  SOLIDARITY_TOOLS,
  getSolidarityToolsByIds,
  getVisibleSolidarityTools
};
