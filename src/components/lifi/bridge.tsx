"use client";

import type { Route, RouteExecutionUpdate, WidgetConfig } from "@lifi/widget";
import {
  ChainType,
  LiFiWidget,
  useWidgetEvents,
  WidgetEvent,
  WidgetSkeleton,
} from "@lifi/widget";
import { useEffect } from "react";
import { LiFiWrapper } from "./wrapper";
import { lifiConfig } from "./config";
import { Address, encodeFunctionData } from "viem";
import { useModal } from "../modal/context";
import { breadAbi } from "@/lib/abis/bread-abi";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { clientEnv } from "@/lib/env";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";

export default function Bridge({ userAddress }: { userAddress: Address }) {
  /*
  From LiFi Docs (https://docs.li.fi/widget/widget-events#list-of-events)
  To minimize unnecessary re-renders and prevent potential glitches in the main Widget component, please integrate the useWidgetEvents hook outside of the component where the main LiFiWidget is integrated.
  */
  const widgetEvents = useWidgetEvents();
  const { setModal } = useModal();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();

  useEffect(() => {
    const onRouteExecutionCompleted = async (route: Route) => {
      const recipientAddress = route.toAddress;

      if (recipientAddress !== userAddress) return;

      if (route.toToken.chainId !== 100 || route.toToken.symbol !== "xDAI")
        return;

      setModal({ type: "WALLET_FUNDING_STATUS", status: "loading" });

      try {
        const data = encodeFunctionData({
          abi: breadAbi,
          functionName: "mint",
          args: [userAddress],
        });

        const { hash } = await sendSponsoredTransaction(
          {
            to: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
            data,
            value: BigInt(route.toAmountMin),
          },
          { uiOptions: { showWalletUIs: false } }
        );

        setModal({ type: "WALLET_FUNDING_STATUS", status: "success" });

        void (await waitForTxReceipt(hash));
      } catch (error) {
        console.log("___ converting bridging to bread error __:", error);
        setModal({ type: "WALLET_FUNDING_STATUS", status: "error" });
      }
    };
    const onRouteExecutionFailed = (update: RouteExecutionUpdate) => {
      console.log("__ LIFI BRIDGE FIALED __", update.process, {
        error: update.process.error,
        message: update.process.message,
      });
    };

    widgetEvents.on(
      WidgetEvent.RouteExecutionCompleted,
      onRouteExecutionCompleted
    );
    widgetEvents.on(WidgetEvent.RouteExecutionFailed, onRouteExecutionFailed);
    widgetEvents.on(WidgetEvent.RouteExecutionStarted, () => {});

    return () => {
      widgetEvents.off(
        WidgetEvent.RouteExecutionCompleted,
        onRouteExecutionCompleted
      );
      widgetEvents.off(
        WidgetEvent.RouteExecutionFailed,
        onRouteExecutionFailed
      );
    };
  }, [widgetEvents]);

  return <LiFiMainWrapper address={userAddress} />;
}

function LiFiMainWrapper({ address }: { address: Address }) {
  const config: Partial<WidgetConfig> = {
    ...lifiConfig,
    toAddress: {
      address,
      chainType: ChainType.EVM,
      name: "Your stack address",
    },
  };

  return (
    <div>
      <LiFiWrapper fallback={<WidgetSkeleton config={config} />}>
        <LiFiWidget config={config} integrator="Stacks" />
      </LiFiWrapper>
    </div>
  );
}
