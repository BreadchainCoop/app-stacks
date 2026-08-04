/* Install a test wallet into a Playwright browser context:
 *   - expose ONE Node-side signer as window.__stacksWallet (the private key
 *     stays in Node; the page only ever gets a proxy)
 *   - inject an EIP-1193 window.ethereum shim that forwards every call to it
 *   - announce it over EIP-6963 and preseed wagmi's store so the app
 *     auto-reconnects with zero clicks and no wallet prompt
 *
 * The app must be running with NEXT_PUBLIC_E2E_WALLET=true (see src/lib/e2e.ts)
 * so it derives the connected user from wagmi instead of Privy.
 */
const RDNS = "coop.bread.stackstestwallet";
const NAME = "Stacks Test Wallet";

/**
 * @param context  Playwright BrowserContext
 * @param signer   a signer from lib.cjs (`{ account, handle }`)
 * @param chainId  chain the shim reports
 */
async function installWallet(context, signer, chainId) {
  // The only bridge to the key. The page calls window.__stacksWallet(payload).
  await context.exposeFunction("__stacksWallet", (payload) =>
    signer.handle(payload.method, payload.params || [])
  );

  await context.addInitScript(
    ({ rdns, name, chainIdHex }) => {
      const listeners = {};
      const emit = (event, ...args) =>
        (listeners[event] || []).forEach((fn) => fn(...args));

      const provider = {
        isMetaMask: true,
        _isStacksTestShim: true,
        isConnected: () => true,
        request: ({ method, params = [] }) =>
          window.__stacksWallet({ method, params }),
        send: (method, params) => provider.request({ method, params }),
        sendAsync: (payload, cb) =>
          provider
            .request(payload)
            .then((result) => cb(null, { id: payload.id, result }))
            .catch((err) => cb(err)),
        on(event, fn) {
          (listeners[event] = listeners[event] || []).push(fn);
          return this;
        },
        removeListener(event, fn) {
          listeners[event] = (listeners[event] || []).filter((f) => f !== fn);
          return this;
        },
        removeAllListeners() {
          for (const key in listeners) listeners[key] = [];
          return this;
        },
      };

      try {
        Object.defineProperty(window, "ethereum", {
          value: provider,
          configurable: true,
          writable: true,
        });
      } catch {
        window.ethereum = provider;
      }

      const announce = () =>
        window.dispatchEvent(
          new CustomEvent("eip6963:announceProvider", {
            detail: Object.freeze({
              info: {
                uuid: "22222222-2222-2222-2222-222222222222",
                name,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="%232f6fed"/></svg>',
                rdns,
              },
              provider,
            }),
          })
        );
      window.addEventListener("eip6963:requestProvider", announce);
      announce();
      setTimeout(() => emit("connect", { chainId: chainIdHex }), 0);
    },
    { rdns: RDNS, name: NAME, chainIdHex: "0x" + chainId.toString(16) }
  );

  // Preseed wagmi so reconnectOnMount picks the shim up — without this there
  // is nothing for wagmi to reconnect to and the app stays logged out.
  await context.addInitScript(
    ({ address, id, name, chainId }) => {
      try {
        localStorage.setItem("wagmi.recentConnectorId", JSON.stringify(id));
        localStorage.setItem(
          "wagmi.store",
          JSON.stringify({
            state: {
              chainId,
              current: id,
              connections: {
                __type: "Map",
                value: [
                  [
                    id,
                    {
                      accounts: [address],
                      chainId,
                      connector: { id, name, type: "injected", uid: id },
                    },
                  ],
                ],
              },
            },
            version: 2,
          })
        );
      } catch {}
    },
    { address: signer.account.address, id: RDNS, name: NAME, chainId }
  );
}

module.exports = { installWallet, RDNS, NAME };
