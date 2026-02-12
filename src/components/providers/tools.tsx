"use client";

import { LinkProvider } from "@breadcoop/ui";
import Link from "next/link";
import { ReactNode } from "react";

const ToolsProviders = ({ children }: { children: ReactNode }) => {
  return <LinkProvider Link={Link}>{children}</LinkProvider>;
};

export default ToolsProviders;
