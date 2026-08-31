import {
  __objRest,
  __spreadProps,
  __spreadValues
} from "../../chunk-FWCSY2DS.mjs";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { LoadingIcon } from "../loading-icon/index.mjs";
import { cn } from "../../utils/index.mjs";
const getBaseClassName = (app, variant) => {
  if (variant === "destructive") {
    return "bg-system-red hover:bg-[#BF0A00] active:bg-system-red";
  }
  if (variant === "burn") {
    return "bg-red-0 text-red-main hover:bg-red-1 active:bg-red-0";
  }
  if (variant === "positive") {
    return "bg-system-green hover:bg-[#2B8F00] active:bg-system-green";
  }
  if (variant === "light") {
    return "bg-paper-main text-surface-ink border-surface-ink hover:bg-paper-2 active:bg-paper-main";
  }
  if (app === "fund") {
    if (variant === "primary") {
      return "bg-core-orange hover:bg-orange-1 active:bg-core-orange";
    }
    return "bg-[#FBDED1] text-core-orange hover:bg-[#FFF1EA] active:bg-[#FBDED1]";
  }
  if (app === "stacks") {
    if (variant === "primary") {
      return "bg-primary-blue hover:bg-blue-2 active:bg-primary-blue";
    }
    return "bg-[#B9D5FF] text-primary-blue hover:bg-[#99C2FF] active:bg-[#B9D5FF]";
  }
  if (variant === "primary") {
    return "bg-primary-jade hover:bg-jade-2 active:bg-primary-jade";
  }
  return "bg-[#CBE9E5] text-primary-jade hover:bg-[#BCD9D5] active:bg-[#CBE9E5]";
};
const Button = (_a) => {
  var _b = _a, {
    as,
    app = "fund",
    size,
    variant = "primary",
    rightIcon,
    leftIcon,
    children,
    disabled,
    className,
    isLoading,
    showChildrenWhenLoading,
    withBorder
  } = _b, rest = __objRest(_b, [
    "as",
    "app",
    "size",
    "variant",
    "rightIcon",
    "leftIcon",
    "children",
    "disabled",
    "className",
    "isLoading",
    "showChildrenWhenLoading",
    "withBorder"
  ]);
  const Component = as != null ? as : "button";
  return /* @__PURE__ */ jsxs(
    Component,
    __spreadProps(__spreadValues({}, rest), {
      className: cn(
        "text-paper-main",
        "href" in rest ? "cursor-pointer" : "",
        getBaseClassName(app, variant),
        "flex items-center justify-center gap-2 active:shadow-[0px_0px_0px_0px_#595959] disabled:shadow-none disabled:bg-surface-grey disabled:cursor-not-allowed",
        "transition-all duration-200 border disabled:border-transparent",
        variant !== "light" && withBorder && "border-surface-ink",
        variant !== "light" && !withBorder && "border-transparent",
        size === "icon" ? "p-2.5" : size === "sm" ? "py-1 px-4" : "py-4 px-8",
        size === "sm" ? "shadow-[0.125rem_0.125rem_0px_0px_#595959] active:translate-x-0.5 active:translate-y-0.5" : "shadow-[0.25rem_0.25rem_0px_0px_#595959] active:translate-x-1 active:translate-y-1",
        className
      ),
      disabled: disabled || isLoading,
      children: [
        (!isLoading || isLoading && showChildrenWhenLoading) && /* @__PURE__ */ jsxs(Fragment, { children: [
          leftIcon,
          children,
          rightIcon
        ] }),
        isLoading && /* @__PURE__ */ jsx(LoadingIcon, { app })
      ]
    })
  );
};
var button_default = Button;
export {
  button_default as default
};
