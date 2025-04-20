<template>
    <div class="chain-state-component">
        <h2 class="text-[30px] font-semibold mb-4 text-white">Chain State</h2>

        <div class="mb-6">
            <div class="mb-4">
                <label class="block text-sm font-medium text-white">Select Pallet</label>
                <select v-model="selectedPallet" class="mt-1 block w-full p-2 text-white border border-gray-300 bg-blue-200/15 rounded-md">
                    <option class="text-black" disabled value="">Select a pallet</option>
                    <option class="text-black" v-for="pallet in availablePallets" :key="pallet" :value="pallet">{{ pallet }}</option>
                </select>
            </div>

            <div class="mb-4" v-if="selectedPallet">
                <label class="block text-sm font-medium text-white">Select Storage Item</label>
                <select v-model="selectedMethod" class="mt-1 block w-full p-2 text-white border border-gray-300 bg-blue-200/15 rounded-md">
                    <option class="text-black" disabled value="">Select a storage item</option>
                    <option class="text-black" v-for="item in storageItems" :key="item.method" :value="item.method">
                        {{ item.method }}
                    </option>
                </select>
                <div v-if="selectedStorageItem && selectedStorageItem.documentation" class="mt-1 text-sm text-gray-500">
                    {{ selectedStorageItem.documentation }}
                </div>
            </div>

            <div class="mb-4" v-if="paramFields.length > 0">
                <label class="block text-sm font-medium text-white">Parameters</label>
                <div v-for="(param, index) in paramFields" :key="index" class="mt-2">
                    <input v-model="paramValues[index]" type="text" :placeholder="`Parameter ${index + 1}`"
                        class="mt-1 block w-full p-2 border border-gray-300 text-white bg-blue-200/10 rounded-md" />
                </div>
            </div>

            <button @click="queryState" :disabled="!canQuery"
                class="mt-4 px-12 py-2 border-2 border-white/50 hover:border-white bg-gradient-to-br hover:bg-gradient-to-l from-[#00B7FF] via-[#00DFD4] to-[#00FF95] font-medium text-lg text-white rounded-md disabled:bg-gray-400">
                Query
            </button>
        </div>

        <div v-if="queryResult" class="mt-4">
            <h3 class="font-medium text-lg mb-2 text-white">Result:</h3>
            <pre class="bg-white/25 border border-white text-white p-4 rounded-md overflow-auto max-h-60">{{ formatResult(queryResult) }}</pre>
        </div>

        <div v-if="queryError" class="mt-4 p-4 bg-white/50 border border-white rounded-md font-medium text-red-600">
            <p>Error: {{ queryError }}</p>
        </div>
    </div>
</template>

<script>
import polkadotService from '~/services/polkadotService';

export default {
    data() {
        return {
            availablePallets: [],
            selectedPallet: '',
            storageItems: [],
            selectedMethod: '',
            paramFields: [],
            paramValues: [],
            queryResult: null,
            queryError: null,
            loading: false
        };
    },
    computed: {
        canQuery() {
            return this.selectedPallet && this.selectedMethod && !this.loading;
        },
        selectedStorageItem() {
            if (!this.selectedMethod) return null;
            return this.storageItems.find(item => item.method === this.selectedMethod);
        }
    },
    async mounted() {
        try {
            // Connect to the node
            await polkadotService.connect();

            // Get available pallets
            if (polkadotService.api) {
                // Get all pallets that have storage items
                this.availablePallets = Object.keys(polkadotService.api.query).sort();

                // Add your custom pallet if it's not already in the list
                if (!this.availablePallets.includes('testPallet') && polkadotService.api.query.testPallet) {
                    this.availablePallets.push('testPallet');
                }
            }
        } catch (error) {
            console.error('Error initializing chain state component:', error);
            this.queryError = error.message;
        }
    },
    watch: {
        async selectedPallet(pallet) {
            if (!pallet) return;

            try {
                // Get storage items for the selected pallet
                if (pallet === 'testPallet') {
                    this.storageItems = await polkadotService.getPalletStorage();
                } else {
                    const items = [];
                    Object.keys(polkadotService.api.query[pallet]).forEach(method => {
                        const methodMeta = polkadotService.api.query[pallet][method].meta;
                        if (methodMeta) {
                            const documentation = methodMeta.documentation ? methodMeta.documentation.toString() : 'No documentation available';

                            items.push({
                                pallet,
                                method,
                                documentation
                            });
                        }
                    });
                    this.storageItems = items;
                }

                this.selectedMethod = '';
                this.resetParams();
            } catch (error) {
                console.error('Error loading storage items:', error);
                this.queryError = error.message;
            }
        },
        async selectedMethod(method) {
            if (!method) return;
            this.resetParams();

            try {
                const metadata = polkadotService.api.query[this.selectedPallet][method];

                // Check if the method requires parameters (e.g., balances.account)
                if (metadata.meta && metadata.meta.type && metadata.meta.type.isMap) {
                    if (method === 'account' && this.selectedPallet === 'balances') {
                        // Prompt for AccountId32 (account address)
                        this.paramFields = ['AccountId32'];
                        this.paramValues = ['']; // Initialize the AccountId32 input
                    }
                }
            } catch (error) {
                console.error('Error analyzing method parameters:', error);
            }
        }
    },
    methods: {
        resetParams() {
            this.paramFields = [];
            this.paramValues = [];
            this.queryResult = null;
            this.queryError = null;
        },
        async queryState() {
            if (!this.canQuery) return;

            this.loading = true;
            this.queryResult = null;
            this.queryError = null;

            try {
                const params = this.paramValues.filter(param => param !== '');

                const result = await polkadotService.queryChainState(
                    this.selectedPallet,
                    this.selectedMethod,
                    params
                );

                this.queryResult = result;
            } catch (error) {
                console.error('Query error:', error);
                this.queryError = error.message;
            } finally {
                this.loading = false;
            }
        },
        formatResult(result) {
            try {
                if (result && result.toHuman) {
                    return JSON.stringify(result.toHuman(), null, 2);
                }
                return JSON.stringify(result, null, 2);
            } catch (e) {
                return String(result);
            }
        }
    }
};
</script>