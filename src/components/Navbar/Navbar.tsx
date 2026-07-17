import { Navbar as LibNavbar } from "@breadcoop/ui";
import Link from "next/link";
import WidgetItems from "./widget-items";
import ActionItems from "./action-items";

export function Navbar() {
  return (
    <LibNavbar
      app="stacks"
      className="page-layout relative z-30"
      widgetItems={<WidgetItems />}
      actionItems={<ActionItems />}
      Link={Link}
    >
      <nav className="flex flex-col gap-2 md:flex-row md:gap-4 md:mr-8">
        <Link href="/" className="text-body">
          Dashboard
        </Link>
        <Link href="/new" className="text-body">
          Start stacks group
        </Link>
        <Link href="/account" className="text-body">
          My Account
        </Link>
      </nav>
    </LibNavbar>
  );
}
