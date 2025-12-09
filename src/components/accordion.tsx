"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import * as RaAccordion from "@radix-ui/react-accordion";
import clsx from "clsx";
import { ReactNode } from "react";

export const Accordion = ({ children }: { children: ReactNode }) => {
	return (
		<RaAccordion.Root type="single" className="" collapsible>
			{children}
		</RaAccordion.Root>
	);
};

export const AccordionItem = ({
	children,
	value,
	className,
}: {
	children: ReactNode;
	value: string;
	className?: string;
}) => {
	return (
		<RaAccordion.Item
			value={value}
			className={clsx(
				"border border-surface-ink hover:border-primary-blue bg-paper-0 mb-2 last:mb-0",
				className
			)}
		>
			{children}
		</RaAccordion.Item>
	);
};

export const AccordionHeader = ({ children }: { children: ReactNode }) => {
	return (
		<RaAccordion.Header className="">
			<RaAccordion.Trigger className="AccordionTrigger flex items-center justify-between gap-2.5 w-full px-6 py-3">
				{children}
				<CaretDownIcon
					className="AccordionChevron fill-primary-blue"
					aria-hidden
				/>
			</RaAccordion.Trigger>
		</RaAccordion.Header>
	);
};

export const AccordionContent = ({ children }: { children: ReactNode }) => {
	return (
		<RaAccordion.Content className="px-6 pb-3">
			{children}
		</RaAccordion.Content>
	);
};
