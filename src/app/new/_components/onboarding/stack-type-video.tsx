"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { PlayIcon } from "@phosphor-icons/react";
import { LiftedButton } from "@breadcoop/ui";
import { ModalCloseIcon } from "@/components/modal/components";

/**
 * "How does it work?" button for a stack type card. Opens the type's explainer
 * video (public/videos/<video>.mp4) in a modal, like the Solidarity Fund
 * app's HowItWorks video.
 */
export const StackTypeVideo = ({
  label,
  video,
}: {
  label: string;
  /** File name in public/videos, without extension (.mp4 and .jpg poster). */
  video: string;
}) => {
  const [open, setOpen] = useState(false);
  const src = `/videos/${video}.mp4`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="lifted-button-container max-w-[13rem]">
        <LiftedButton
          preset="stroke"
          className="border border-black !py-1 px-4 !h-8"
          onClick={() => setOpen(true)}
          leftIcon={
            <PlayIcon weight="fill" color="var(--color-primary-blue)" />
          }
        >
          How does it work?
        </LiftedButton>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 bg-[#F0F0F0] opacity-90 dark:bg-neutral-900 dark:opacity-70" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 z-40 flex w-11/12 max-w-[60rem] -translate-x-1/2 -translate-y-1/2 flex-col gap-2 bg-paper-0 p-5 shadow-[0px_4px_12px_0px_#1B201A26]"
        >
          <Dialog.Title className="sr-only">
            How {label.toLowerCase()} stacks work
          </Dialog.Title>
          <Dialog.Close
            className="self-end size-10 p-2"
            aria-label="Close video"
          >
            <ModalCloseIcon />
          </Dialog.Close>
          <video
            className="w-full aspect-video bg-black"
            src={src}
            poster={`/videos/${video}.jpg`}
            controls
            autoPlay
            playsInline
            preload="metadata"
          >
            Your browser can&apos;t play this video.{" "}
            <a href={src} className="underline">
              Download it instead
            </a>
            .
          </video>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
