"use client";

import { ModalContainer, ModalHeader } from "../components";
import { Body, Heading3 } from "@breadcoop/ui";
import {
  FlaskIcon,
  GlobeHemisphereWestIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import {
  NetworkMode,
  setNetworkMode,
  storedNetworkMode,
} from "@/lib/network-mode";
import { ReactNode } from "react";

const OPTIONS: {
  mode: NetworkMode;
  title: string;
  icon: ReactNode;
  info: string;
}[] = [
  {
    mode: "local",
    title: "Demo local",
    icon: <FlaskIcon size={32} className="text-primary-blue" />,
    info: "Runs against an Anvil node on your machine — “make anvil” + “make deploy” is the whole setup. No login: switch between the 10 test accounts from the navbar and advance rounds instantly with the “Next round” button. Stack names and invites are kept in this browser only. From the hosted site this works in Chrome/Edge only.",
  },
  {
    mode: "sepolia",
    title: "Demo Sepolia",
    icon: <GlobeHemisphereWestIcon size={32} className="text-primary-blue" />,
    info: "Runs against the real Sepolia testnet. Privy login, real round intervals, and invites that can be joined from other devices.",
  },
];

const NetworkModeModal = () => {
  // First visit forces a choice; reopened from the navbar chip it can close.
  const hasStoredMode = storedNetworkMode !== null;

  return (
    <ModalContainer className="max-w-155!">
      <ModalHeader
        title="Choose a network mode"
        showCloseIcon={hasStoredMode}
      />
      <Body className="text-surface-grey">
        This site is a demo environment. Pick where it should run — you can
        change this later from the chip in the navigation bar.
      </Body>
      <div className="flex flex-col gap-4">
        {OPTIONS.map(({ mode, title, icon, info }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setNetworkMode(mode)}
            className={
              "flex flex-col gap-2 border p-4 text-left transition-colors hover:border-primary-blue " +
              (storedNetworkMode === mode
                ? "border-primary-blue bg-paper-1"
                : "border-paper-1")
            }
          >
            <span className="flex items-center gap-3">
              {icon}
              <Heading3 className="text-xl leading-6">{title}</Heading3>
              {storedNetworkMode === mode && (
                <Body className="text-primary-blue">(current)</Body>
              )}
            </span>
            <span className="flex items-start gap-2">
              <InfoIcon
                size={20}
                className="mt-0.5 shrink-0 text-surface-grey"
              />
              <Body className="text-sm text-surface-grey">{info}</Body>
            </span>
          </button>
        ))}
      </div>
    </ModalContainer>
  );
};

export default NetworkModeModal;
