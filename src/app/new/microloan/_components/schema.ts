import { isAddress } from "viem";
import * as z from "zod";
import { dateInputToMs } from "@/utils/time";

const microloanSchema = z
  .object({
    borrower: z.string().optional(),
    principal: z
      .number({ error: "Enter the loan amount" })
      .positive("The loan amount must be greater than 0"),
    grant: z
      .number({ error: "Enter a grant amount, or 0" })
      .min(0, "The grant can't be negative"),
    acceptBy: z.string().min(1, "Please select a date"),
    repaymentDays: z
      .number({ error: "Enter the number of days to repay" })
      .int("Use a whole number of days")
      .positive("Allow at least 1 day to repay"),
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

    if (data.borrower && !isAddress(data.borrower)) {
      ctx.addIssue({
        code: "custom",
        path: ["borrower"],
        message: "Provide a valid borrower address, or leave it empty",
      });
    }
  });

export type MicroloanFormSchemaData = z.infer<typeof microloanSchema>;

export default microloanSchema;
