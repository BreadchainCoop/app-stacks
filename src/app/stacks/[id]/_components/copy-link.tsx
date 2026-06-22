"use client";

import LocalButton from "@/components/button";
import { useShortenedUrl } from "@/hooks/use-shortened-url";
import { useCopyToClipboard } from "@breadcoop/ui";
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
    <LocalButton
      variant="light"
      className={`h-8 border px-4 ${copied ? "text-system-green" : ""}`}
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
    </LocalButton>
  );
};
