import { notFound } from "next/navigation";
import { getAddress, isAddress } from "viem";
import { Metadata } from "next";
import { generateMetadata as _generateMetadata } from "@/utils/metadata";
import { Body, Heading1 } from "@breadcoop/ui";
import ProfileSection from "../_components/profile-section";
import StacksOverview from "../_components/stacks-overview";
import SolidarityFundSection from "../_components/solidarity-fund-section";

const shorten = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ address: string }>;
}): Promise<Metadata> {
  const { address } = await params;

  return _generateMetadata({
    title: `Account ${isAddress(address, { strict: false }) ? shorten(address) : ""} - Bread Cooperative`,
    description: "Activity across Bread apps.",
    url: `/account/${address}`,
  });
}

const AccountPage = async ({
  params,
}: {
  params: Promise<{ address: string }>;
}) => {
  const { address: raw } = await params;

  if (!isAddress(raw, { strict: false })) notFound();

  const address = getAddress(raw);
  const basePath = `/account/${address}`;

  return (
    <div className="flex flex-col gap-12">
      <header className="flex flex-col gap-2">
        <Heading1 className="text-3xl">Account</Heading1>
        <Body className="text-surface-grey break-all">{address}</Body>
      </header>

      <ProfileSection address={address} />
      <StacksOverview address={address} basePath={basePath} />
      <SolidarityFundSection />
    </div>
  );
};

export default AccountPage;
