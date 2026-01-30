import z from "zod";

const envSchema = z.object({
  SPOO_TOKEN: z.string(),
})

const parsedSchema = envSchema.safeParse(process.env);

if (!parsedSchema.success) {
	const errMsg = "___ Provide all SERVER env variables ___";
	// eslint-disable-next-line no-console
	console.log(errMsg);
	// eslint-disable-next-line no-console
	console.log(parsedSchema.error.issues);
	throw new Error(errMsg);
}

export const serverEnv = parsedSchema.data;
