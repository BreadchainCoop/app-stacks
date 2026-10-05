"use client";

import { useState, useSyncExternalStore } from "react";
import { debugTxEnabled, debugTxStore } from "@/utils/debug-tx";

/**
 * TEMPORARY — on-screen readout for the post-write RPC diagnostic, because this
 * is reproduced inside MiniPay's in-app browser on a phone where no console is
 * reachable. Renders nothing unless NEXT_PUBLIC_DEBUG_TX=1.
 *
 * Remove together with src/utils/debug-tx.ts.
 */
const DebugTxPanel = () => {
  const entries = useSyncExternalStore(
    debugTxStore.subscribe,
    debugTxStore.getSnapshot,
    // No entries during SSR; the store only fills after a write.
    () => debugTxStore.getSnapshot()
  );
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!debugTxEnabled) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(entries, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be denied in an in-app browser; the text is on screen
      // and selectable, so there is nothing to recover.
    }
  };

  return (
    <div className="fixed bottom-2 right-2 z-50 max-w-[calc(100vw-1rem)] font-mono text-[11px]">
      {open ? (
        <div className="flex max-h-[60vh] flex-col gap-2 overflow-auto border-2 border-system-red bg-paper-main p-2">
          <div className="flex items-center justify-between gap-2">
            <strong>debug-tx ({entries.length})</strong>
            <div className="flex gap-2">
              <button type="button" onClick={copy} className="underline">
                {copied ? "copied" : "copy"}
              </button>
              <button
                type="button"
                onClick={() => debugTxStore.clear()}
                className="underline"
              >
                clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="underline"
              >
                hide
              </button>
            </div>
          </div>

          {entries.length === 0 ? (
            <p>No writes recorded yet. Do a deposit or add a member.</p>
          ) : (
            entries.map((entry, index) => (
              <pre key={index} className="whitespace-pre-wrap break-all">
                {`${entry.at} ${entry.label} chain=${entry.chainId}
  receipt block   ${entry.receiptBlock} (${entry.receiptStatus})
  reads at        ${entry.readBlockImmediately}
  reads +1.5s     ${entry.readBlockAfterDelay}
  LAGGING         ${entry.lagging}`}
              </pre>
            ))
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="border-2 border-system-red bg-paper-main px-2 py-1"
        >
          debug-tx ({entries.length})
        </button>
      )}
    </div>
  );
};

export default DebugTxPanel;
