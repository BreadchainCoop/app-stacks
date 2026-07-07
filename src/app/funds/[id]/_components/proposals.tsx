"use client";

import Countdown from "@/components/countdown";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { CollectiveFund } from "@/hooks/use-collective-fund";
import { useCollectiveMemberPosition } from "@/hooks/use-collective-member-position";
import {
  CollectiveProposal,
  useCollectiveProposals,
} from "@/hooks/use-collective-proposals";
import {
  COLLECTIVE_EXECUTE_ERRORS,
  COLLECTIVE_VOTE_ERRORS,
} from "@/lib/contract-errors";
import {
  PROPOSAL_STATE_LABELS,
  ProposalState,
  proposalExecutionDeadline,
  proposalVotingDeadline,
} from "@/lib/collective-state";
import { useMemberAliases } from "@/hooks/use-member-aliases";
import { formatAddress } from "@/utils/address";
import { Body, Chip, cn, formatBalance, Heading3 } from "@breadcoop/ui";
import Link from "next/link";
import { Address, formatEther } from "viem";
import { useCollectiveAction } from "./use-collective-action";

const STATE_CHIP_CLASSES: Record<ProposalState, string> = {
  [ProposalState.Active]: "border-primary-blue text-primary-blue",
  [ProposalState.Defeated]: "border-system-red text-system-red",
  [ProposalState.Passed]: "border-system-green text-system-green",
  [ProposalState.Executed]: "border-system-green text-system-green",
  [ProposalState.Expired]: "border-surface-grey text-surface-grey",
};

const Proposals = ({
  fundId,
  fund,
  member,
}: {
  fundId: bigint;
  fund: CollectiveFund;
  member: Address | undefined;
}) => {
  const { proposals, isLoading } = useCollectiveProposals(fundId, member);
  const { position } = useCollectiveMemberPosition(fundId, member);
  const proposers = proposals.map((p) => p.proposer);
  const aliases = useMemberAliases(proposers);

  // Newest first
  const orderedProposals = [...proposals].reverse();

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="border-b border-paper-2 pb-4">
        <Heading3 className="text-2xl">
          Proposals ({isLoading ? "-" : proposals.length})
        </Heading3>
      </header>
      {proposals.length === 0 && (
        <Body className="text-surface-grey">
          {isLoading
            ? "Loading proposals..."
            : "No proposals yet. Members can propose how to spend the pool."}
        </Body>
      )}
      <div className="*:mb-2 *:last:mb-0">
        {orderedProposals.map((proposal) => (
          <ProposalCard
            key={proposal.proposalId.toString()}
            fundId={fundId}
            fund={fund}
            proposal={proposal}
            member={member}
            memberIndex={position?.isMember ? position.memberIndex : undefined}
            proposerAlias={aliases[proposal.proposer.toLowerCase()]}
          />
        ))}
      </div>
    </section>
  );
};

function ProposalCard({
  fundId,
  fund,
  proposal,
  member,
  memberIndex,
  proposerAlias,
}: {
  fundId: bigint;
  fund: CollectiveFund;
  proposal: CollectiveProposal;
  member: Address | undefined;
  /** The connected member's roster index; undefined when not a member. */
  memberIndex: bigint | undefined;
  proposerAlias: string | null | undefined;
}) {
  const { setModal } = useModal();
  const { runCollectiveAction } = useCollectiveAction();

  const votingDeadline = proposalVotingDeadline({
    createdAt: proposal.createdAt,
    votingPeriod: fund.votingPeriod,
  });
  const executionDeadline = proposalExecutionDeadline({
    createdAt: proposal.createdAt,
    votingPeriod: fund.votingPeriod,
  });

  // Only members snapshotted into the electorate can vote, once, while the
  // proposal is still active.
  const canVote =
    proposal.state === ProposalState.Active &&
    memberIndex !== undefined &&
    memberIndex < proposal.electorate &&
    !proposal.hasVoted;

  const vote = (support: boolean) =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "collective",
      action: "vote",
      id: fundId,
      onConfirm: () =>
        runCollectiveAction({
          action: "vote",
          functionName: "vote",
          args: [fundId, proposal.proposalId, support],
          errors: COLLECTIVE_VOTE_ERRORS,
        }),
    });

  const execute = () =>
    setModal({
      type: "STACK_TX_INIT",
      stackType: "collective",
      action: "execute",
      id: fundId,
      amount: proposal.amount,
      onConfirm: () =>
        runCollectiveAction({
          action: "execute",
          functionName: "execute",
          args: [fundId, proposal.proposalId],
          errors: COLLECTIVE_EXECUTE_ERRORS,
          amount: proposal.amount,
        }),
    });

  return (
    <div className="bg-paper-1 py-3 px-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Body bold>Proposal #{proposal.proposalId.toString()}</Body>
        {proposal.state !== undefined && (
          <Chip
            className={cn(
              "bg-paper-main max-w-max hover:border-current",
              STATE_CHIP_CLASSES[proposal.state]
            )}
          >
            {PROPOSAL_STATE_LABELS[proposal.state]}
          </Chip>
        )}
      </div>
      {proposal.description && <Body>{proposal.description}</Body>}
      <div className="*:mb-1 *:last:mb-0">
        <DetailRow label="Proposed by">
          <Link
            href={`/account/${proposal.proposer}`}
            className="hover:text-primary-blue"
          >
            {proposerAlias || formatAddress(proposal.proposer)}
          </Link>
        </DetailRow>
        <DetailRow label="Recipient">
          <Link
            href={`/account/${proposal.recipient}`}
            className="hover:text-primary-blue"
          >
            {formatAddress(proposal.recipient)}
          </Link>
        </DetailRow>
        <DetailRow label="Amount">
          {formatBalance(+formatEther(proposal.amount), 2)} BREAD
        </DetailRow>
        <DetailRow label="Votes">
          {proposal.yesVotes.toString()} yes / {proposal.requiredYes.toString()}{" "}
          required · {proposal.noVotes.toString()} no
        </DetailRow>
        {proposal.state === ProposalState.Active && (
          <DetailRow label="Voting closes in">
            <Countdown targetSeconds={Number(votingDeadline)} />
          </DetailRow>
        )}
        {proposal.state === ProposalState.Passed && (
          <DetailRow label="Execute within">
            <Countdown targetSeconds={Number(executionDeadline)} />
          </DetailRow>
        )}
      </div>
      {(canVote || (proposal.isExecutable && member)) && (
        <div className="flex flex-col gap-2 md:flex-row">
          {canVote && (
            <>
              <LocalButton
                className="w-full font-bold"
                variant="positive"
                onClick={() => vote(true)}
              >
                Vote yes
              </LocalButton>
              <LocalButton
                className="w-full font-bold"
                variant="secondary"
                onClick={() => vote(false)}
              >
                Vote no
              </LocalButton>
            </>
          )}
          {proposal.isExecutable && member && (
            <LocalButton className="w-full font-bold" onClick={execute}>
              Execute
            </LocalButton>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Body className="flex items-center justify-between gap-2">
      <span className="text-surface-grey">{label}</span>
      <span className="font-bold text-right">{children}</span>
    </Body>
  );
}

export default Proposals;
