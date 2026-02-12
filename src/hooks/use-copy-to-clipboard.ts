import { copyToClipboard } from "@/utils/copy-to-clipboard";
import { useEffect, useState } from "react";

export interface UseCopyToClipboardPayload {
  textToCopy: string;
  beforeCopy?: (url: string) => Promise<string>;
}

export const useCopyToClipboard = ({
  textToCopy,
  beforeCopy,
}: UseCopyToClipboardPayload) => {
  const [copied, setCopied] = useState(false);
  const timer: NodeJS.Timeout | undefined = undefined;

  const copy = async () => {
    await copyToClipboard((await beforeCopy?.(textToCopy)) || textToCopy);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return { copied, copy };
};
