"use client";

import { useMyCirclesList } from "@/hooks/use-user-circles-list";
import { FormattedDecimalNumber } from "@/components/bread-ui-kit/formatted-decimal-number";
import { NavAccountWidgetItem, useConnectedUser } from "@breadcoop/ui";
import { HandArrowDownIcon } from "@phosphor-icons/react";

const ClaimableWidget = () => {
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const { circles } = useMyCirclesList(address, true);

  let withdrawableAmount = 0;
  circles.forEach((circle) => {
    if (circle.canWithdraw && circle.withdrawAmount) {
      withdrawableAmount += circle.withdrawAmount;
    }
  });

  return (
    <>
      <NavAccountWidgetItem
        I={HandArrowDownIcon}
        label="Claimable"
        appIconColor="text-primary-blue"
      >
        <FormattedDecimalNumber
          className="text-core-orange"
          value={withdrawableAmount}
          withBreadIcon
          compact
        />
      </NavAccountWidgetItem>
    </>
  );
};

export default ClaimableWidget;
