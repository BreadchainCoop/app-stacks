"use client";

import { useState } from "react";
import {
  Body,
  Chip,
  Heading3,
  LoginButton,
  useConnectedUser,
} from "@breadcoop/ui";
import { Address, encodeFunctionData, erc20Abi, formatEther } from "viem";
import { useQueryClient } from "@tanstack/react-query";
import { useSignTypedData } from "@privy-io/react-auth";
import Alert from "@/components/alert";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import LocalLiftedButton from "@/components/lifted-button";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useSimulateAndSponsorTx } from "@/hooks/use-simulate-and-sponsor-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { useAutopayStatus } from "@/hooks/use-autopay-status";
import {
  AutopayAuthorizationScope,
  buildAutopayAuthorizationTypedData,
  getAutopayFeatureConfig,
  getAutopayAuthorizationScopeLabel,
} from "@/lib/autopay";
import { delegatedSavingCirclesAbi } from "@/lib/abis/delegated-saving-circles";
import { useUserCircleData } from "@/hooks/use-user-circle-data";

function StatusRow({
  label,
  ready,
  detail,
}: {
  label: string;
  ready: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-paper-2 py-3 last:border-b-0">
      <div>
        <Body bold>{label}</Body>
        <Body className="text-surface-grey">{detail}</Body>
      </div>
      <Chip
        className={
          ready
            ? "border-system-green text-system-green bg-paper-main"
            : "border-system-warning text-system-warning bg-paper-main"
        }
      >
        {ready ? "Ready" : "Pending"}
      </Chip>
    </div>
  );
}

export default function AutopaySetupCard({
  circle,
  member,
  emphasize = false,
}: {
  circle: Exclude<
    ReturnType<typeof useUserCircleData>["circleData"],
    undefined
  >;
  member: Address;
  emphasize?: boolean;
}) {
  const { user } = useConnectedUser();
  const queryClient = useQueryClient();
  const { signTypedData } = useSignTypedData();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const autopay = useAutopayStatus({ circle, member });
  const config = getAutopayFeatureConfig();
  const [pendingAction, setPendingAction] = useState<
    "delegate" | "approve" | "authorize" | null
  >(null);
  const [authorizationScope, setAuthorizationScope] =
    useState<AutopayAuthorizationScope>("circle");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!circle.isMember) return null;

  const shouldOpenByDefault =
    emphasize ||
    autopay.eligibleForAutomatedDeposit ||
    Boolean(feedback || error || autopay.authorization?.active);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["readContract"] });
    await autopay.refetchState();
  };

  const enableDelegatedDeposits = async () => {
    if (!config.delegatedContract || pendingAction) return;

    setPendingAction("delegate");
    setError(null);
    setFeedback(null);

    try {
      await simulateAndSponsorTx({
        address: config.delegatedContract,
        abi: delegatedSavingCirclesAbi,
        functionName: "setDelegatedDepositsEnabled",
        args: [true],
      });

      await refresh();
      setFeedback("Delegated deposits enabled for your wallet.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to enable delegated deposits."
      );
    } finally {
      setPendingAction(null);
    }
  };

  const approveAllowance = async () => {
    if (!config.delegatedContract || pendingAction) return;

    setPendingAction("approve");
    setError(null);
    setFeedback(null);

    try {
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [config.delegatedContract, autopay.expectedAllowance],
      });

      const { hash } = await sendSponsoredTransaction({
        to: circle.circleInfo.token,
        data: approveData,
      });

      await waitForTxReceipt(hash);
      await refresh();

      setFeedback(
        `Allowance ready for ${formatEther(autopay.expectedAllowance)} BREAD across the remaining autopay path.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve allowance."
      );
    } finally {
      setPendingAction(null);
    }
  };

  const authorizeWithLit = async () => {
    if (!config.delegatedContract || pendingAction) return;

    setPendingAction("authorize");
    setError(null);
    setFeedback(null);

    try {
      const typedData = buildAutopayAuthorizationTypedData({
        circleId: circle.circleId,
        member,
        delegatedContract: config.delegatedContract,
        scope: authorizationScope,
      });

      const { signature } = await signTypedData(typedData, {
        uiOptions: {
          showWalletUIs: false,
        },
      });

      const response = await fetch("/api/autopay/authorizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          circleId: circle.circleId.toString(),
          member,
          scope: authorizationScope,
          signature,
        }),
      });

      const json = (await response.json()) as
        | { success: true }
        | { success: false; error: string };

      if (!response.ok || !json.success) {
        throw new Error(
          "error" in json ? json.error : "Failed to save authorization"
        );
      }

      await refresh();
      setFeedback(
        `Lit-scoped autopay authorization saved for ${getAutopayAuthorizationScopeLabel(
          authorizationScope
        ).toLowerCase()}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to complete Lit authorization."
      );
    } finally {
      setPendingAction(null);
    }
  };

  const revokeAuthorization = async () => {
    if (!autopay.authorization || pendingAction) return;

    setPendingAction("authorize");
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch("/api/autopay/authorizations", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          circleId: circle.circleId.toString(),
          member,
          scope: autopay.authorization.scope,
        }),
      });

      const json = (await response.json()) as
        | { success: true }
        | { success: false; error: string };

      if (!response.ok || !json.success) {
        throw new Error(
          "error" in json ? json.error : "Failed to revoke authorization"
        );
      }

      await refresh();
      setFeedback("Autopay authorization revoked.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to revoke authorization."
      );
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Accordion defaultValue={shouldOpenByDefault ? "autopay" : undefined}>
      <AccordionItem
        value="autopay"
        className={`mb-4 border-paper-2 ${
          emphasize ? "ring-1 ring-primary-blue" : ""
        }`}
      >
        <AccordionHeader>
          <div className="flex flex-1 items-start justify-between gap-4 text-left">
            <div className="space-y-2">
              <Heading3 className="text-2xl leading-[100%]">
                Circle autopay
              </Heading3>
              <Body>
                Optional autopay only covers your own BREAD contribution path
                for this circle.
              </Body>
            </div>
            {autopay.eligibleForAutomatedDeposit ? (
              <Chip className="border-system-green text-system-green bg-paper-main">
                Deposit due
              </Chip>
            ) : (
              <Chip className="border-primary-blue text-primary-blue bg-paper-main">
                Optional
              </Chip>
            )}
          </div>
        </AccordionHeader>

        <AccordionContent>
          <Body className="pb-4">
            You can skip setup now and enable it later from this page.
          </Body>

          {!autopay.isConfigured ? (
            <Alert
              closeAble={false}
              variant="warning"
              title="Autopay is unavailable on this deployment"
              description="Set the delegated contract address and Lit autopay env vars to enable this flow."
            />
          ) : (
            <>
              <div className="pt-2">
                <StatusRow
                  label="Delegated deposits enabled"
                  ready={autopay.delegatedEnabled}
                  detail="Lets the delegated contract trigger your own circle deposit when due."
                />
                <StatusRow
                  label="Delegated BREAD allowance ready"
                  ready={autopay.allowanceReady}
                  detail={`Approves ${formatEther(autopay.expectedAllowance)} BREAD for the remaining autopay path.`}
                />
                <StatusRow
                  label="Lit authorization active"
                  ready={Boolean(autopay.authorization?.active)}
                  detail={`${getAutopayAuthorizationScopeLabel(
                    autopay.authorization?.scope ?? "circle"
                  )} for wallet ${member.slice(0, 6)}...${member.slice(-4)}.`}
                />
                <StatusRow
                  label="Eligible for automated deposit"
                  ready={autopay.eligibleForAutomatedDeposit}
                  detail="Becomes ready when your round deposit is due and all autopay prerequisites are satisfied."
                />
              </div>

              {autopay.lastResult && (
                <div className="rounded-lg bg-primary-blue/8 px-4 py-3 mt-4">
                  <Body bold>Last worker result</Body>
                  <Body className="text-surface-grey">
                    {autopay.lastResult.message}
                  </Body>
                  <Body className="text-surface-grey">
                    {new Date(autopay.lastResult.updatedAt).toLocaleString()}
                  </Body>
                </div>
              )}

              {feedback && (
                <div className="pt-4">
                  <Alert
                    closeAble={false}
                    variant="success"
                    title="Autopay updated"
                    description={feedback}
                  />
                </div>
              )}

              {error && (
                <div className="pt-4">
                  <Alert
                    closeAble={false}
                    variant="warning"
                    title="Autopay action failed"
                    description={error}
                  />
                </div>
              )}

              {!autopay.authorization?.active && (
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <LocalLiftedButton
                    width="full"
                    preset={
                      authorizationScope === "circle" ? "primary" : "secondary"
                    }
                    onClick={() => setAuthorizationScope("circle")}
                    disabled={pendingAction !== null}
                  >
                    This circle only
                  </LocalLiftedButton>
                  <LocalLiftedButton
                    width="full"
                    preset={
                      authorizationScope === "all_circles"
                        ? "primary"
                        : "secondary"
                    }
                    onClick={() => setAuthorizationScope("all_circles")}
                    disabled={pendingAction !== null}
                  >
                    All my circles
                  </LocalLiftedButton>
                </div>
              )}

              <div className="flex flex-col gap-3 pt-4 md:flex-row">
                {user.status === "CONNECTED" ? (
                  <>
                    <LocalLiftedButton
                      width="full"
                      onClick={enableDelegatedDeposits}
                      disabled={
                        autopay.delegatedEnabled || pendingAction !== null
                      }
                    >
                      {pendingAction === "delegate"
                        ? "Enabling..."
                        : "1. Enable delegated deposits"}
                    </LocalLiftedButton>
                    <LocalLiftedButton
                      width="full"
                      onClick={approveAllowance}
                      disabled={
                        autopay.allowanceReady || pendingAction !== null
                      }
                    >
                      {pendingAction === "approve"
                        ? "Approving..."
                        : "2. Approve BREAD"}
                    </LocalLiftedButton>
                    <LocalLiftedButton
                      width="full"
                      onClick={authorizeWithLit}
                      disabled={
                        !autopay.delegatedEnabled ||
                        !autopay.allowanceReady ||
                        Boolean(autopay.authorization?.active) ||
                        pendingAction !== null
                      }
                    >
                      {pendingAction === "authorize"
                        ? "Authorizing..."
                        : `3. Authorize ${authorizationScope === "all_circles" ? "all circles" : "this circle"}`}
                    </LocalLiftedButton>
                    {autopay.authorization?.active && (
                      <LocalLiftedButton
                        width="full"
                        preset="secondary"
                        onClick={revokeAuthorization}
                        disabled={pendingAction !== null}
                      >
                        {pendingAction === "authorize"
                          ? "Revoking..."
                          : "Revoke autopay"}
                      </LocalLiftedButton>
                    )}
                  </>
                ) : (
                  <LoginButton app="stacks" status={user.status} />
                )}
              </div>
            </>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
