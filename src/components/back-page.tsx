import React from "react";
import OutlinedButton from "./outlined-button";
import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/ssr";

const BackPage = ({
  label,
  className = "",
  href,
}: {
  label: string;
  className?: string;
  href: string;
}) => {
  return (
    <div className={`mb-9.75 ${className}`}>
      <OutlinedButton
        as={Link}
        href={href}
        leftIcon={<ArrowLeftIcon className="size-6" />}
        className="font-bold"
      >
        {label}
      </OutlinedButton>
    </div>
  );
};

export default BackPage;
