import { isAddress } from "viem";
import * as z from "zod";
import { dateInputToMs } from "@/utils/time";

const goalSchema = z
  .object({
    name: z.string().min(1, "Provide a name"),
    members: z.number().min(2, "At least 2 members are required"),
    goalAmount: z.number().positive("The goal amount must be greater than 0"),
    deadline: z.string().min(1, "Please select a deadline"),
    beneficiaryMode: z.enum(["reclaim", "beneficiary"]),
    beneficiary: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (Number.isNaN(dateInputToMs(data.deadline))) {
      ctx.addIssue({
        code: "custom",
        path: ["deadline"],
        message: "Please select a valid deadline",
      });
    }

    if (
      data.beneficiaryMode === "beneficiary" &&
      !isAddress(data.beneficiary ?? "")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["beneficiary"],
        message: "Provide a valid beneficiary address",
      });
    }
  });

export type GoalFormSchemaData = z.infer<typeof goalSchema>;

export default goalSchema;
