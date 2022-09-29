import { parseEther } from "ethers/lib/utils";
import scriptDeploy from "../scripts/scriptDeploy";
module.exports = async ({ getNamedAccounts }: { getNamedAccounts: any }) => {
	const { deployer } = await getNamedAccounts();
	console.log("Admin ", deployer);
	console.log("Deploy lottery game");

	// deploy token
	const lotteryToken = await scriptDeploy.deployContract("LotteryToken", deployer);

	// deploy lottery game contract
	await scriptDeploy.deployContract("Lottery", deployer, [lotteryToken, parseEther("10")]);
};
module.exports.tags = ["Lottery"];

//script
//npx hardhat deploy --tags Lottery --network rinkeby
//npx hardhat deploy --tags Lottery --network matic-testnet
