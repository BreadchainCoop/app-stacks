"use client";

import { useModal } from "@/components/modal/context";
import { cn, LiftedButton } from "@breadcoop/ui";
import { CalendarIcon } from "@phosphor-icons/react";
import { CalendarEvent } from "./interfaces";

interface ReminderProps {
  calendar: CalendarEvent;
  label?: string;
  className?: string;
}

const Reminder = ({
  calendar,
  label = "Calendar reminder",
  className,
}: ReminderProps) => {
  const { setModal } = useModal();

  const openModal = () => setModal({ type: "REMINDER", calendar });

  return (
    <LiftedButton
      preset="stroke"
      className={cn("h-8 border px-4", className)}
      leftIcon={<CalendarIcon className="fill-primary-blue" />}
      onClick={openModal}
    >
      {label}
    </LiftedButton>
  );
};

export default Reminder;
