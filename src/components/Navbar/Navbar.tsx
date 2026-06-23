import { Navbar as LibNavbar } from "@breadcoop/ui";
import Link from "next/link";
import WidgetItems from "./widget-items";
import ActionItems from "./action-items";
import NavLinks from "./nav-links";

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
    </LibNavbar>
  );
}
