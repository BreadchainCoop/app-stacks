import "../../chunk-FWCSY2DS.mjs";
import { jsx, jsxs } from "react/jsx-runtime";
import { cn } from "../../utils/index.mjs";
function LoadingIcon({
  app,
  className
}) {
  return /* @__PURE__ */ jsx("div", { className: cn("relative w-8 h-8", className), children: /* @__PURE__ */ jsxs(
    "svg",
    {
      className: "w-full h-full transform -rotate-90",
      viewBox: "0 0 120 120",
      children: [
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: "60",
            cy: "60",
            r: "50",
            fill: "none",
            strokeWidth: "20",
            className: app === "fund" ? "stroke-orange-2" : app === "stacks" ? "stroke-[#B9D5FF]" : "stroke-[#CBE9E5]"
          }
        ),
        /* @__PURE__ */ jsx(
          "circle",
          {
            cx: "60",
            cy: "60",
            r: "50",
            fill: "none",
            strokeWidth: "20",
            strokeDasharray: "314",
            strokeDashoffset: "235",
            strokeLinecap: "round",
            className: cn(
              "origin-center animate-spin",
              app === "fund" ? "stroke-orange-0" : app === "stacks" ? "stroke-primary-blue" : "stroke-primary-jade"
            ),
            style: { animationDuration: "2s" }
          }
        )
      ]
    }
  ) });
}
export {
  LoadingIcon
};
