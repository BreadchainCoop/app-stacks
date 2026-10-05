"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import LocalButton from "@/components/button";

/**
 * Copies the current URL, chain param included, so the link the user carries to
 * the other browser still names its chain.
 */
const CopyCurrentLink = () => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard access can be denied (or absent over plain http); the user
      // can still copy from the address bar, so there is nothing to recover.
    }
  };

  return (
    <LocalButton
      onClick={copy}
      rightIcon={copied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
    >
      {copied ? "Link copied" : "Copy link"}
    </LocalButton>
  );
};

export default CopyCurrentLink;
