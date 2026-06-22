import clsx from "clsx";
import { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type BaseProps = {
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

const OutlinedButton = <C extends ElementType = "button">({
  className = "",
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
        "text-body inline-flex items-center justify-center gap-2 text-primary-blue",
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
