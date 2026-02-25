"use client";

import { useShortenedUrl } from "@/hooks/use-shortened-url";
import { LiftedButton, useCopyToClipboard } from "@breadcoop/ui";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export const CopyStackLink = () => {
  const [currentUrl, setCurrentUrl] = useState("");
  const { isShortening, result: shortenedUrl } = useShortenedUrl(currentUrl);
  const { copy, copied } = useCopyToClipboard({
    textToCopy: shortenedUrl,
  });

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const onCopy = () => {
    if (isShortening) return;

    copy();
  };

  return (
    <LiftedButton
      preset="stroke"
      className={`h-8 border pt-1.5 pb-1.5 px-4 ${copied ? "text-system-green" : ""}`}
      leftIcon={
        copied ? (
          <CheckIcon className="fill-system-green" />
        ) : (
          <CopyIcon className="fill-primary-blue" />
        )
      }
      onClick={onCopy}
      disabled={isShortening}
    >
      {copied ? "Copied!" : isShortening ? "Loading..." : "Copy stack link"}
    </LiftedButton>
  );
};
