import { ApiPromise, WsProvider } from '@polkadot/api';

export default new class PolkadotService {
    constructor() {
        this.api = null;
        this.connected = false;
    }

    // async connect(nodeUrl = 'wss://rpc.polkadot.io') 

    async connect(nodeUrl = 'ws://127.0.0.1:42605') {
        if (this.connected && this.api) return this.api;

        const provider = new WsProvider(nodeUrl);
        this.api = await ApiPromise.create({ provider });
        await this.api.isReady;
        this.connected = true;
        return this.api;
    }

    async getAccounts(appName = 'Substrate Interface') {
        if (typeof window === 'undefined') {
            throw new Error('web3 extension only available in the browser');
        }

        const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp');
        const extensions = await web3Enable(appName);
        if (extensions.length === 0) {
            throw new Error('No extension installed or not authorized');
        }

        return await web3Accounts();
    }

    async getBalance(address) {
        if (!this.connected) await this.connect();

        const accountInfo = await this.api.query.system.account(address);
        const { data } = accountInfo || {};
        const free = data?.free || 0;
        const reserved = data?.reserved || 0;
        const miscFrozen = data?.miscFrozen || 0;
        const feeFrozen = data?.feeFrozen || 0;

        return {
            free: free.toString?.() || '0',
            reserved: reserved.toString?.() || '0',
            miscFrozen: miscFrozen.toString?.() || '0',
            feeFrozen: feeFrozen.toString?.() || '0',
            total: free.add?.(reserved)?.toString?.() || '0'
        };
    }

    async submitExtrinsic(senderAddress, module, method, params = []) {
        if (!this.connected) await this.connect();

        if (typeof window === 'undefined') {
            throw new Error('Extrinsic submission only available in the browser');
        }

        const { web3FromAddress } = await import('@polkadot/extension-dapp');

        if (!this.api.tx[module]) {
            throw new Error(`Module '${module}' not found in the API`);
        }

        if (!this.api.tx[module][method]) {
            throw new Error(`Method '${method}' not found in module '${module}'`);
        }

        const tx = this.api.tx[module][method](...params);
        const injector = await web3FromAddress(senderAddress);

        return new Promise((resolve, reject) => {
            tx.signAndSend(senderAddress, { signer: injector.signer }, ({ status, events, dispatchError }) => {
                if (dispatchError) {
                    if (dispatchError.isModule) {
                        const decoded = this.api.registry.findMetaError(dispatchError.asModule);
                        const { docs, method, section } = decoded;
                        reject(new Error(`${section}.${method}: ${docs.join(' ')}`));
                    } else {
                        reject(new Error(dispatchError.toString()));
                    }
                }

                if (status.isFinalized) {
                    console.log(`Transaction finalized in block: ${status.asFinalized}`);
                    events.forEach(({ event }) => {
                        if (this.api.events.system.ExtrinsicSuccess.is(event)) {
                            resolve({
                                success: true,
                                blockHash: status.asFinalized.toString(),
                                events: events.map(({ event }) => ({
                                    section: event.section,
                                    method: event.method,
                                    data: event.data.toString()
                                }))
                            });
                        }
                    });
                }
            });
        });
    }

    async transferTokens(senderAddress, recipientAddress, amount) {
        try {
            if (this.api.tx.balances.transferKeepAlive) {
                return this.submitExtrinsic(senderAddress, 'balances', 'transferKeepAlive', [recipientAddress, amount]);
            } else if (this.api.tx.balances.transferAllowDeath) { 
                return this.submitExtrinsic(senderAddress, 'balances', 'transferAllowDeath', [recipientAddress, amount]);
            } else if (this.api.tx.balances.transfer) { 
                return this.submitExtrinsic(senderAddress, 'balances', 'transfer', [recipientAddress, amount]);
            } else {
                throw new Error('No valid transfer method found in the API');
            }
        } catch (error) {
            console.error('Transfer error:', error);
            throw error;
        }
    }

    async callTestPallet(senderAddress, method, params = []) {
        return this.submitExtrinsic(senderAddress, 'testPallet', method, params);
    }

    async getPalletExtrinsics(palletName = 'testPallet') {
        if (!this.connected) await this.connect();

        const metadata = this.api.tx[palletName];
        if (!metadata) return [];

        return Object.keys(metadata).map(method => ({
            pallet: palletName,
            method,
            documentation: this.api.tx[palletName][method].meta.documentation.toString()
        }));
    }

    async getPalletStorage(palletName = 'testPallet') {
        if (!this.connected) await this.connect();

        const metadata = this.api.query[palletName];
        if (!metadata) return [];

        return Object.keys(metadata).map(method => ({
            pallet: palletName,
            method,
            documentation: this.api.query[palletName][method].meta.documentation.toString()
        }));
    }

    async queryChainState(pallet, method, params) {
        try {
            const queryMethod = this.api.query[pallet][method];
            if (!queryMethod) {
                throw new Error(`Method ${method} not found in pallet ${pallet}`);
            }

            if (method === 'account' && pallet === 'balances') {
                if (params.length === 0) {
                    throw new Error('The account parameter (AccountId32) is required.');
                }
            }

            const result = await queryMethod(...params);
            return result;
        } catch (error) {
            console.error('Error querying chain state:', error);
            throw error;
        }
    }

}
