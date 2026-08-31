"use client";
import "../../chunk-FWCSY2DS.mjs";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import { LINKS } from "../../constansts/links.mjs";
import { appsConfig } from "../../utils/app.mjs";
import { Body, Caption } from "../typography/Typography.mjs";
const _apps = [
  {
    id: "fund",
    label: "Solidarity Fund",
    desc: "Give without giving",
    color: "text-[#EA5817]",
    comingSoon: false,
    webLink: LINKS.solidarityFund
  },
  {
    id: "stacks",
    label: "Stacks",
    desc: "Stack money together.",
    color: "text-[#1C5BB9]",
    comingSoon: false,
    webLink: LINKS.stacks
  },
  {
    id: "net",
    label: "Safety Net",
    desc: "Cover each other.",
    color: "text-[#286B63]",
    comingSoon: true
  }
];
const AppPageContent = ({
  app,
  selected,
  appConfig
}) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("span", { className: `mr-2 ${app.color}`, children: /* @__PURE__ */ jsx(AppSvg, {}) }),
    /* @__PURE__ */ jsxs("div", { className: "mr-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-start font-bold", children: [
        /* @__PURE__ */ jsx(Body, { children: app.label }),
        app.comingSoon && /* @__PURE__ */ jsx(Caption, { className: `text-xs ml-2 ${appConfig.text}`, children: "Coming soon" })
      ] }),
      /* @__PURE__ */ jsx(Body, { className: "font-light text-surface-grey-2", children: app.desc })
    ] }),
    selected && /* @__PURE__ */ jsx(Caption, { className: "font-bold text-system-green", children: "Selected" })
  ] });
};
const NavSolidarityApps = ({
  current = "stacks",
  className = "",
  showTitle,
  showSelected,
  rearranged
}) => {
  const apps = rearranged ? [..._apps].sort((a, b) => {
    if (a.id === current) return -1;
    if (b.id === current) return 1;
    return 0;
  }) : [..._apps];
  const appConfig = appsConfig[current];
  return /* @__PURE__ */ jsxs("section", { className, children: [
    showTitle && /* @__PURE__ */ jsx(Body, { className: "text-surface-grey mb-4", children: "Solidarity apps" }),
    /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-2", children: [...apps].map((app) => {
      const isLink = !app.comingSoon && app.webLink && current !== app.id;
      return /* @__PURE__ */ jsx(
        "li",
        {
          className: `${isLink ? "" : `flex items-center justify-start p-2.5 border ${current === app.id ? appConfig.border : "border-transparent"}`}`,
          children: isLink ? /* @__PURE__ */ jsx(
            "a",
            {
              href: app.webLink,
              className: "flex items-center justify-start p-2.5 border border-transparent",
              children: /* @__PURE__ */ jsx(
                AppPageContent,
                {
                  app,
                  selected: showSelected && current === app.id,
                  appConfig
                }
              )
            }
          ) : /* @__PURE__ */ jsx(
            AppPageContent,
            {
              app,
              selected: showSelected && current === app.id,
              appConfig
            }
          )
        },
        app.id
      );
    }) })
  ] });
};
const NavSolidarityAppsDesktop = ({
  label,
  app
}) => {
  const appConfig = appsConfig[app];
  return /* @__PURE__ */ jsxs(NavigationMenu.Root, { className: "hidden md:block md:mr-auto md:ml-2 relative", children: [
    /* @__PURE__ */ jsx(NavigationMenu.List, { children: /* @__PURE__ */ jsxs(NavigationMenu.Item, { children: [
      /* @__PURE__ */ jsx(NavigationMenu.Trigger, { className: "group", children: /* @__PURE__ */ jsxs(Body, { className: "md:text-surface-grey-2 md:inline-flex md:items-center md:justify-center md:gap-2 lg:text-2xl lg:mt-1", children: [
        /* @__PURE__ */ jsx("span", { className: "capitalize", children: label }),
        /* @__PURE__ */ jsx(
          "span",
          {
            className: `transition-transform duration-300 group-data-[state=open]:rotate-180 md:mt-[-0.0625rem] lg:-mt-1 ${appConfig.text}`,
            children: /* @__PURE__ */ jsx(Caret, {})
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(NavigationMenu.Content, { className: "w-80", children: /* @__PURE__ */ jsx("div", { className: "bg-paper-main border border-paper-2 overflow-hidden", children: /* @__PURE__ */ jsx(
        NavSolidarityApps,
        {
          current: app,
          className: "py-6 px-8"
        }
      ) }) })
    ] }) }),
    /* @__PURE__ */ jsx(NavigationMenu.Viewport, { className: "absolute left-0 top-full mt-2 z-50" })
  ] });
};
const AppSvg = () => /* @__PURE__ */ jsx(
  "svg",
  {
    width: "32",
    height: "32",
    viewBox: "0 0 32 32",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        d: "M16 0C24.8366 0 32 7.16335 32 16C32 24.8367 24.8366 32 16 32C7.16344 32 0 24.8367 0 16C4.9478e-05 7.16338 7.16347 4.22665e-05 16 0ZM19.7451 5.26758C16.7609 2.21844 11.5944 3.69932 11.2129 8.1084C10.7367 13.1418 7.08515 10.4095 4.37207 13.209C3.57018 14.1331 3.09185 15.4252 3.25195 16.6406C3.48647 18.3313 4.79986 19.7729 6.47461 20.1816C8.37936 20.6899 10.3536 20.4661 10.998 22.8066C11.3659 24.3564 11.24 25.7879 12.5215 26.9971C14.7593 29.1037 18.8138 28.8489 20.2656 26.001C20.7711 25.1101 20.8462 24.0581 21.0332 23.0723C21.2229 22.0263 21.8496 21.1879 22.834 20.8311C24.1704 20.3049 25.8365 20.3974 27.0664 19.5332C28.357 18.6609 29.0521 16.9949 28.8203 15.4639L28.8174 15.4482H28.8184C28.5649 13.7937 27.198 12.4124 25.6309 11.9238C24.7017 11.6137 23.6703 11.6362 22.7627 11.2588C21.9437 10.9468 21.3875 10.2654 21.1387 9.43262C20.7234 7.9545 20.9069 6.48575 19.7451 5.26758ZM15.3008 12.3789C18.4435 12.0374 20.5761 13.6659 20.0713 16.9531L20.0674 16.9697V16.9688C19.8051 18.4864 18.7559 19.4563 17.2539 19.6562C16.3436 19.7996 15.3079 19.7758 14.4111 19.5625C13.9216 19.4424 13.4732 19.2458 13.1143 18.959C11.872 17.921 11.6687 15.865 12.2539 14.3994C12.7551 13.1741 14.0057 12.5072 15.3008 12.3789Z",
        fill: "currentcolor"
      }
    )
  }
);
const Caret = () => /* @__PURE__ */ jsx(
  "svg",
  {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        d: "M19.5 9L12 16.5L4.5 9",
        stroke: "currentcolor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      }
    )
  }
);
export {
  NavSolidarityApps,
  NavSolidarityAppsDesktop
};
