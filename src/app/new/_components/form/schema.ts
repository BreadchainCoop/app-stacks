import * as z from "zod";

const stackSchema = z.object({
	name: z.string().min(1, "Proivde a name"),
	members: z.number().min(1, "At least 1 member is required"),
	depositInterval: z.enum(["monthly", "weekly"], {
		error: "Select an interval",
	}),
	depositAmount: z.number().positive("Provide an amount"),
});

export type StackFormSchemaData = z.infer<typeof stackSchema>;

export default stackSchema;
