"use client";

import { Body, Heading2 } from "@breadcoop/ui";
import Loading from "@/app/loading";
import type { ReactNode } from "react";

/**
 * Shared shell for a per-type "your stacks" list: a titled section that shows
 * a loading spinner, an empty message, or a responsive grid of cards. Renders
 * nothing at all when empty on the home dashboard (hideWhenEmpty), so an
 * unused stack type never adds visual noise.
 */
const StackListSection = ({
  title,
  description,
  isLoading,
  isEmpty,
  emptyMessage,
  hideWhenEmpty = false,
  children,
}: {
  title: string;
  description?: string;
  isLoading: boolean;
  isEmpty: boolean;
  emptyMessage?: string;
  hideWhenEmpty?: boolean;
  children: ReactNode;
}) => {
  if (!isLoading && isEmpty && hideWhenEmpty) return null;

  return (
    <section className="mt-10">
      <header className="mb-6">
        <Heading2 className="m-0 p-0 text-2xl leading-6">{title}</Heading2>
        {description && <Body className="mt-3">{description}</Body>}
      </header>
      {isLoading ? (
        <Loading />
      ) : isEmpty ? (
        <Body className="text-surface-grey">
          {emptyMessage ?? "Nothing here yet."}
        </Body>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {children}
        </div>
      )}
    </section>
  );
};

export default StackListSection;
