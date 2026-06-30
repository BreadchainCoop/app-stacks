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
    <ModalContainer>
      <div className="relative">
        <button
          type="button"
          onClick={() => setModal(null)}
          className="absolute right-0 top-0"
        >
          <XIcon size={24} className="text-primary-blue" />
        </button>

        <div className="flex flex-col items-center gap-4">
          <InfoIcon size={48} className="text-primary-blue" />
          <Heading2 className="text-2xl leading-6 text-center">
            How does it work?
          </Heading2>
          <Body className="text-surface-grey-2 text-center">
            Collective savings, no banks or credit with your friends. Everyone
            contributes, everyone takes turns to receive the full benefit.
          </Body>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {steps.map(({ Icon, label, desc }) => (
            <div key={label} className="flex gap-2 items-start">
              <div className="shrink-0 bg-surface-main p-1">
                <Icon size={24} className="text-surface-ink" />
              </div>
              <Body className="text-surface-grey-2">
                <span className="font-bold">{label} </span>
                {desc}
              </Body>
            </div>
          ))}
        </div>

        <hr className="border-surface-grey my-4" />

        <Heading2 className="text-2xl leading-6 text-center mb-4">
          FAQs
        </Heading2>

        <Accordion>
          {faqs.map(({ q, a }, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionHeader>
                <Body bold>{q}</Body>
              </AccordionHeader>
              <AccordionContent>
                <Body className="text-surface-grey-2">{a}</Body>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ModalContainer>
  );
};

export default HowItWorksModal;
