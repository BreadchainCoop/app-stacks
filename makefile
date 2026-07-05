.PHONY: deploy prepare-deployer check-deployment install-contract-deps anvil update-env update-contract-submodules update-saving-circles-dev reset-supabase local-supabase-setup start-local warp time-increase mine timestamp time-reset fund-all

ANVIL_ACCOUNTS := 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 \
	0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
	0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC \
	0x90F79bf6EB2c4f870365E785982E1f101E93b906 \
	0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65 \
	0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc \
	0x976EA74026E726554dB657fA54763abd0C3a0aa9 \
	0x14dC79964da2C08b23698B3D3cc7Ca32193d9955 \
	0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f \
	0xa0Ee7A142d267C1f36714E4a8F75612F20a79720

# Default values
RPC_URL ?= http://localhost:8545
# first anvil's account
PRIVATE_KEY ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
ADMIN_ADDRESS ?= 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

# Dedicated virgin deployer for deterministic local addresses (NOT a secret —
# local-only key). With the nonce forced to 0 before deploying, the six CREATEs
# in Deploy.s.sol land on fixed addresses (nonces 0..5), baked as the
# NEXT_PUBLIC_LOCAL_* defaults in src/lib/env.ts. They only change if
# Deploy.s.sol adds/reorders deployments — check-deployment fails loudly then.
LOCAL_DEPLOYER_PK ?= 0x5ca1ab1e5ca1ab1e5ca1ab1e5ca1ab1e5ca1ab1e5ca1ab1e5ca1ab1e5ca1ab1e
LOCAL_DEPLOYER_ADDRESS ?= 0xdcE4807F815737616B6150c5A483AeC83C4FC5a9
EXPECTED_BREAD_TOKEN := 0x347eA3E53Bd44bDD16Fe7CeF396a19806E12B686
EXPECTED_SAVING_CIRCLES_PROXY := 0x7E2F05576D57cfa6617172ab3Df276fDfa02fA3e
EXPECTED_AUTOMATIC_SAVING_CIRCLES := 0x565f8CD37c6085831b15A36D51c6b15d48a8FEde
EXPECTED_SAVING_CIRCLES_VIEWER := 0xea06eDD211228a9eB7Af1Da186081ec00Ca7c009
OZ_UPGRADEABLE_REENTRANCY_COMMIT ?= 5c4c29275d02e06265ce1cfcad5a420b58a5ca02
SAVING_CIRCLES_BRANCH ?= dev
SOLC_OPTIMIZER_RUNS ?= 200

anvil:
	anvil --fork-url https://rpc.gnosischain.com --chain-id 31337 --block-time 5

anvil-reset:
	@cast rpc anvil_reset --rpc-url $(RPC_URL)
	@echo "✓ Reset fork to fresh state (run 'make reset-nonces' if nonces are still off)"

reset-nonces:
	@echo "Resetting nonces for all Anvil accounts..."
	@for account in $(ANVIL_ACCOUNTS); do \
		cast rpc anvil_setNonce $$account 0 --rpc-url $(RPC_URL) > /dev/null; \
		echo "✓ Reset nonce for $$account"; \
	done
	@echo "✓ All nonces reset successfully"

install-contract-deps:
	cd contracts && forge install

# Fund the deterministic deployer and force nonce 0 regardless of the forked
# Gnosis state, so CREATE addresses always match the EXPECTED_* values.
prepare-deployer:
	@echo "Preparing deterministic deployer $(LOCAL_DEPLOYER_ADDRESS)..."
	@cast rpc anvil_setBalance $(LOCAL_DEPLOYER_ADDRESS) 0x21E19E0C9BAB2400000 --rpc-url $(RPC_URL) > /dev/null
	@cast rpc anvil_setNonce $(LOCAL_DEPLOYER_ADDRESS) 0 --rpc-url $(RPC_URL) > /dev/null
	@echo "✓ Deployer funded, nonce reset to 0"

deploy: prepare-deployer
	cd contracts && \
	export RPC_URL=$(RPC_URL) && \
	export PRIVATE_KEY=$(LOCAL_DEPLOYER_PK) && \
	export ADMIN_ADDRESS=$(ADMIN_ADDRESS) && \
	forge script script/Deploy.s.sol:Deploy \
		--optimize \
		--optimizer-runs $(SOLC_OPTIMIZER_RUNS) \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--private-key $(LOCAL_DEPLOYER_PK) \
		--legacy
	$(MAKE) update-env
	$(MAKE) check-deployment

# Sanity-check the deployment JSON against the deterministic addresses baked
# into src/lib/env.ts (used by the deployed dev/demo sites in local mode).
check-deployment:
	@ok=1; \
	for entry in \
		"breadToken:$(EXPECTED_BREAD_TOKEN)" \
		"savingCirclesProxy:$(EXPECTED_SAVING_CIRCLES_PROXY)" \
		"automaticSavingCircles:$(EXPECTED_AUTOMATIC_SAVING_CIRCLES)" \
		"savingCirclesViewer:$(EXPECTED_SAVING_CIRCLES_VIEWER)"; do \
		key=$${entry%%:*}; expected=$${entry##*:}; \
		actual=$$(jq -r ".$$key" contracts/out/SAVING_CIRCLES_DEPLOYMENT.json); \
		if [ "$$(echo $$actual | tr '[:upper:]' '[:lower:]')" != "$$(echo $$expected | tr '[:upper:]' '[:lower:]')" ]; then \
			echo "✗ $$key drifted: expected $$expected, got $$actual"; ok=0; \
		fi; \
	done; \
	if [ "$$ok" != "1" ]; then \
		echo "Error: deterministic local addresses drifted (did Deploy.s.sol add/reorder deployments?)."; \
		echo "Regenerate the EXPECTED_* values above and the NEXT_PUBLIC_LOCAL_* defaults in src/lib/env.ts."; \
		exit 1; \
	fi; \
	echo "✓ Deployment matches the deterministic local addresses"

update-env:
	@echo "Updating .env.local with deployed contract addresses..."
	@if [ ! -f contracts/out/SAVING_CIRCLES_DEPLOYMENT.json ]; then \
		echo "Error: contracts/out/SAVING_CIRCLES_DEPLOYMENT.json not found"; \
		exit 1; \
	fi
	@if [ ! -f .env.local ]; then \
		echo "Error: .env.local not found"; \
		exit 1; \
	fi
	$(eval BREAD_TOKEN := $(shell jq -r '.breadToken' contracts/out/SAVING_CIRCLES_DEPLOYMENT.json))
	$(eval SAVING_CIRCLES_PROXY := $(shell jq -r '.savingCirclesProxy' contracts/out/SAVING_CIRCLES_DEPLOYMENT.json))
	$(eval SAVING_CIRCLES_VIEWER := $(shell jq -r '.savingCirclesViewer' contracts/out/SAVING_CIRCLES_DEPLOYMENT.json))
	$(eval AUTOMATIC_SAVING_CIRCLES := $(shell jq -r '.automaticSavingCircles' contracts/out/SAVING_CIRCLES_DEPLOYMENT.json))
	$(eval CREATION_BLOCK := $(shell cast block latest --rpc-url $(RPC_URL) | grep number | awk '{print $$2}'))
	@if [ -z "$(BREAD_TOKEN)" ] || [ "$(BREAD_TOKEN)" = "null" ]; then \
		echo "Error: Could not parse breadToken from JSON file"; \
		exit 1; \
	fi
	@if [ -z "$(SAVING_CIRCLES_PROXY)" ] || [ "$(SAVING_CIRCLES_PROXY)" = "null" ]; then \
		echo "Error: Could not parse savingCirclesProxy from JSON file"; \
		exit 1; \
	fi
	@if [ -z "$(SAVING_CIRCLES_VIEWER)" ] || [ "$(SAVING_CIRCLES_VIEWER)" = "null" ]; then \
		echo "Error: Could not parse savingCirclesViewer from JSON file"; \
		exit 1; \
	fi
	@if [ -z "$(AUTOMATIC_SAVING_CIRCLES)" ] || [ "$(AUTOMATIC_SAVING_CIRCLES)" = "null" ]; then \
		echo "Error: Could not parse automaticSavingCircles from JSON file"; \
		exit 1; \
	fi
	@sed -i.bak 's|^NEXT_PUBLIC_BREAD_TOKEN_ADDRESS=.*|NEXT_PUBLIC_BREAD_TOKEN_ADDRESS=$(BREAD_TOKEN)|' .env.local
	@sed -i.bak 's|^NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS=$(SAVING_CIRCLES_PROXY)|' .env.local
	@sed -i.bak 's|^NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS=$(SAVING_CIRCLES_VIEWER)|' .env.local
	@sed -i.bak 's|^NEXT_PUBLIC_AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS=$(AUTOMATIC_SAVING_CIRCLES)|' .env.local
	@sed -i.bak 's|^NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK=.*|NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK=$(CREATION_BLOCK)|' .env.local
	@rm -f .env.local.bak
	@echo "✓ Updated .env.local successfully with contract addresses and creation block $(CREATION_BLOCK)"

update-contract-submodules:
	git submodule sync --recursive && \
	git submodule update --init --recursive
	@# Recover any submodule with invalid HEAD or missing refs
	@for submodule in $$(git config --file .gitmodules --get-regexp path | awk '{print $$2}'); do \
		head_file=".git/modules/$$submodule/HEAD"; \
		if [ -f "$$head_file" ] && grep -q "refs/heads/.invalid" "$$head_file"; then \
			echo "Detected invalid $$submodule HEAD; reinitializing..."; \
			git submodule deinit -f "$$submodule" || true; \
			rm -rf ".git/modules/$$submodule"; \
			rm -rf "$$submodule"; \
			git submodule update --init "$$submodule"; \
		elif ! git -C "$$submodule" rev-parse --verify HEAD >/dev/null 2>&1; then \
			echo "Detected broken $$submodule checkout; reinitializing..."; \
			git submodule deinit -f "$$submodule" || true; \
			rm -rf ".git/modules/$$submodule"; \
			rm -rf "$$submodule"; \
			git submodule update --init "$$submodule"; \
		fi; \
	done
	git -C contracts/lib/openzeppelin-contracts-upgradeable fetch origin master && \
	git -C contracts/lib/openzeppelin-contracts-upgradeable checkout $(OZ_UPGRADEABLE_REENTRANCY_COMMIT)
	@test -f contracts/lib/openzeppelin-contracts-upgradeable/contracts/utils/ReentrancyGuardUpgradeable.sol || \
		( echo "Error: missing contracts/lib/openzeppelin-contracts-upgradeable/contracts/utils/ReentrancyGuardUpgradeable.sol after checkout $(OZ_UPGRADEABLE_REENTRANCY_COMMIT)"; exit 1 )
	git -C contracts/lib/saving-circles fetch origin $(SAVING_CIRCLES_BRANCH) && \
	git -C contracts/lib/saving-circles checkout $(SAVING_CIRCLES_BRANCH) && \
	git -C contracts/lib/saving-circles pull --ff-only origin $(SAVING_CIRCLES_BRANCH)

update-saving-circles-dev:
	git submodule update --init contracts/lib/saving-circles && \
	git -C contracts/lib/saving-circles fetch origin $(SAVING_CIRCLES_BRANCH) && \
	git -C contracts/lib/saving-circles checkout $(SAVING_CIRCLES_BRANCH) && \
	git -C contracts/lib/saving-circles pull --ff-only origin $(SAVING_CIRCLES_BRANCH)

# Resets the LOCAL supabase instance (supabase CLI): drops and re-applies
# supabase/migrations plus the permissive local RLS seed (local-rls.sql).
# Targets the CLI's localhost stack by construction — never a hosted project.
# Supabase is OPTIONAL for local mode (stack names / invite tracking degrade
# gracefully without it), so this only warns when it's unavailable.
reset-supabase:
	@if ! command -v supabase > /dev/null; then \
		echo "⚠ supabase CLI not installed — skipping local supabase reset (stack names / invite tracking stay disabled)"; \
	elif ! supabase db reset; then \
		echo "⚠ local supabase not running — skipping reset (run 'make local-supabase-setup' to enable stack names / invite tracking)"; \
	fi

# First-time setup (optional): start the local supabase stack and apply
# schema + RLS. Requires the supabase CLI and Docker. Local mode works without
# this — you just lose stack names and invite tracking.
local-supabase-setup:
	supabase start
	supabase db reset

# Make sure to start a new anvil instance before running this
start-local:
	$(MAKE) update-saving-circles-dev
	$(MAKE) reset-supabase
	rm -rf contracts/broadcast contracts/cache contracts/out
	$(MAKE) deploy
	pnpm run dev

# Time manipulation commands for Anvil
mine:
	@cast rpc evm_mine --rpc-url $(RPC_URL)
	@echo "✓ Mined 1 block"

timestamp:
	@echo "Current block timestamp:"
	@cast block latest --rpc-url $(RPC_URL) | grep timestamp

warp:
	@if [ -z "$(TIMESTAMP)" ]; then \
		echo "Error: TIMESTAMP parameter required"; \
		echo "Usage: make warp TIMESTAMP=1735689600"; \
		exit 1; \
	fi
	@cast rpc evm_setNextBlockTimestamp $(TIMESTAMP) --rpc-url $(RPC_URL)
	@cast rpc evm_mine --rpc-url $(RPC_URL)
	@echo "✓ Warped to timestamp $(TIMESTAMP)"

time-increase:
	@if [ -z "$(SECONDS)" ]; then \
		echo "Error: SECONDS parameter required"; \
		echo "Usage: make time-increase SECONDS=86400"; \
		exit 1; \
	fi
	@cast rpc evm_increaseTime $(SECONDS) --rpc-url $(RPC_URL)
	@cast rpc evm_mine --rpc-url $(RPC_URL)
	@echo "✓ Increased time by $(SECONDS) seconds"

time-reset:
	@echo "Resetting to current time..."
	@cast rpc evm_setNextBlockTimestamp $$(date +%s) --rpc-url $(RPC_URL)
	@cast rpc evm_mine --rpc-url $(RPC_URL)
	@echo "✓ Reset to current timestamp: $$(date +%s)"

eth ?= __unset__
bread ?= __unset__

FUND_WALLET_ADDRESS := $(filter-out fund-wallet, $(MAKECMDGOALS))

# Fund one or more wallets with ETH and/or BREAD on the local Anvil chain.
# Pass any number of 0x addresses; the amounts apply to each one.
#   make fund-wallet 0xAddr1 [0xAddr2 ...]   # 100 ETH + 100 BREAD each (default)
#   make fund-wallet 0xAddr1 0xAddr2 eth=50  # 50 ETH each, no BREAD
#   make fund-wallet 0xAddr1 bread=200       # 200 BREAD each, no ETH
# Note: eth= and bread= are mutually exclusive — pass neither to fund both.
fund-wallet:
	@if [ -z "$(FUND_WALLET_ADDRESS)" ]; then \
		echo "Error: wallet address required"; \
		echo "Usage: make fund-wallet 0xAddr1 [0xAddr2 ...] [eth=100] [bread=100]"; \
		exit 1; \
	fi
	@BREAD_TOKEN=$$(jq -r '.breadToken' contracts/out/SAVING_CIRCLES_DEPLOYMENT.json); \
	FUND_ETH=0; FUND_BREAD=0; \
	if [ "$(eth)" = "__unset__" ] && [ "$(bread)" = "__unset__" ]; then \
		FUND_ETH=100; FUND_BREAD=100; \
	elif [ "$(eth)" != "__unset__" ]; then \
		FUND_ETH=$(eth); \
	elif [ "$(bread)" != "__unset__" ]; then \
		FUND_BREAD=$(bread); \
	fi; \
	ETH_WEI_HEX=""; TOKEN_WEI=""; \
	if [ "$$FUND_ETH" != "0" ]; then ETH_WEI_HEX=$$(printf '0x%x' $$(cast to-wei $$FUND_ETH)); fi; \
	if [ "$$FUND_BREAD" != "0" ]; then TOKEN_WEI=$$(cast to-wei $$FUND_BREAD); fi; \
	for WALLET in $(FUND_WALLET_ADDRESS); do \
		echo "Funding $$WALLET..."; \
		if [ "$$FUND_ETH" != "0" ]; then \
			cast rpc anvil_setBalance $$WALLET $$ETH_WEI_HEX --rpc-url $(RPC_URL) > /dev/null; \
			echo "✓ Set ETH balance to $$FUND_ETH ETH"; \
		fi; \
		if [ "$$FUND_BREAD" != "0" ]; then \
			cast send $$BREAD_TOKEN \
				"transfer(address,uint256)" \
				$$WALLET $$TOKEN_WEI \
				--rpc-url $(RPC_URL) \
				--private-key $(PRIVATE_KEY) > /dev/null; \
			echo "✓ Transferred $$FUND_BREAD BREAD to $$WALLET"; \
		fi; \
		echo "Balances for $$WALLET:"; \
		ETH_BAL=$$(cast balance $$WALLET --rpc-url $(RPC_URL) --ether); \
		BREAD_BAL=$$(cast call $$BREAD_TOKEN 'balanceOf(address)' $$WALLET --rpc-url $(RPC_URL) | cast --to-dec | cast from-wei); \
		echo "  ETH:   $$ETH_BAL ETH"; \
		echo "  BREAD: $$BREAD_BAL BREAD"; \
		echo ""; \
	done

# Fund all 10 Anvil dev accounts (100 ETH + 100 BREAD each).
fund-all:
	@$(MAKE) fund-wallet $(ANVIL_ACCOUNTS)

0x%:
	@:
