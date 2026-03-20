import LocalLiftedButton from "@/components/lifted-button";
import {
  Body,
  Heading3,
  LoginButton,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
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
import { SECONDS_PER_DAY } from "@/utils/solidity";
import { useModal } from "@/components/modal/context";
import { sleep } from "@/utils/sleep";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { simulateContract } from "@wagmi/core";
import { parseContractError } from "@/utils/parse-contract-error";

const CREATE_ERRORS: Record<string, string> = {
  TokenNotAllowed: "The token is not allowed for this circle.",
  InvalidDepositInterval: "The deposit interval is invalid.",
  InvalidDepositAmount: "The deposit amount is invalid.",
  InvalidOwner: "Invalid owner address.",
  AlreadyExists: "A circle with this ID already exists.",
};

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
  const members = form.watch("members");
  const frequency = members ? `${members}x` : "-";
  const freqDeposit = form.watch("depositAmount") || 0;
  const total = (members || 0) * (freqDeposit || 0);
  const { user } = useConnectedUser();
  const { sendSponsoredTransaction } = useSponsoredTx();

  const createStack = async (data: StackFormSchemaData) => {
    try {
      // This is just for typescript check. user is available at this point
      if (user.status !== "CONNECTED") return;

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
        depositInterval:
          SECONDS_PER_DAY * BigInt(data.depositInterval === "weekly" ? 7 : 30),
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

      const circle = {
        name: data.name,
        id: newCircleId.toString(),
        duration:
          `${data.members} ${data.depositInterval.slice(0, -2)}${data.members === 1 ? "" : "s"}`.trim(),
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
          body={form.watch("depositInterval")?.slice(0, -2) || "-"}
          capitalize
        />
        <ReviewedRow
          RIcon={ArrowsClockwiseIcon}
          title="Deposit frequency"
          body={frequency}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Body className="text-sm text-surface-grey">1 BREAD = 1 USD</Body>
        <BreadRow
          label={
            <>
              <span className="capitalize">{depositInterval}</span> deposit
            </>
          }
          amount={freqDeposit}
        />
        <BreadRow
          label="Total Stacked per member"
          amount={total.toFixed(2)}
          colored
        />
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
          <LocalLiftedButton
            width="full"
            leftIcon={<SparkleIcon size={24} />}
            onClick={form.handleSubmit(createStack)}
            type="submit"
          >
            Create Stack
          </LocalLiftedButton>
        ) : (
          <LoginButton app="stacks" status={user.status} />
        )}
        <LocalLiftedButton
          className="lg:hidden"
          preset="secondary"
          width="full"
          leftIcon={<ArrowLeftIcon size={24} />}
          onClick={onBack}
          type="button"
        >
          Back
        </LocalLiftedButton>
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
        <Logo size={24} variant="square" text={`${amount} BREAD`} />
      </div>
    </div>
  );
}

export default StackOverviewForm;
