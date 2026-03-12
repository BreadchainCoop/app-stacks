import * as z from "zod";
import { DEPOSIT_INTERVAL_VALUES } from "@/lib/deposit-intervals";

const stackSchema = z.object({
  name: z.string().min(1, "Provide a name"),
  members: z.number().min(2, "At least 2 members are required"),
  depositInterval: z.enum(DEPOSIT_INTERVAL_VALUES, {
    error: "Select an interval",
  }),
  depositAmount: z.number().positive("Provide an amount"),
});

export type StackFormSchemaData = z.infer<typeof stackSchema>;

export default stackSchema;
