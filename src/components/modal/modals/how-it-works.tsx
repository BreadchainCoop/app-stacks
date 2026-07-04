"use client";

import { Body, Heading2 } from "@breadcoop/ui";
import { ModalContainer } from "../components";
import { useModal } from "../context";
import {
  InfoIcon,
  NumberSquareOneIcon,
  NumberSquareTwoIcon,
  NumberSquareThreeIcon,
  NumberSquareFourIcon,
  NumberSquareFiveIcon,
  NumberSquareSixIcon,
  NumberSquareSevenIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionContent,
} from "@/components/accordion";

const steps = [
  {
    Icon: NumberSquareOneIcon,
    label: "Log in using an e-mail or wallet:",
    desc: "Connect with your preferred method to get started in seconds.",
  },
  {
    Icon: NumberSquareTwoIcon,
    label: "Fund your wallet:",
    desc: "Add funds so you're ready to contribute when your Stack begins.",
  },
  {
    Icon: NumberSquareThreeIcon,
    label: "Create a Stack with your friends:",
    desc: "Set up a savings group by choosing the amount, frequency, and number of members.",
  },
  {
    Icon: NumberSquareFourIcon,
    label: "Invite friends to join your Stack:",
    desc: "Share your invite link — once everyone joins, the Stack is ready to launch.",
  },
  {
    Icon: NumberSquareFiveIcon,
    label: "Launch the Stack once everyone has joined:",
    desc: "When all spots are filled, start the Stack and the savings cycle begins.",
  },
  {
    Icon: NumberSquareSixIcon,
    label: "Make your first deposit:",
    desc: "Each member contributes their share at the start of every round.",
  },
  {
    Icon: NumberSquareSevenIcon,
    label: "Claim your round:",
    desc: "When it's your turn, claim the full pooled amount from the group.",
  },
];

const faqs = [
  {
    q: "What happens if someone misses a payment?",
    a: "If a member misses their deposit, the round is cancelled and all funds are returned to the other members. No one loses money.",
  },
  {
    q: "How is the payout order decided?",
    a: "The payout order is determined when the Stack launches. Each member is assigned a round in which they receive the full pooled amount.",
  },
  {
    q: "Can I be in multiple Stacks at once?",
    a: "Yes! You can join or create as many Stacks as you like. Each one runs independently.",
  },
];

const HowItWorksModal = () => {
  const { setModal } = useModal();

  return (
    <ModalContainer className="max-w-[35.5rem]">
      <div className="relative">
        <button
          type="button"
          onClick={() => setModal(null)}
          className="absolute right-0 top-0"
        >
          <XIcon size={24} className="text-[#1c5bb9]" />
        </button>

        <div className="flex flex-col items-center gap-3">
          <InfoIcon size={48} weight="regular" className="text-[#1c5bb9]" />
          <Heading2 className="text-xl leading-6 text-center sm:text-2xl">
            How does it work?
          </Heading2>
          <Body className="text-surface-grey-2 text-center text-sm sm:text-base">
            Collective savings, no banks or credit with your friends. Everyone
            contributes, everyone takes turns to receive the full benefit.
          </Body>
        </div>

        <div className="flex flex-col gap-3 mt-4 sm:gap-4">
          {steps.map(({ Icon, label, desc }) => (
            <div key={label} className="flex gap-2 items-start">
              <div className="shrink-0 bg-[#f6f3eb] p-1">
                <Icon size={24} className="text-[#1c5bb9]" />
              </div>
              <Body className="text-surface-grey-2 text-sm sm:text-base">
                <span className="font-bold">{label} </span>
                {desc}
              </Body>
            </div>
          ))}
        </div>

        <hr className="border-surface-grey my-4" />

        <Heading2 className="text-xl leading-6 text-center mb-4 sm:text-2xl">
          FAQs
        </Heading2>

        <Accordion>
          {faqs.map(({ q, a }, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionHeader>
                <Body bold className="text-sm sm:text-base">
                  {q}
                </Body>
              </AccordionHeader>
              <AccordionContent>
                <Body className="text-surface-grey-2 text-sm sm:text-base">
                  {a}
                </Body>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ModalContainer>
  );
};

export default HowItWorksModal;
