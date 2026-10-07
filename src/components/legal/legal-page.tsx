import { ReactNode } from "react";
import { Body, Caption, Heading1, Heading3 } from "@breadcoop/ui";

/**
 * Shared shell for the Terms and Privacy pages: both are long-form prose that
 * MiniPay requires to be reachable from inside the app, so they share a heading,
 * a last-reviewed line and the prose rhythm rather than each re-styling it.
 *
 * Static by design — no hooks, so these render without client JS and stay
 * readable if the wallet never connects.
 */
export const LegalPage = ({
  title,
  lastUpdated,
  intro,
  children,
}: {
  title: string;
  lastUpdated: string;
  intro: ReactNode;
  children: ReactNode;
}) => (
  <article className="mx-auto flex w-full max-w-168 flex-col gap-6">
    <header className="flex flex-col gap-3">
      <Heading1 className="text-primary-blue text-3xl leading-9 md:text-5xl">
        {title}
      </Heading1>
      <Caption className="text-surface-grey-2">
        Last updated {lastUpdated}
      </Caption>
      <Body className="text-surface-grey-2">{intro}</Body>
    </header>
    {children}
  </article>
);

export const LegalSection = ({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) => (
  <section className="flex flex-col gap-3">
    <Heading3 className="text-2xl leading-7">{heading}</Heading3>
    {children}
  </section>
);

export const LegalText = ({ children }: { children: ReactNode }) => (
  <Body className="text-surface-grey-2">{children}</Body>
);

export const LegalList = ({ items }: { items: ReactNode[] }) => (
  <ul className="flex list-disc flex-col gap-2 pl-5">
    {items.map((item, index) => (
      <li key={index}>
        <Body className="text-surface-grey-2">{item}</Body>
      </li>
    ))}
  </ul>
);
