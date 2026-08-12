import LocalButton from "@/components/button";
import { Body, Heading3, LoginButton, useConnectedUser } from "@breadcoop/ui";
import {
  ArrowLeftIcon,
  ArrowsClockwiseIcon,
  CalendarIcon,
  Icon,
  LayoutIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { StackFormSchemaData } from "./schema";
import { savingCirclesAbi } from "../../../../lib/abis/saving-circles";
import {
  BREAD_TOKEN_ADDRESS,
  SAVING_CIRCLES_CONTRACT_ADDRESS,
} from "../../../../lib/constants";
import { encodeFunctionData, parseEther, parseEventLogs } from "viem";
import { useModal } from "@/components/modal/context";
import { sleep } from "@/utils/sleep";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useAutomaticClaims } from "@/hooks/use-automatic-claims";
import { simulateContract } from "@wagmi/core";
import { parseContractError } from "@/utils/parse-contract-error";
import { getIntervalById, splitIntervalId } from "@/utils/deposit-interval";
import { CREATE_ERRORS } from "@/lib/contract-errors";
import { getDefaultChainId } from "@/utils/chain";
import { formatAmount } from "@/utils/format-amount";

const parseCreateError = (error: unknown) =>
  parseContractError(
    error,
    CREATE_ERRORS,
    "Failed to create stack. Please try again."
  );

const StackOverviewForm = ({ onBack }: { onBack: () => void }) => {
  const modal = useModal();
  const form = useFormContext<StackFormSchemaData>();
  const depositInterval = form.watch("depositInterval");
  const interval = getIntervalById(depositInterval);
  const members = form.watch("members");
  const frequency = members ? `${members}x` : "-";
  const freqDeposit = form.watch("depositAmount") || 0;
  const total = (members || 0) * (freqDeposit || 0);
  const { user } = useConnectedUser();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { activate: enableAutomaticClaims } = useAutomaticClaims();

  const createStack = async (data: StackFormSchemaData) => {
    if (form.formState.isSubmitting) return;

    try {
      // This is just for typescript check. user is available at this point
      if (user.status !== "CONNECTED") return;
      // This is just for typescript check. interval is available at this point
      if (!interval) return;

      modal.setModal({
        type: "STACK_CREATION_INIT",
        name: data.name,
        status: "awaiting",
      });

      const circleArgs = {
        owner: user.address,
        currentIndex: BigInt(0),
        depositAmount: parseEther(String(data.depositAmount)),
        token: BREAD_TOKEN_ADDRESS,
        depositInterval: BigInt(interval.seconds),
        effectiveCircleStartTime: BigInt(0),
        circleEnd: BigInt(0),
      };

      // Simulate before opening Privy modal
      await simulateContract(wagmiConfig, {
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        abi: savingCirclesAbi,
        functionName: "create",
        args: [circleArgs],
        account: user.address,
        chainId: getDefaultChainId(),
      });

      const encodedData = encodeFunctionData({
        abi: savingCirclesAbi,
        functionName: "create",
        args: [circleArgs],
      });

      const sponsoredTx = sendSponsoredTransaction(
        { to: SAVING_CIRCLES_CONTRACT_ADDRESS, data: encodedData },
        { uiOptions: { showWalletUIs: false } }
      );

      modal.setModal({
        type: "STACK_CREATION_INIT",
        name: data.name,
        status: "approved",
      });

      const { hash } = await sponsoredTx;

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: 1,
        chainId: getDefaultChainId(),
      });

      const logs = parseEventLogs({
        abi: savingCirclesAbi,
        logs: receipt.logs,
        eventName: "CircleCreated",
      });

      const circleCreatedEvent = logs.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (log) => (log as any).eventName === "CircleCreated"
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newCircleId = (circleCreatedEvent as any).args.id as bigint;

      modal.setModal({
        type: "STACK_CREATION_INIT",
        name: data.name,
        status: "successful",
      });

      await enableAutomaticClaims(newCircleId, true);

      const parsedInterval = splitIntervalId(interval.id);
      const duration = `${data.members * parsedInterval[0]} ${parsedInterval[1]}`;

      const circle = {
        name: data.name,
        id: newCircleId.toString(),
        duration,
        deposit: data.depositAmount,
        total: data.members ** 2 * data.depositAmount,
        members: data.members,
      };

      await sleep(500);
      modal.setModal({ type: "STACK_CREATION_SUCCESS", circle });

      form.reset();
    } catch (error) {
      console.error("__ ERROR __", error);
      modal.setModal({
        type: "STACK_CREATION_FAILED",
        msg: parseCreateError(error),
      });
    }
  };

  return (
    <section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26] lg:bg-paper-main lg:border lg:border-blue-0">
      <header className="">
        <Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
          Overview
        </Heading3>
        <Body className="text-surface-grey">Please review your stacks.</Body>
      </header>
      <div className="flex flex-col gap-4 pb-4 border-b border-blue-0">
        <ReviewedRow
          RIcon={LayoutIcon}
          title="Name"
          body={form.watch("name") || "-"}
        />
        <ReviewedRow
          RIcon={CalendarIcon}
          title="Members deposit every"
          body={
            interval
              ? interval.label.endsWith("ly")
                ? interval.label.slice(0, -2)
                : interval.label
              : "-"
          }
          capitalize
        />
        <ReviewedRow
          RIcon={ArrowsClockwiseIcon}
          title="Deposit frequency"
          body={frequency}
        />
      </div>
      <div className="flex flex-col gap-2">
        <BreadRow
          label={
            <>
              <span className="capitalize">{depositInterval}</span> deposit
            </>
          }
          amount={freqDeposit}
        />
        <BreadRow label="Total Deposited per member" amount={total} colored />
      </div>
      <div className="px-6 py-3 bg-paper-1">
        <Body className="text-xs text-surface-grey-2">
          This Stacks group is not a regulated savings product.
        </Body>
        <Body className="text-xs text-surface-grey-2">
          The premium is provided on a discretionary basis with the Stack
          members having the final say on which claims are paid. Read the
          complete cover wording here.
        </Body>
      </div>
      <div className="flex flex-col gap-4">
        {user.status === "CONNECTED" ? (
          <LocalButton
            leftIcon={<SparkleIcon size={24} />}
            onClick={form.handleSubmit(createStack)}
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            Create Stack
          </LocalButton>
        ) : (
          <LoginButton app="stacks" status={user.status} />
        )}
        <LocalButton
          className="lg:hidden"
          variant="secondary"
          leftIcon={<ArrowLeftIcon size={24} />}
          onClick={onBack}
          type="button"
        >
          Back
        </LocalButton>
      </div>
    </section>
  );
};

function ReviewedRow({
  RIcon,
  title,
  body,
  capitalize,
}: {
  RIcon: Icon;
  title: string;
  body: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-start gap-2">
        {<RIcon size={24} className="fill-primary-blue" />}
        <Body className="text-surface-grey-2">{title}</Body>
      </div>
      <Body
        bold
        className={`text-surface-ink ${capitalize ? "capitalize" : ""}`}
      >
        {body}
      </Body>
    </div>
  );
}

function BreadRow({
  label,
  amount,
  colored,
}: {
  label: ReactNode;
  amount: string | number;
  colored?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <Body>{label}</Body>
      <div
        className={`p-1 shrink-0 border ${
          colored ? "border-system-green" : "border-paper-2"
        }`}
      >
        <Body bold>${formatAmount(Number(amount))}</Body>
      </div>
    </div>
  );
}

export default StackOverviewForm;
