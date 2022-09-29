import { deployments} from 'hardhat';
import { findNetworkNameFromArgv, setAddressDeploy } from "./address_deploy";

const { deploy } = deployments;

export default {
  // script deploying any contract
  async deployContract(contract:any, deployer:any, args: any[] = [], libraries = {}) {
    const networkName = findNetworkNameFromArgv();
    console.log(`Running ${contract} deploy script`);
    const { address } = await deploy(contract, {
      from: deployer,
      args: args,
      libraries: libraries,
      log: true,
      deterministicDeployment: false
    });
    console.log(`${contract} deployed at `, address);

    // write address deploy
    setAddressDeploy(networkName + `.${contract}`, address);
    return address;
  },

}