# storage-contract-node
The order node service for stroage contracts

## Start up

### Start Crust watcher 

Please allow your ***30888*** port by running(on ubuntu):
```
sudo ufw allow 30888
```

At project root directory run:
```
sudo docker-compose -f docker/crust-watcher.yaml up -d
```
to start a watcher for order and wait for chain synchronization complete. You can use '***sudo docker logs crust-watch -f***' to see syncing progress

### Bootstrap configure 
***.env*** file needs to be created in the project root directory, a sample ***.env*** file shows as follow:
```
CRUST_SEEDS="xxxxxxxx"
CRUST_CHAIN_URL="ws://localhost:19944"
MONITOR_CHAIN_URL="ws://localhost:8545"
STORAGE_ORDER_ADDR=""
ETH_ACCOUNT=""
```

1. CRUST_SEEDS: required, Crust network account seeds
1. CRUST_CHAIN_URL: required, Crust network address, you can use the watcher started in previous step which is '***ws://localhost:19944***'
1. MONITOR_CHAIN_URL: required, monitored chain endpoint address
1. STORAGE_ORDER_ADDR: required, storage order contract address on MONITOR_CHAIN_URL
1. ETH_ACCOUNT: required, current node's eth account used to receive users' pay

### Start service
```
yarn build && yarn start
```
