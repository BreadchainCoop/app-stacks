"use client";

import { KeyboardEvent, useRef, useState } from "react";
import { Address, isAddress } from "viem";
import { Body, cn } from "@breadcoop/ui";
import { UserCircleIcon, XIcon } from "@phosphor-icons/react";
import Input from "@/components/input";
import { useResolveInvitee } from "@/hooks/use-resolve-invitee";
import { useMemberAlias } from "@/hooks/use-member-aliases";
import { isAliasQuery, useUserSearch } from "@/hooks/use-user-search";
import { formatAddress } from "@/utils/address";

/** Someone chosen in a PersonPicker. */
export type PickedPerson = {
  address: Address;
  /** "@alias", an ENS name, or the truncated address */
  label: string;
  /** Soft warning to keep showing after selection (e.g. unused on-chain) */
  warning?: string;
};

type Option = PickedPerson & { disabled?: boolean };

const looksLikeEnsName = (value: string) =>
  value.includes(".") && !value.startsWith("0x");

/**
 * One field to choose a person by username (live search), ENS name or wallet
 * address. Address and ENS input go through useResolveInvitee, so its
 * safety checks apply: a contract wallet on Ethereum mainnet can't be picked,
 * and a wallet unused on this chain carries a warning.
 */
const PersonPicker = ({
  id,
  value,
  onChange,
  placeholder = "Username, name.eth or 0x…",
  exclude = [],
  excludeReason = "Already added",
  disabled,
}: {
  id: string;
  value: PickedPerson | null;
  onChange: (person: PickedPerson | null) => void;
  placeholder?: string;
  /** Addresses that can't be picked (shown, but disabled) */
  exclude?: readonly string[];
  excludeReason?: string;
  disabled?: boolean;
}) => {
  const [input, setInput] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = input.trim();
  const isDirect = isAddress(trimmed) || looksLikeEnsName(trimmed);
  const resolved = useResolveInvitee(isDirect ? trimmed : "");
  const search = useUserSearch(isDirect ? "" : trimmed);
  const directAlias = useMemberAlias(resolved.data?.address ?? undefined);

  const isExcluded = (address: string) =>
    exclude.some((a) => a.toLowerCase() === address.toLowerCase());

  let options: Option[] = [];
  let message: { text: string; tone: "muted" | "error" | "warning" } | null =
    null;

  if (!trimmed) {
    message = null;
  } else if (isDirect) {
    const data = resolved.data;
    if (resolved.isLoading) {
      message = { text: "Looking up…", tone: "muted" };
    } else if (data?.error) {
      message = { text: data.error, tone: "error" };
    } else if (data?.address && data.isContractOnMainnet) {
      message = {
        text: "This points to a smart-contract wallet on Ethereum that doesn't exist on this network, so funds sent to it would be lost. Ask for their wallet address on this network instead.",
        tone: "error",
      };
    } else if (data?.address) {
      const alias = directAlias.alias;
      options = [
        {
          address: data.address,
          label: alias
            ? `@${alias}`
            : (data.ensName ?? formatAddress(data.address)),
          warning: data.isUnusedOnChain
            ? "This wallet has never been used on this network. Double-check it's the right one."
            : undefined,
          disabled: isExcluded(data.address),
        },
      ];
    }
  } else if (!isAliasQuery(trimmed)) {
    message = {
      text: "Type at least 3 letters of a username, or paste a wallet address or ENS name.",
      tone: "muted",
    };
  } else if (!search.signedIn) {
    message = {
      text: "Sign in to search people by username. You can still paste a wallet address or ENS name.",
      tone: "muted",
    };
  } else if (search.isSearching) {
    message = { text: "Searching…", tone: "muted" };
  } else if (search.isError) {
    message = {
      text: "Search isn't available right now. Paste a wallet address or ENS name instead.",
      tone: "error",
    };
  } else if (search.data) {
    options = search.data.map((user) => ({
      address: user.address,
      label: `@${user.username}`,
      disabled: isExcluded(user.address),
    }));
    if (options.length === 0) {
      message = {
        text: "No one with that username. You can also paste a wallet address or ENS name.",
        tone: "muted",
      };
    }
  }

  const select = (option: Option) => {
    if (option.disabled) return;
    onChange({
      address: option.address,
      label: option.label,
      warning: option.warning,
    });
    setInput("");
    setActive(0);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (options.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(options[Math.min(active, options.length - 1)]);
    }
  };

  if (value) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 border border-paper-2 bg-paper-1 py-2 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <UserCircleIcon size={24} className="shrink-0 fill-primary-blue" />
            <div className="min-w-0">
              <Body bold className="truncate">
                {value.label}
              </Body>
              <Body className="text-xs text-surface-grey break-all">
                {value.address}
              </Body>
            </div>
          </div>
          <button
            type="button"
            aria-label="Choose someone else"
            className="shrink-0 p-1 text-surface-grey hover:text-surface-ink disabled:opacity-50"
            disabled={disabled}
            onClick={() => {
              onChange(null);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            <XIcon size={20} />
          </button>
        </div>
        {value.warning && (
          <Body className="text-xs text-system-warning">{value.warning}</Body>
        )}
      </div>
    );
  }

  const listId = `${id}-options`;

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={inputRef}
        id={id}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full font-normal text-surface-ink"
        autoComplete="off"
        role="combobox"
        aria-expanded={options.length > 0}
        aria-controls={listId}
        disabled={disabled}
      />
      {options.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="flex flex-col border border-paper-2 bg-paper-0"
        >
          {options.map((option, index) => (
            <li key={option.address} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={index === active}
                aria-disabled={option.disabled}
                disabled={option.disabled}
                onMouseEnter={() => setActive(index)}
                onClick={() => select(option)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 py-2 px-4 text-left",
                  index === active && !option.disabled && "bg-paper-1",
                  option.disabled && "cursor-not-allowed opacity-60"
                )}
              >
                <span className="min-w-0">
                  <Body bold className="truncate">
                    {option.label}
                  </Body>
                  <Body className="text-xs text-surface-grey">
                    {formatAddress(option.address)}
                  </Body>
                </span>
                {option.disabled && (
                  <Body className="shrink-0 text-xs text-surface-grey">
                    {excludeReason}
                  </Body>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {options.length === 1 && options[0].warning && (
        <Body className="text-xs text-system-warning">
          {options[0].warning}
        </Body>
      )}
      {message && (
        <Body
          className={cn(
            "text-xs",
            message.tone === "muted" && "text-surface-grey",
            message.tone === "error" && "text-system-red",
            message.tone === "warning" && "text-system-warning"
          )}
        >
          {message.text}
        </Body>
      )}
    </div>
  );
};

export default PersonPicker;
