import { useConnectedUser } from "@breadcoop/ui";

/** True when the connected user is the owner of `address`. */
export const useIsOwnAddress = (address: string) => {
  const { user } = useConnectedUser();

  return (
    (user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") &&
    user.address.toLowerCase() === address.toLowerCase()
  );
};
