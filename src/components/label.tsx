"use client";

import clsx from "clsx";
import { LabelHTMLAttributes } from "react";
import Tooltip from "./tooltip";
import { QuestionIcon } from "@phosphor-icons/react";

export const Label = (props: LabelHTMLAttributes<HTMLLabelElement>) => {
  return <label {...props} className={clsx("text-body", props.className)} />;
};

export const LabelWithTooltip = () => {
  return (
    <Tooltip content="">
      <Label className="flex items-center justify-start gap-2 max-w-max">
        <span>Label</span>
        <QuestionIcon />
      </Label>
    </Tooltip>
  );
};
