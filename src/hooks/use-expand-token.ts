import { useEffect, useState } from "react";
import { expandShortUrlToken } from "@/utils/shorten";

export function useExpandToken(
  url: string,
  check?: boolean
): {
  result: string;
  isExpanding: boolean;
};
export function useExpandToken(
  urls: string[],
  check?: boolean
): {
  result: string[];
  isExpanding: boolean;
};

export function useExpandToken(
  urls: string | string[],
  _check?: boolean
): {
  result: string | string[];
  isExpanding: boolean;
} {
  const isArray = Array.isArray(urls);
  const [result, setResult] = useState<string | string[]>(isArray ? [] : "");
  const [isExpanding, setIsExpanding] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    if ((urls as string).length === 0) {
      setResult(isArray ? [] : "");
      setIsExpanding(false);
      return;
    }

    setIsExpanding(true);

    const normalize = (value: string) => {
      try {
        const url = new URL(value);
        const hasNonce = url.searchParams.get("nonce") !== null;
        const isSpoo = url.hostname === "spoo.me";
        return !hasNonce && isSpoo;
      } catch {
        return false;
      }
    };

    const req = isArray
      ? Promise.allSettled(
          (urls as string[]).map((url) =>
            normalize(url)
              ? expandShortUrlToken(url, { signal: controller.signal })
              : Promise.resolve(url)
          )
        )
      : normalize(urls as string)
        ? expandShortUrlToken(urls as string, { signal: controller.signal })
        : Promise.resolve(urls as string);

    req
      .then((results) => {
        if (typeof results === "string") {
          setResult(results);
          setIsExpanding(false);
          return;
        }

        const wasAborted = results.some(
          (result) =>
            result.status === "rejected" && result.reason?.name === "AbortError"
        );

        if (wasAborted) return;

        const expanded = results.map((r, i) =>
          r.status === "fulfilled" ? r.value : (urls as string[])[i]
        );

        setResult(expanded);
        setIsExpanding(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError" && !isArray) {
          setResult(urls as string);
          setIsExpanding(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [Array.isArray(urls) ? (urls as string[]).length : urls]);

  return { result, isExpanding };
}
