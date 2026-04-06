import { DEPOSIT_INTERVALS } from "@/utils/deposit-interval";
import * as z from "zod";

const intervalIds = DEPOSIT_INTERVALS.map((i) => i.id) as [string, ...string[]];

const stackSchema = z.object({
  name: z.string().min(1, "Provide a name"),
  members: z.number().min(2, "At least 2 members are required"),
  depositInterval: z.enum(intervalIds, {
    error: () => ({ message: "Please select a deposit interval" }),
  }),
  depositAmount: z.number().positive("Provide an amount"),
});

export type StackFormSchemaData = z.infer<typeof stackSchema>;

export default stackSchema;
