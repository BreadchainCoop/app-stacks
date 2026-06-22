"use client";

import { useModal } from "@/components/modal/context";
import { cn } from "@breadcoop/ui";
import { CalendarIcon } from "@phosphor-icons/react";
import { CalendarEvent } from "./interfaces";
import LocalButton from "../button";

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
    <LocalButton
      variant="light"
      className={cn("h-8 border px-4", className)}
      leftIcon={<CalendarIcon className="fill-primary-blue" />}
      onClick={openModal}
    >
      {label}
    </LocalButton>
  );
};

export default Reminder;
