import { DEPOSIT_INTERVALS } from "@/utils/deposit-interval";
import * as z from "zod";

const intervalIds = DEPOSIT_INTERVALS.map((i) => i.id) as [string, ...string[]];

/** The approval-threshold presets offered by the creation form. */
export const APPROVAL_THRESHOLDS = [
  {
    id: "majority",
    label: "Majority",
    percent: 51,
    description: "51% of members must vote yes",
  },
  {
    id: "twoThirds",
    label: "Two-thirds",
    percent: 67,
    description: "67% of members must vote yes",
  },
  {
    id: "unanimous",
    label: "Unanimous",
    percent: 100,
    description: "every member must vote yes",
  },
] as const;

export type ApprovalThresholdId = (typeof APPROVAL_THRESHOLDS)[number]["id"];

export const getThresholdById = (id: string) =>
  APPROVAL_THRESHOLDS.find((t) => t.id === id);

const thresholdIds = APPROVAL_THRESHOLDS.map((t) => t.id) as [
  ApprovalThresholdId,
  ...ApprovalThresholdId[],
];

const collectiveSchema = z.object({
  name: z.string().min(1, "Provide a name"),
  members: z.number().min(2, "At least 2 members are required"),
  votingPeriod: z.enum(intervalIds, {
    error: () => ({ message: "Please select a voting period" }),
  }),
  approvalThreshold: z.enum(thresholdIds, {
    error: () => ({ message: "Please select an approval threshold" }),
  }),
});

export type CollectiveFormSchemaData = z.infer<typeof collectiveSchema>;

export default collectiveSchema;
