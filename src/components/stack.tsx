import { Body, Heading3, Chip, formatBalance } from "@breadcoop/ui";
import { UsersIcon } from "./icons/users";
import { CoinIcon, CoinsIcon } from "./icons/coin";
import { CalendarIcon } from "./icons/calendar";
import LocalButton from "./button";
import { QuestionIcon } from "@phosphor-icons/react/ssr";
import ClaimButton from "./claim-button";
import { ICircleList, ICircleStatus } from "@/interfaces/circle";
import { formatEther } from "viem";
import DepositButton from "./deposit-button";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { parseCircleIntervalToDate } from "@/utils/stacks";
import { Database } from "@/lib/supabase";
import { useModal } from "./modal/context";
import { useFundsDeposited } from "@/hooks/use-funds-deposited";
import Link from "next/link";

type StackMetadata = Database["public"]["Tables"]["stacks_metadata"]["Row"];

const completedStatuses: ICircleStatus[] = [
  "expired",
  "decommissioned",
  "finished",
];

const failedStatuses: ICircleStatus[] = ["decommissioned", "expired", "failed"];

const Stack = ({
  stack,
  stacksMap,
  readOnly = false,
}: {
  stack: ICircleList;
  stacksMap: Record<string, StackMetadata>;
  /** Hide claim/deposit actions when the viewer is not the account owner */
  readOnly?: boolean;
}) => {
  const { setModal } = useModal();
  const stackMeta = stacksMap[String(stack.id)];
  const depositAmount = formatEther(stack.depositAmount);
  const totalGoal =
    Number(depositAmount) * stack.totalMember * stack.totalMember;

  const isFailedStack = failedStatuses.includes(stack.status!);

  const fundsDeposited = useFundsDeposited({
    circleId: stack.id.toString(),
    enabled: isFailedStack,
    totalRounds: stack.totalMember,
    circleStartsTimestamp: stack.effectiveCircleStartTime,
    depositInterval: stack.depositInterval,
  });

  const totalDeposited = isFailedStack
    ? Number(
        formatEther(
          fundsDeposited.data?.totalDepositInCurrentRound ?? BigInt(0)
        )
      ) +
      (fundsDeposited.data?.lastActiveRound ?? 0) *
        Number(depositAmount) *
        stack.totalMember
    : Number(
        stack.status === "finished" ? stack.totalMember : stack.currentIndex
      ) *
        Number(depositAmount) *
        Number(stack.totalMember) +
      Number(formatEther(stack.totalPoolBalance || BigInt(0)));

  let percentageDone = 0;
  if (totalDeposited !== 0 && totalGoal !== 0) {
    if (isFailedStack) {
      if (!fundsDeposited.isLoading && fundsDeposited.data) {
        percentageDone = (totalDeposited / totalGoal) * 100;
      }
    } else if (stack.status === "in-progress" || stack.status === "finished") {
      percentageDone = (totalDeposited / totalGoal) * 100;
    }
  }
  const terminalStatusLabel =
    stack.status === "failed"
      ? "Failed"
      : stack.status === "decommissioned"
        ? "Decommissioned"
        : stack.status === "expired"
          ? "Expired"
          : null;

  const items = [
    {
      label: `${stack.totalMember} Members`,
      icon: <UsersIcon />,
      className: "",
    },
    {
      label: `Deposit: $${formatBalance(Number(depositAmount), 2)} ${
        parseCircleIntervalToDate(stack.depositInterval).label
      }`,
      icon: <CoinsIcon />,
      className: "",
    },
    {
      label: `Pay out: $${formatBalance(Number(depositAmount) * stack.totalMember, 2)} per member`,
      icon: <CoinIcon />,
      className: "",
    },
    {
      label: `Stack volume: $${formatBalance(totalGoal, 2)}`,
      icon: <CalendarIcon />,
      className: "",
    },
  ];

  const statusMode = !stack.status
    ? undefined
    : stack.status === "expired" ||
        stack.status === "finished" ||
        stack.status === "decommissioned"
      ? ""
      : stack.status;

  return (
    <li className="border border-paper-1 p-6 flex flex-col gap-6 bg-paper-0 shadow-[0px_4px_12px_0px_#1B201A26] xl:max-w-94">
      <div className="flex flex-col gap-2">
        <Heading3 className="m-0 text-2xl font-bold">
          {stackMeta?.stackname ?? `Stack ${stack.id}`}
        </Heading3>
        <div className="flex items-center justify-between">
          <Body bold className="text-surface-grey">
            ID: {stack.id}
          </Body>
          <div className="flex items-center justify-end gap-2">
            {/* "Payment due" / "Member" describe the account's own standing,
                so they only render for the owner; "Failed" is a fact about
                the stack itself and shows for every viewer. */}
            {stack.status === "payment_due" && !readOnly ? (
              <Chip className="font-bold border-current! text-system-warning">
                Payment due
              </Chip>
            ) : stack.status === "failed" ? (
              <Chip className="font-bold border-current! text-system-red">
                Failed
              </Chip>
            ) : stack.isMember &&
              !readOnly &&
              !completedStatuses.includes(stack.status!) ? (
              <Chip className="border-system-green text-system-green bg-paper-main max-w-max hover:border-current">
                Member
              </Chip>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between gap-6">
        <div className="flex-2">
          <div className="flex items-center justify-between mb-2">
            <Body bold className="text-xs sm:text-base">
              Stack progress
            </Body>
            {stack.status === "pending-start" ? (
              <Body className="text-xs sm:text-sm text-surface-grey">
                Not started
              </Body>
            ) : terminalStatusLabel ? (
              <Body className="text-xs sm:text-sm text-surface-grey">
                {terminalStatusLabel}
              </Body>
            ) : (
              <Body bold className="text-xs sm:text-base">
                {Math.round(percentageDone * 100) / 100}%
              </Body>
            )}
          </div>
          <div className="w-full h-3.5 p-0.75 bg-paper-main">
            <div
              className="h-full bg-primary-blue"
              style={{ width: `${percentageDone}%` }}
            />
          </div>
        </div>
        <div className="w-full max-w-max flex flex-col xl:hidden">
          <p className="text-h2 m-0 text-2xl leading-6 text-surface-grey-2">
            {isFailedStack ? (
              fundsDeposited.isLoading ? (
                <span className="text-surface-grey text-sm">loading...</span>
              ) : (
                <>${formatBalance(totalDeposited, 2)}</>
              )
            ) : (
              <>${formatBalance(totalDeposited, 2)}</>
            )}
          </p>
          <Body className="flex items-center justify-start gap-1 text-surface-grey">
            <span className="text-[0.625rem]">Total deposited</span>
            <span>
              <QuestionIcon size={16} className="fill-surface-grey" />
            </span>
          </Body>
        </div>
      </div>
      <ul className="flex flex-col gap-2.5">
        {items.map((item) => {
          return (
            <li key={item.label} className={`flex gap-1.25 ${item.className}`}>
              <span className="text-primary-blue">{item.icon}</span>
              <Body bold className="text-surface-grey-2">
                {item.label}
              </Body>
            </li>
          );
        })}
      </ul>
      <div className="flex flex-col gap-3 mt-auto">
        {stack.canWithdraw && !readOnly ? (
          <ClaimButton
            amount={
              Number(formatEther(stack.depositAmount)) * stack.totalMember
            }
            circleId={stack.id}
            nextDeposit={
              Number(stack.currentIndex) + 1 < stack.totalMember
                ? stack.depositAmount
                : BigInt(0)
            }
            roundsLeft={
              Number(stack.currentIndex) + 1 < stack.totalMember
                ? BigInt(stack.totalMember - 1) - stack.currentIndex
                : BigInt(0)
            }
            nextDepositAddress={stack.token}
          />
        ) : stack.status === "payment_due" && !readOnly ? (
          <DepositButton
            circleId={stack.id}
            tokenAddress={stack.token}
            className="w-full"
            leftIcon={<HandWithdrawIcon />}
            amount={stack.depositAmount}
          />
        ) : stack.status === "failed" && stack.isMember && !readOnly ? (
          <LocalButton
            className="font-bold w-full"
            variant="burn"
            onClick={() => setModal({ type: "STACK_FAILED", id: stack.id })}
          >
            Claim last deposits
          </LocalButton>
        ) : statusMode === "" ? (
          <Body
            bold
            className="flex items-center justify-center gap-2 bg-surface-grey text-surface-ink opacity-50 py-4 px-8"
          >
            <HandWithdrawIcon />
            Retired
          </Body>
        ) : null}
        <LocalButton
          as={Link}
          className="font-bold"
          variant="secondary"
          href={`/stacks/${stack.id.toString()}`}
        >
          View Details
        </LocalButton>
      </div>
    </li>
  );
};

export default Stack;
