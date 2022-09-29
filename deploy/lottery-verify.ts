import { NomicLabsHardhatPluginError } from "hardhat/plugins";
import { task } from "hardhat/config";
import { parseEther } from "ethers/lib/utils";

task("verify", "Verify contracts lottery", async (_, { run }) => {
	const networkName = findNetworkNameFromArgv();
	const lottery = require(`../deployments/${networkName}/Lottery.json`);
	const lotteryToken = require(`../deployments/${networkName}/LotteryToken.json`);
	const contracts: any = [
		{
			name: "LotteryToken",
			address: lotteryToken.address,
			constructorArguments: [],
		},
		{
			name: "Lottery",
			address: lottery.address,
			constructorArguments: [lotteryToken.address, parseEther("10")],
		},
	];

	for (const { name, address, constructorArguments } of contracts) {
		try {
			console.log(`Veifying ${name}`);
			await run("verify:verify", {
				address,
				constructorArguments,
			});
		} catch (error) {
			if (error instanceof NomicLabsHardhatPluginError) {
				console.debug(error.message);
			}
		}
	}
});

function findNetworkNameFromArgv() {
	const index = process.argv.findIndex((arg) => arg === "--network");

	if (index === -1) {
		return null;
	}

	const networkName = process.argv[index + 1];
	return networkName;
}

//npx hardhat verify --network rinkeby
//npx hardhat verify --network matic-testnet
