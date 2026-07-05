import { Navbar as LibNavbar } from "@breadcoop/ui";
import Link from "next/link";
import WidgetItems from "./widget-items";
import ActionItems from "./action-items";
import NavLinks from "./nav-links";
import NetworkModeChip from "./network-mode-chip";
import LocalAccountSwitcher from "./local-account-switcher";

export function Navbar() {
  return (
    <LibNavbar
      app="stacks"
      className="page-layout relative z-30"
      widgetItems={<WidgetItems />}
      actionItems={<ActionItems />}
      Link={Link}
    >
      <NavLinks />
      <div className="flex flex-col gap-2 md:mr-4 md:flex-row md:items-center md:gap-3">
        <NetworkModeChip />
        <LocalAccountSwitcher />
      </div>
    </LibNavbar>
  );
}
