"use client";

import { Body, Heading2, useConnectedUser } from "@breadcoop/ui";
import LocalLiftedButton from "../lifted-button";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react";

const HomeHeader = ({ type }: { type: "all" | "persona" }) => {
  const { user } = useConnectedUser();

  return (
    <header className="mb-6 md:flex md:items-center md:justify-between">
      <div className="flex flex-col gap-6 mb-6 md:mb-0">
        <Heading2 className="m-0 p-0 text-2xl leading-6">
          {type === "persona" ? "Your Stacks" : "All Stacks"}
        </Heading2>
        <Body>
          {type === "persona"
            ? "Peek into your Stacks dashboard."
            : "Peek into all active Stack groups."}
        </Body>
      </div>
      {(type === "persona" || user.status !== "CONNECTED") && (
        <Link href="/new" className="lifted-button-container md:w-auto">
          <LocalLiftedButton leftIcon={<PlusIcon />}>
            Create new Stack
          </LocalLiftedButton>
        </Link>
      )}
    </header>
  );
};

export default HomeHeader;
