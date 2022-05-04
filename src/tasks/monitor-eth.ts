import { ethers } from "ethers";
import Chain from '../chain';
import Ipfs from '../ipfs';
import { getTimestamp } from '../utils';
import { logger } from '../utils/logger';
import { AppContext } from '../types/context';
import { Task } from '../types/tasks';
import { createRecordOperator } from '../db/operator';
import { 
  ETH_STORAGE_CONTRACT_ADDRESS,
  STORAGE_ORDER_ABI,
  ETH_ACCOUNT,
  CRUST_CHAIN_URL,
  ETH_ENDPOINT_URL } from '../consts';

export async function createMonitorETHTask(context: AppContext): Promise<Task> {
  return {
    name: "Monitor-task",
    start: async (context: AppContext) => {
      // If you don't specify a //url//, Ethers connects to the default 
      // (i.e. ``http:/\/localhost:8545``)
      if (ETH_ENDPOINT_URL === '') {
        logger.error("Monitor chain address cannot be null!");
        process.exit(1);
      }

      if (ETH_ACCOUNT === '') {
        logger.error("Current node address cannot be null!");
        process.exit(1);
      }

      logger.info("Start monitor service:");
      logger.info(`  Monitor chain address:${ETH_ENDPOINT_URL}`);
      logger.info(`  Crust chain address:${CRUST_CHAIN_URL}`);
      logger.info(`  Current node address:${ETH_ACCOUNT}`);
      const provider = new ethers.providers.JsonRpcProvider(ETH_ENDPOINT_URL);

      // The provider also allows signing transactions to
      // send ether and pay to change state within the blockchain.
      // For this, we need the account signer...
      const signer = provider.getSigner();
      const StorageOrderContract = new ethers.Contract(ETH_STORAGE_CONTRACT_ADDRESS, STORAGE_ORDER_ABI, provider);
      const db = context.database;
      const dbOps = createRecordOperator(db);

      // Receive an event when ANY transfer occurs
      StorageOrderContract.on("Order", async(
        cid: string,
        size: number,
        price: number,
        nodeAddress: string,
        event
      ) => {
        if (ETH_ACCOUNT === nodeAddress) {
          logger.info("ADD new ETH task:");
          logger.info(`  cid:${cid}`);
          logger.info(`  size:${size}`);
          logger.info(`  price:${price}`);
          logger.info(`  nodeAddress :${nodeAddress}`);
          dbOps.addRecord(
            cid,
            size,
            "ETH",
            price.toString(),
            event.blockNumber,
            "eth",
            event.transactionHash,
            getTimestamp(),
          );
        }
      });

      // Receive an event when ANY transfer occurs
      StorageOrderContract.on("OrderInERC20", async (
        cid: string,
        size: number,
        price: number,
        tokenAddress: string,
        nodeAddress:string,
        event
      ) => {
        if (ETH_ACCOUNT === nodeAddress) {
          logger.info("Add new ETH task:");
          logger.info(`  cid:${cid}`);
          logger.info(`  size:${size}`);
          logger.info(`  price:${price}`);
          logger.info(`  tokenAddress:${tokenAddress}`);
          logger.info(`  nodeAddress :${nodeAddress}`);
          dbOps.addRecord(
            cid,
            size,
            tokenAddress,
            price.toString(),
            event.blockNumber,
            "eth",
            event.transactionHash,
            getTimestamp(),
          );
        }
      });

      logger.info('Start service successfully.');
    },
    stop: async () => {
      return true;
    }
  }
}
