"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import {
  LiftedButton,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Body,
  Caption,
} from "@breadcoop/ui";
import { LINKS } from "@/constants/links";
import { AccountMenu } from "@/components/AccountMenu";
import { SignInIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";
import { useMemberStacks, useStacks } from "@/hooks";
import { formatTokenAmount } from "@/utils/formatTokenAmount";
import { tokenInfo } from "@/lib/tokens";
import { CircleProgressBar } from "@/components/CircleProgressBar";
import { PaymentDueBadge } from "@/components/PaymentDueBadge";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();

  // Frequency mapping for deposit intervals
  const frequencyInSeconds: { [key: string]: number } = {
    Daily: 86400,
    Weekly: 604800,
    Monthly: 2592000,
    Quarterly: 7776000,
  };

  // Function to convert deposit interval to frequency string
  const getFrequencyString = (intervalSeconds: bigint): string => {
    const interval = Number(intervalSeconds);
    const frequency = Object.entries(frequencyInSeconds).find(
      ([_, seconds]) => seconds === interval
    );
    return frequency ? frequency[0] : `${interval} seconds`;
  };

  // Fetch member circles
  const {
    data: circleIds,
    isLoading: isLoadingIds,
    refetch: refetchCircleIds,
  } = useMemberStacks(address);

  // Fetch circles data
  const {
    data: circlesData,
    isLoading: isLoadingCircles,
    refetch: refetchCirclesData,
  } = useStacks(circleIds);
  return (
    <div className="min-h-screen flex flex-col bg-paper-main">
      <Navbar />

      <main className="flex-1 w-[1280px] mx-auto">
        <div className="py-12">
          <Heading3>Your Stacks dashboard</Heading3>
        </div>
        <div>
          {isConnected && (
            <div>
              <Body>Connected to {address}</Body>

              {/* Circles Data Display */}
              <div className="mt-6 p-6 bg-white rounded-lg border border-gray-200">
                <Heading4 className="mb-4">Your Circles</Heading4>

                {isLoadingIds ? (
                  <Body>Loading your circle IDs...</Body>
                ) : circleIds && circleIds.length > 0 ? (
                  <div>
                    <Body className="mb-2">
                      Found {circleIds.length} circle(s) for your address
                    </Body>
                    <div className="mb-4">
                      <Body className="text-sm text-gray-600">
                        Circle IDs: {circleIds.join(", ")}
                      </Body>
                    </div>

                    {isLoadingCircles ? (
                      <Body>Loading circles data...</Body>
                    ) : circlesData ? (
                      <div className="space-y-4">
                        {circlesData.map((circle, index) => (
                          <div
                            key={index}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Heading5>Circle #{circleIds[index]}</Heading5>
                              <PaymentDueBadge
                                currentIndex={circle.currentIndex}
                                maxDeposits={circle.maxDeposits}
                                circleStart={circle.circleStart}
                                depositInterval={circle.depositInterval}
                              />
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <CircleProgressBar
                                currentIndex={circle.currentIndex}
                                maxDeposits={circle.maxDeposits}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Body className="font-medium">Owner:</Body>
                                <Body className="text-gray-600">
                                  {circle.owner}
                                </Body>
                              </div>
                              <div>
                                <Body className="font-medium">
                                  Current Index:
                                </Body>
                                <Body className="text-gray-600">
                                  {circle.currentIndex.toString()}
                                </Body>
                              </div>
                              <div>
                                <Body className="font-medium">
                                  Deposit Amount:
                                </Body>
                                <Body className="text-gray-600">
                                  {formatTokenAmount(
                                    circle.depositAmount,
                                    tokenInfo[circle.token.toLowerCase()]
                                      ?.decimals || 18
                                  )}
                                </Body>
                              </div>
                              <div>
                                <Body className="font-medium">Token:</Body>
                                <Body className="text-gray-600">
                                  {tokenInfo[circle.token.toLowerCase()]
                                    ?.symbol || circle.token}
                                </Body>
                              </div>
                              <div>
                                <Body className="font-medium">
                                  Deposit Interval:
                                </Body>
                                <Body className="text-gray-600">
                                  {getFrequencyString(circle.depositInterval)}
                                </Body>
                              </div>
                              <div>
                                <Body className="font-medium">
                                  Max Deposits:
                                </Body>
                                <Body className="text-gray-600">
                                  {circle.maxDeposits.toString()}
                                </Body>
                              </div>
                              <div className="col-span-2">
                                <Body className="font-medium">
                                  Members ({circle.members.length}):
                                </Body>
                                <Body className="text-gray-600">
                                  {circle.members.join(", ")}
                                </Body>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Body>No circles data available</Body>
                    )}
                  </div>
                ) : (
                  <Body>No circles found for your address</Body>
                )}
              </div>

              <div className="flex mt-6">
                <LiftedButton
                  onClick={() => {
                    disconnectAsync();
                  }}
                >
                  Disconnect
                </LiftedButton>
              </div>
            </div>
          )}
          {!isConnected && (
            <div>
              <Body>
                You are not signed in. Please sign in to view your account
                stats.
              </Body>

              <div className="flex ">
                <AccountMenu>Sign in to view dashboard</AccountMenu>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
