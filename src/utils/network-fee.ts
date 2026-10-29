import {
  Address,
  BaseError,
  Chain,
  Client,
  Hex,
  InsufficientFundsError,
  Transport,
} from "viem";
import { estimateGas, getBalance, getGasPrice } from "viem/actions";

/**
 * The sender can't pay a transaction's network fee. Its message names the
 * chain and its gas token, so parseContractError shows it as is.
 */
export class InsufficientGasError extends Error {
  name = "InsufficientGasError";
}

/** viem's reading of a wallet or node refusing a send the sender can't pay for. */
export const isInsufficientFundsError = (error: unknown): boolean =>
  error instanceof BaseError &&
  error.walk((e) => e instanceof InsufficientFundsError) !== null;

/**
 * Throws InsufficientGasError when `account` can't pay the network fee of a
 * transaction it is about to send. For the senders where the user pays gas
 * (no sponsorship), checked before the wallet opens: wallets report a short
 * balance each in their own words, or only inside their own dialog, and
 * Nimiq Pay's errors are undocumented.
 *
 * If the fee can't be estimated the send goes ahead, so a revert still
 * surfaces as the contract's own error. A send carrying the gas token itself
 * is skipped too: there a short balance is about the amount, not the fee.
 */
export const assertCanPayGas = async (
  client: Client<Transport, Chain>,
  {
    account,
    to,
    data,
    value,
  }: { account: Address; to: Address; data?: Hex; value?: bigint }
) => {
  if (value) return;

  try {
    const [gas, gasPrice, balance] = await Promise.all([
      estimateGas(client, { account, to, data }),
      getGasPrice(client),
      getBalance(client, { address: account }),
    ]);

    if (balance >= gas * gasPrice) return;
  } catch (error) {
    // A node that prices the estimate refuses it outright on a short balance
    if (!isInsufficientFundsError(error)) return;
  }

  // The currency's name rather than its symbol: Gnosis's symbol is "XDAI"
  const { name, nativeCurrency } = client.chain;

  throw new InsufficientGasError(
    `Not enough ${nativeCurrency.name} on ${name} to cover the network fee. Add a little ${nativeCurrency.name} to your wallet and try again.`
  );
};
