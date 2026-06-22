import { ElementType } from "react";
import { Button, ButtonProps } from "@breadcoop/ui";

const LocalButton = <E extends ElementType = "button">(
  props: ButtonProps<E>
) => {
  return <Button {...props} app="stacks" />;
};

export default LocalButton;
