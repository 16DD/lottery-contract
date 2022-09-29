import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "./deploy/lottery-verify";
dotenv.config();
//get account
const accounts = {
	mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
};

const config: HardhatUserConfig = {
	defaultNetwork: "hardhat",
	etherscan: {
		apiKey: scanApiKeyFromEnv(),
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
	},
	networks: {
		mainnet: {
			url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts,
			saveDeployments: true,
			chainId: 1,
		},
		rinkeby: {
			url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts,
			chainId: 4,
			saveDeployments: true,
		},
		goerli: {
			url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
			accounts,
			chainId: 5,
			saveDeployments: true,
		},
		"matic-testnet": {
			url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
			accounts,
			chainId: 80001,
			saveDeployments: true,
		},
	},
	solidity: "0.8.17",
};

function scanApiKeyFromEnv() {
	const networkName = findNetworkNameFromArgv();
	let apiKey = process.env.ETHERSCAN_API_KEY;

	switch (networkName) {
		case "mainnet":
			apiKey = process.env.ETHERSCAN_API_KEY;
			break;
		case "rinkeby":
			apiKey = process.env.ETHERSCAN_API_KEY;
			break;
		case "matic":
			apiKey = process.env.POLYGONSCAN_API_KEY;
			break;
		case "matic-testnet":
			apiKey = process.env.POLYGONSCAN_API_KEY;
			break;
		case "bsc":
			apiKey = process.env.BSCSCAN_API_KEY;
			break;
		case "bsc-testnet":
			apiKey = process.env.BSCSCAN_API_KEY;
			break;
		case "avalanche-testnet":
			apiKey = process.env.AVALANCHE_API_KEY;
			break;
		case "avalanche":
			apiKey = process.env.AVALANCHE_API_KEY;
			break;
	}

	return apiKey;
}

function findNetworkNameFromArgv() {
	const index = process.argv.findIndex((arg) => arg === "--network");

	if (index === -1) {
		return null;
	}

	const networkName = process.argv[index + 1];
	return networkName;
}

export default config;
