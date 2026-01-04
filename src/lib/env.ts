"use client";

import z from "zod";

const envSchema = z.object({
	NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS: z.string(),
	NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS: z.string(),
	NEXT_PUBLIC_BREAD_TOKEN_ADDRESS: z.string(),
	NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK: z.string(),
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: z.string(),
});

const parsedSchema = envSchema.safeParse({
	NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS:
		process.env.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
	NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS:
		process.env.NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
	NEXT_PUBLIC_BREAD_TOKEN_ADDRESS:
		process.env.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
	NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK:
		process.env.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK,
	NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:
		process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});

if (!parsedSchema.success) {
	const errMsg = "___ Provide all CLIENT env variables ___";
	// eslint-disable-next-line no-console
	console.log(errMsg);
	// eslint-disable-next-line no-console
	console.log(parsedSchema.error.issues);
	throw new Error(errMsg);
}

export const clientEnv = parsedSchema.data;
