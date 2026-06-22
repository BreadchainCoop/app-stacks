import { ModalContainer, ModalHeader } from "@/components/modal/components";
import { ReminderModalState } from "@/components/modal/context";
import { addToCalendar } from "@/components/reminder/utils";
import { CalendarIcon } from "@phosphor-icons/react";
import { CalendarProvider } from "./interfaces";
import LocalButton from "../button";

const options: {
  label: string;
  provider: CalendarProvider;
}[] = [
  { label: "Add to Google Calendar", provider: "google" },
  { label: "Download ICS file", provider: "ics" },
  {
    label: "Add to Outlook",
    provider: "outlook",
  },
  { label: "Add to Yahoo", provider: "yahoo" },
];

const ReminderModal = ({ modalState }: { modalState: ReminderModalState }) => {
  // const hasRecurrence = Boolean(modalState.calendar.recurrence);

  return (
    <ModalContainer>
      <ModalHeader title="Add deposit reminder" />

      {/* {hasRecurrence && (
        <Body className="text-surface-grey-2 text-xs mb-2">
          This is a recurring reminder — one event per deposit round.
        </Body>
      )} */}

      <div className="flex flex-col gap-4">
        {options.map((o) => {
          // const unsupported =
          //   hasRecurrence && RECURRENCE_UNSUPPORTED.includes(o.provider);

          return (
            <div key={o.provider} className="lifted-button-container">
              <LocalButton
                variant="light"
                className="h-8 border pt-1.5 pb-1.5 px-4 justify-start"
                leftIcon={<CalendarIcon className="fill-primary-blue" />}
                onClick={() => addToCalendar(o.provider, modalState.calendar)}
              >
                {o.label}
              </LocalButton>

              {/* {unsupported && (
                <div className="flex items-center gap-1.5 mt-1 pl-1">
                  <WarningCircleIcon
                    size={13}
                    className="fill-system-yellow shrink-0"
                  />
                  <Body className="text-system-yellow text-xs">
                    Recurrence not supported — set it manually after adding.
                  </Body>
                </div>
              )} */}
            </div>
          );
        })}
      </div>
    </ModalContainer>
  );
};

export default ReminderModal;
