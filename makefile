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
OZ_UPGRADEABLE_REENTRANCY_COMMIT ?= 5c4c29275d02e06265ce1cfcad5a420b58a5ca02

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
