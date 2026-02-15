import { useEffect, useState } from "react";
import { shortenUrl } from "@/utils/shorten";

export function useShortenedUrl(
  url: string,
  check?: boolean
): {
  result: string;
  isShortening: boolean;
};
export function useShortenedUrl(
  urls: string[],
  check?: boolean
): {
  result: string[];
  isShortening: boolean;
};

export function useShortenedUrl(
  urls: string | string[],
  check?: boolean
): {
  result: string | string[];
  isShortening: boolean;
} {
  const isArray = Array.isArray(urls);
  const [result, setResult] = useState<string | string[]>(isArray ? [] : "");
  const [isShortening, setIsShortening] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    if (urls.length === 0) {
      setResult(isArray ? [] : "");
      setIsShortening(false);
      return;
    }

    setIsShortening(true);

    const req = isArray
      ? Promise.allSettled(
          urls.map((url) =>
            shortenUrl(url, { check, signal: controller.signal })
          )
        )
      : shortenUrl(urls, { check, signal: controller.signal });

    req
      .then((results) => {
        if (typeof results === "string") {
          setResult(results);
          setIsShortening(false);
          return;
        }

        const wasAborted = results.some(
          (result) =>
            result.status === "rejected" && result.reason?.name === "AbortError"
        );

        if (wasAborted) return;

        const shortened = results.map((r, i) =>
          r.status === "fulfilled" ? r.value : urls[i]
        );

        setResult(shortened);
        setIsShortening(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError" && !isArray) {
          setResult(urls);
          setIsShortening(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [isArray ? (urls as string[]).length : urls]);

  return { result, isShortening };
}
