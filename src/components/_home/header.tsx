"use client";

import { Body, Heading2 } from "@breadcoop/ui";
import { Address } from "viem";
import LocalButton from "../button";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";

const HomeHeader = ({
  type,
  address,
}: {
  type: "all" | "persona";
  address?: Address;
}) => {
  const isOwnProfile = useIsOwnAddress(address ?? "");
  const isVisitor = type === "persona" && Boolean(address) && !isOwnProfile;

  return (
    <header className="mb-6 md:flex md:items-center md:justify-between">
      <div className="flex flex-col gap-6 mb-6 md:mb-0">
        <Heading2 className="m-0 p-0 text-2xl leading-6">
          {isVisitor
            ? "Stacks"
            : type === "persona"
              ? "Your Stacks"
              : "All Stacks"}
        </Heading2>
        <Body>
          {isVisitor
            ? "Peek into this account's Stacks."
            : type === "persona"
              ? "Peek into your Stacks dashboard."
              : "Peek into all active Stack groups."}
        </Body>
      </div>
      {type !== "all" && !isVisitor && (
        <LocalButton
          as={Link}
          href="/new"
          className="md:w-auto"
          app="stacks"
          leftIcon={<PlusIcon />}
        >
          Create new Stack
        </LocalButton>
      )}
    </header>
  );
};

export default HomeHeader;
