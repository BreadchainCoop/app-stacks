import {
  LiftedButton as LibLiftedButton,
  LiftedButtonProps,
} from "@breadcoop/ui";

export const localButtonClassNames = {
  primary: "bg-primary-blue hover:bg-blue-2",
  secondary: "bg-[#B9D5FF] text-primary-blue",
  stroke: "bg-paper-main text-system-green",
  positive: "",
  destructive: "",
};

const LocalLiftedButton = ({
  preset = "primary",
  className,
  ...props
}: LiftedButtonProps) => {
  const allClassName = `${className} ${
    localButtonClassNames[preset as keyof typeof localButtonClassNames]
  }`;

  return <LibLiftedButton {...props} className={allClassName} />;
};

export default LocalLiftedButton;
