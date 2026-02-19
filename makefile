.PHONY: deploy anvil update-env update-contract-submodules update-saving-circles-dev warp time-increase mine timestamp time-reset

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

deploy:
	cd contracts && \
	export RPC_URL=$(RPC_URL) && \
	export PRIVATE_KEY=$(PRIVATE_KEY) && \
	export ADMIN_ADDRESS=$(ADMIN_ADDRESS) && \
	forge install && \
	forge script script/Deploy.s.sol:Deploy \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--private-key $(PRIVATE_KEY) \
		--legacy
	$(MAKE) update-env

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
	@sed -i.bak 's|^NEXT_PUBLIC_BREAD_TOKEN_ADDRESS=.*|NEXT_PUBLIC_BREAD_TOKEN_ADDRESS=$(BREAD_TOKEN)|' .env.local
	@sed -i.bak 's|^NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS=$(SAVING_CIRCLES_PROXY)|' .env.local
	@sed -i.bak 's|^NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS=$(SAVING_CIRCLES_VIEWER)|' .env.local
	@sed -i.bak 's|^NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK=.*|NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_CREATION_BLOCK=$(CREATION_BLOCK)|' .env.local
	@rm -f .env.local.bak
	@echo "✓ Updated .env.local successfully with contract addresses and creation block $(CREATION_BLOCK)"

update-contract-submodules:
	@# Recover from broken saving-circles submodule state (e.g. HEAD -> refs/heads/.invalid)
	@if [ -f .git/modules/contracts/lib/saving-circles/HEAD ] && \
		grep -q "refs/heads/.invalid" .git/modules/contracts/lib/saving-circles/HEAD; then \
		echo "Detected invalid saving-circles submodule HEAD; reinitializing..."; \
		git submodule deinit -f contracts/lib/saving-circles; \
		rm -rf .git/modules/contracts/lib/saving-circles; \
		rm -rf contracts/lib/saving-circles; \
	fi
	git submodule sync --recursive && \
	git submodule update --init --recursive && \
	git submodule update --remote --merge && \
	git -C contracts/lib/saving-circles fetch origin dev && \
	git -C contracts/lib/saving-circles checkout dev && \
	git -C contracts/lib/saving-circles pull --ff-only origin dev

update-saving-circles-dev:
	git submodule update --init contracts/lib/saving-circles && \
	git -C contracts/lib/saving-circles fetch origin dev && \
	git -C contracts/lib/saving-circles checkout dev && \
	git -C contracts/lib/saving-circles pull --ff-only origin dev

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

fund-wallet:
	@if [ -z "$(FUND_WALLET_ADDRESS)" ]; then \
		echo "Error: wallet address required"; \
		echo "Usage: make fund-wallet 0xYourAddress [eth=100] [bread=100]"; \
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
	if [ "$$FUND_ETH" != "0" ]; then \
		ETH_WEI_HEX=$$(printf '0x%x' $$(cast to-wei $$FUND_ETH)); \
		cast rpc anvil_setBalance $(FUND_WALLET_ADDRESS) $$ETH_WEI_HEX --rpc-url $(RPC_URL) > /dev/null; \
		echo "✓ Set ETH balance to $$FUND_ETH ETH"; \
	fi; \
	if [ "$$FUND_BREAD" != "0" ]; then \
		TOKEN_WEI=$$(cast to-wei $$FUND_BREAD); \
		cast send $$BREAD_TOKEN \
			"transfer(address,uint256)" \
			$(FUND_WALLET_ADDRESS) $$TOKEN_WEI \
			--rpc-url $(RPC_URL) \
			--private-key $(PRIVATE_KEY) > /dev/null; \
		echo "✓ Transferred $$FUND_BREAD BREAD to $(FUND_WALLET_ADDRESS)"; \
	fi; \
	echo ""; \
	echo "Balances for $(FUND_WALLET_ADDRESS):"; \
	ETH_BAL=$$(cast balance $(FUND_WALLET_ADDRESS) --rpc-url $(RPC_URL) --ether); \
	BREAD_BAL=$$(cast call $$BREAD_TOKEN 'balanceOf(address)' $(FUND_WALLET_ADDRESS) --rpc-url $(RPC_URL) | cast --to-dec | cast from-wei); \
	echo "  ETH:   $$ETH_BAL ETH"; \
	echo "  BREAD: $$BREAD_BAL BREAD"

0x%:
	@:
