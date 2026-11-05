import type { Icon } from "@phosphor-icons/react";
import {
  ArrowClockwiseIcon,
  CoinsIcon,
  FileTextIcon,
  FlagBannerFoldIcon,
  GiftIcon,
  HandCoinsIcon,
  HandDepositIcon,
  PaperPlaneTiltIcon,
  TargetIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react/ssr";

/** One card of a stack type's tutorial, shown before its creation form. */
export type Tutorial = {
  Icon: Icon;
  title: string;
  body: string;
  para?: string;
  className?: string;
};

export const ROSCA_TUTORIALS: Tutorial[] = [
  {
    Icon: CoinsIcon,
    title: "Collective savings, no banks or credit",
    body: "Everyone contributes, everyone takes turns to receive the full benefit.",
    para: "Generations-tested savings circles, now digital & automatic.",
  },
  {
    Icon: PaperPlaneTiltIcon,
    title: "What are you saving for?",
    body: "Use Bread Stacks to meet both individual & common goals.",
    para: "Big expense or small, your group decides.",
  },
  {
    Icon: FlagBannerFoldIcon,
    title: "Invite your friends",
    body: "Share your stack's invite link. People ask to join, and you approve them.",
    para: "You can also add someone directly by their wallet address.",
  },
  {
    Icon: HandDepositIcon,
    title: "Agree on your contributions",
    body: "Choose how much and how often each member contributes.",
    para: "Every payment moves your group closer to the goal.",
    className: "rotate-180",
  },
  {
    Icon: ArrowClockwiseIcon,
    title: "Receive your payout",
    body: "Take turns receiving the full pot.",
    para: "Everyone gets one turn, so each member gets back what they put in.",
  },
];

export const GOAL_TUTORIALS: Tutorial[] = [
  {
    Icon: TargetIcon,
    title: "Save toward one target",
    body: "Pick a goal amount and a deadline, and the group contributes toward it.",
    para: "Anyone can put in what they can.",
  },
  {
    Icon: UsersThreeIcon,
    title: "Invite your group",
    body: "Share the invite link. People ask to join, and you approve them.",
  },
  {
    Icon: FlagBannerFoldIcon,
    title: "Reach the goal, release the funds",
    body: "If the group hits the target, the money goes where you decided.",
    para: "If not, everyone takes back what they put in.",
  },
];

export const CONDITIONAL_GRANT_TUTORIALS: Tutorial[] = [
  {
    Icon: HandCoinsIcon,
    title: "Give an advance with no interest",
    body: "Send someone money up front that they pay back over time, or with no deadline at all.",
    para: "They choose how much to pay back, and when.",
  },
  {
    Icon: GiftIcon,
    title: "Reward paying it back",
    body: "Set aside a grant when you make the offer. It's held safely and released once they finish paying.",
    para: "An optional fee can come out of the grant.",
  },
  {
    Icon: FileTextIcon,
    title: "Agree on the terms",
    body: "Add an agreement in plain words. They see it and accept it with the offer.",
    para: "Find them by username, or add them later.",
  },
];
