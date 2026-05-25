import { Body, Heading3, Chip, formatBalance } from "@breadcoop/ui";
import { UsersIcon } from "./icons/users";
import { CoinIcon, CoinsIcon } from "./icons/coin";
import { CalendarIcon } from "./icons/calendar";
import LocalLiftedButton from "./lifted-button";
import Link from "next/link";
import { QuestionIcon } from "@phosphor-icons/react/ssr";
import ClaimButton from "./claim-button";
import { ICircleList, ICircleStatus } from "@/interfaces/circle";
import { formatEther } from "viem";
import DepositButton from "./deposit-button";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { parseCircleIntervalToDate } from "@/utils/stacks";
import { Database } from "@/lib/supabase";
import { useModal } from "./modal/context";

type StackMetadata = Database["public"]["Tables"]["stacks_metadata"]["Row"];

const completedStatuses: ICircleStatus[] = [
  "expired",
  "decommissioned",
  "finished",
];

const Stack = ({
  stack,
  stacksMap,
}: {
  stack: ICircleList;
  stacksMap: Record<string, StackMetadata>;
}) => {
  const { setModal } = useModal();
  const stackMeta = stacksMap[String(stack.id)];
  const depositAmount = formatEther(stack.depositAmount);
  const completedRounds =
    stack.status === "finished"
      ? stack.totalMember
      : Number(stack.completedRounds);
  const totalGoal =
    Number(depositAmount) * stack.totalMember * stack.totalMember;
  const totalDeposited =
    completedRounds * Number(depositAmount) * Number(stack.totalMember) +
    Number(formatEther(stack.totalPoolBalance || BigInt(0)));
  // const percentageDone = totalGoal > 0 ? (totalDeposited / totalGoal) * 100 : 0;
  let percentageDone = 0;
  if (
    totalDeposited !== 0 &&
    totalGoal !== 0 &&
    (stack.status === "in-progress" || stack.status === "finished")
  ) {
    percentageDone = (totalDeposited / totalGoal) * 100;
  }
  const terminalStatusLabel =
    stack.status === "failed"
      ? "Failed"
      : stack.status === "decommissioned"
        ? "Decommissioned"
        : stack.status === "expired"
          ? "Expired"
          : null;
  // const hasInactiveProgress = [
  //   "pending-start",
  //   "failed",
  //   "decommissioned",
  //   "expired",
  // ].includes(stack.status ?? "");

  const items = [
    {
      label: `${stack.totalMember} Members`,
      icon: <UsersIcon />,
      className: "",
    },
    {
      label: `Token: BREAD`,
      icon: <CoinIcon />,
      className: "hidden md:flex",
    },
    {
      label: `${formatBalance(Number(depositAmount) * stack.totalMember, 2)} BREAD ${
        parseCircleIntervalToDate(stack.depositInterval).label
      }`,
      icon: <CoinsIcon />,
      className: "",
    },
    {
      label: `Goal: ${formatBalance(totalGoal, 2)} BREAD`,
      icon: <CalendarIcon />,
      className: "hidden md:flex",
    },
  ];

  const statusMode = !stack.status
    ? undefined
    : stack.status === "expired" ||
        stack.status === "finished" ||
        stack.status === "decommissioned"
      ? ""
      : stack.status;

  console.log("__ STACK DETAILS __", stack.id, stack.status);

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
            {stack.status === "payment_due" ? (
              <Chip className="font-bold border-current! text-system-warning">
                Payment due
              </Chip>
            ) : stack.status === "failed" ? (
              <Chip className="font-bold border-current! text-system-red">
                Failed
              </Chip>
            ) : stack.isMember && !completedStatuses.includes(stack.status!) ? (
              <Chip className="border-system-green text-system-green bg-paper-main max-w-max hover:border-current">
                Member
              </Chip>
            ) : null}
            {/* {stack.isMember && (
              <Chip className="border-system-green text-system-green bg-paper-main max-w-max hover:border-current">
                Member
              </Chip>
            )}
            {stack.status === "payment_due" && (
              <Chip className="font-bold border-current! text-system-warning">
                Payment due
              </Chip>
            )}
            {stack.status === "failed" && (
              <Chip className="font-bold border-current! text-system-red">
                Failed
              </Chip>
            )} */}
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
          {/* <div
            className={`w-full h-3.5 p-0.75 ${
              hasInactiveProgress ? "bg-paper-2" : "bg-paper-main"
            }`}
          >
            <div
              className={`h-full ${
                stack.status === "finished"
                  ? "bg-system-green"
                  : hasInactiveProgress
                    ? "bg-surface-grey"
                    : "bg-primary-blue"
              }`}
              style={{
                width: `${hasInactiveProgress ? 0 : percentageDone}%`,
              }}
            />
          </div> */}
        </div>
        <div className="w-full max-w-max flex flex-col xl:hidden">
          <p className="text-h2 m-0 text-2xl leading-6 text-surface-grey-2">
            ${formatBalance(totalDeposited, 2)}
          </p>
          <Body className="flex items-center justify-start gap-1 text-surface-grey">
            <span className="text-[0.625rem]">Total BREAD stacked</span>
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
        {stack.status === "claimable" ? (
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
            roundsLeft={BigInt(stack.totalMember - 1) - stack.currentIndex}
            nextDepositAddress={stack.token}
          />
        ) : stack.status === "payment_due" ? (
          <DepositButton
            circleId={stack.id}
            tokenAddress={stack.token}
            width="full"
            leftIcon={<HandWithdrawIcon />}
            amount={stack.depositAmount}
          />
        ) : stack.status === "failed" && stack.isMember ? (
          <LocalLiftedButton
            className="font-bold"
            preset="destructive"
            width="full"
            onClick={() => setModal({ type: "STACK_FAILED", id: stack.id })}
          >
            Claim last deposits
          </LocalLiftedButton>
        ) : statusMode === "" ? (
          <Body
            bold
            className="flex items-center justify-center gap-2 bg-surface-grey text-surface-ink opacity-50 py-4 px-8"
          >
            <HandWithdrawIcon />
            Retired
          </Body>
        ) : null}
        <Link
          className="lifted-button-container"
          href={`/stacks/${stack.id.toString()}`}
        >
          <LocalLiftedButton className="font-bold" preset="secondary">
            View Details
          </LocalLiftedButton>
        </Link>
      </div>
    </li>
  );
};

export default Stack;
