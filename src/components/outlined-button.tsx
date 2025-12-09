import { LiftedButtonProps } from "@breadcoop/ui";
import clsx from "clsx";
import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type BaseProps = Pick<LiftedButtonProps, "preset"> & {
	leftIcon?: ReactNode;
	rightIcon?: ReactNode;
	className?: string;
	bold?: boolean;
};

type PolymorphicProps<C extends ElementType> = BaseProps &
	Omit<ComponentPropsWithoutRef<C>, keyof BaseProps> & {
		as?: C;
	};

type OutlinedButtonProps<C extends ElementType = "button"> =
	PolymorphicProps<C>;

const classNames: Record<
	Exclude<LiftedButtonProps["preset"], undefined>,
	string
> = {
	primary: "text-primary-blue",
	burn: "",
	destructive: "",
	positive: "",
	secondary: "",
	stroke: "",
};

const OutlinedButton = <C extends ElementType = "button">({
	className = "",
	preset = "primary",
	bold,
	leftIcon,
	rightIcon,
	children,
	as,
	...props
}: OutlinedButtonProps<C>) => {
	const Component = as || "button";

	return (
		<Component
			{...props}
			className={clsx(
				"text-body inline-flex items-center justify-center gap-2",
				classNames[preset],
				bold && "font-bold",
				className
			)}
		>
			{leftIcon}
			{children}
			{rightIcon}
		</Component>
	);
};

export default OutlinedButton;
