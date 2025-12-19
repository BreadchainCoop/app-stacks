.PHONY: deploy anvil

# Default values
RPC_URL ?= http://localhost:8545
# first anvil's account
PRIVATE_KEY ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# second anvil's account
ADMIN_ADDRESS ?= 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

anvil:
	anvil --fork-url https://rpc.gnosischain.com --chain-id 31337 --block-time 5

deploy:
	cd contracts && \
	export RPC_URL=$(RPC_URL) && \
	export PRIVATE_KEY=$(PRIVATE_KEY) && \
	export ADMIN_ADDRESS=$(ADMIN_ADDRESS) && \
	forge script script/Deploy.s.sol:Deploy \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--private-key $(PRIVATE_KEY) \
		--legacy
