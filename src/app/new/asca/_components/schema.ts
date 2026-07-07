import { DEPOSIT_INTERVALS } from "@/utils/deposit-interval";
import * as z from "zod";

const intervalIds = DEPOSIT_INTERVALS.map((i) => i.id) as [string, ...string[]];

const ascaSchema = z.object({
  name: z.string().min(1, "Provide a name"),
  members: z.number().min(2, "At least 2 members are required"),
  borrowLimit: z
    .number()
    .min(0, "The borrow limit cannot be negative")
    .max(100, "The borrow limit cannot exceed 100%"),
  interestRate: z
    .number()
    .min(0, "The interest rate cannot be negative")
    .max(100, "The interest rate cannot exceed 100%"),
  periodLength: z.enum(intervalIds, {
    error: () => ({ message: "Please select a period length" }),
  }),
  repaymentPeriods: z
    .number()
    .min(1, "At least 1 repayment period is required")
    .max(1000, "At most 1000 repayment periods are allowed"),
});

export type AscaFormSchemaData = z.infer<typeof ascaSchema>;

export default ascaSchema;
