"use client";

import { Body, Heading2 } from "@breadcoop/ui";
import Loading from "@/app/loading";
import { Children, useEffect, useState, type ReactNode } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";

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
  const cards = Children.toArray(children);
  const [currentPage, setCurrentPage] = useState(1);
  const [cardsPerPage, setCardsPerPage] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setCardsPerPage(
        window.innerWidth >= 1280
          ? Math.max(cards.length, 1)
          : window.innerWidth >= 1024
            ? 2
            : 1
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cards.length]);

  const totalPages = Math.max(1, Math.ceil(cards.length / cardsPerPage));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * cardsPerPage;

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

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
        <>
          <ul className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {cards.slice(startIndex, startIndex + cardsPerPage)}
          </ul>
          {totalPages > 1 && (
            <nav
              aria-label={`${title} pagination`}
              className="mt-8 flex items-center justify-center gap-4 py-2 xl:hidden"
            >
              <button
                type="button"
                onClick={() => setCurrentPage(page - 1)}
                disabled={page === 1}
                className="transition-colors text-primary-blue disabled:opacity-20"
                aria-label="Previous"
              >
                <CaretLeftIcon className="size-6" />
              </button>
              <span
                aria-live="polite"
                className="text-lg font-medium text-gray-700"
              >
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(page + 1)}
                disabled={page === totalPages}
                className="transition-colors text-primary-blue disabled:opacity-20"
                aria-label="Next"
              >
                <CaretRightIcon className="size-6" />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default StackListSection;
