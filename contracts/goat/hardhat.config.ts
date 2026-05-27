import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" });
dotenv.config({ path: "../../.env.local" });

const config: HardhatUserConfig = {
    solidity: {
        version: "0.8.24",
        settings: {
            evmVersion: "cancun",
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            accounts: process.env.AVALANCHE_PRIVATE_KEY ? [process.env.AVALANCHE_PRIVATE_KEY] : []
        },
        kite: {
            url: "https://rpc-testnet.gokite.ai",
            chainId: 2368,
            accounts: process.env.AVALANCHE_PRIVATE_KEY ? [process.env.AVALANCHE_PRIVATE_KEY] : []
        },
        goatMainnet: {
            url: "https://rpc.goat.network",
            chainId: 2345,
            accounts: process.env.GOAT_PRIVATE_KEY ? [process.env.GOAT_PRIVATE_KEY] : []
        },
        goatTestnet3: {
            url: "https://rpc.testnet3.goat.network",
            chainId: 48816,
            accounts: process.env.GOAT_PRIVATE_KEY ? [process.env.GOAT_PRIVATE_KEY] : []
        }
    }
};

export default config;
