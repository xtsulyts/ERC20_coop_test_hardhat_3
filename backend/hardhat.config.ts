import type { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatVerify from "@nomicfoundation/hardhat-verify";
import hardhatKeystore from "@nomicfoundation/hardhat-keystore"

const config: HardhatUserConfig = {
  plugins:
   [hardhatToolboxViemPlugin, 
    hardhatViem, 
    hardhatVerify, 
    hardhatKeystore
  ],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
  verify: {
    etherscan: {
      // Your API key for Etherscan
      // Obtain one at https://etherscan.io/
      apiKey: configVariable("ETHERSCAN_API_KEY"),
    },
  },   
};

export default config;
