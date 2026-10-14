import { isAddress } from "viem";
import * as z from "zod";
import { dateInputToMs } from "@/utils/time";

const conditionalGrantSchema = z
  .object({
    grantee: z.string().optional(),
    advance: z
      .number({ error: "Enter the advance" })
      .positive("The advance must be greater than 0"),
    grant: z
      .number({ error: "Enter a grant amount, or 0" })
      .min(0, "The grant can't be negative"),
    acceptBy: z.string().min(1, "Please select a date"),
    noDeadline: z.boolean(),
    // Checked in superRefine: only required when there is a deadline
    payBackDays: z.number().or(z.nan()).optional(),
    agreement: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (Number.isNaN(dateInputToMs(data.acceptBy))) {
      ctx.addIssue({
        code: "custom",
        path: ["acceptBy"],
        message: "Please select a valid date",
      });
    }

    if (!data.noDeadline) {
      const days = data.payBackDays;
      const message =
        days === undefined || Number.isNaN(days)
          ? "Enter the number of days to pay back"
          : !Number.isInteger(days)
            ? "Use a whole number of days"
            : days < 1
              ? "Allow at least 1 day to pay back"
              : // The contract's MAX_PAY_BACK_PERIOD is 10 years
                days > 3650
                ? "Keep the time to pay back under 10 years"
                : undefined;
      if (message) {
        ctx.addIssue({ code: "custom", path: ["payBackDays"], message });
      }
    }

    if (data.grantee && !isAddress(data.grantee)) {
      ctx.addIssue({
        code: "custom",
        path: ["grantee"],
        message: "Provide a valid grantee address, or leave it empty",
      });
    }
  });

export type ConditionalGrantFormSchemaData = z.infer<
  typeof conditionalGrantSchema
>;

export default conditionalGrantSchema;
