import { Body } from "@breadcoop/ui";

/** A grant's plain-language agreement, exactly as the grantor wrote it */
export default function AgreementText({ text }: { text: string }) {
  return (
    <Body className="whitespace-pre-wrap break-words border border-paper-2 bg-paper-0 py-3 px-4 text-surface-grey-2">
      {text}
    </Body>
  );
}
