<template>
    <div class="extrinsics-component">
        <h2 class="text-xl font-semibold mb-4 text-white text-[30px]">Submit Extrinsic</h2>

        <div v-if="!selectedAccount" class="mb-4">
            <p class="text-red-600">Please select an account first</p>
        </div>

        <div v-else class="mb-6">
            <div class="mb-2">
                <span class="font-medium text-white">Selected Account:</span>
                <div class="text-sm mt-1 text-white">
                    {{ selectedAccount.meta.name }} ({{ shortenAddress(selectedAccount.address) }})
                </div>
            </div>

            <div class="my-4">
                <label class="block text-sm font-medium text-white">Select Pallet</label>
                <select v-model="selectedPallet"
                    class="mt-1 block w-full p-2 border border-white bg-blue-200/10 text-white rounded-md">
                    <option class="text-black" disabled value="">Select a pallet</option>
                    <option class="text-black" v-for="pallet in availablePallets" :key="pallet" :value="pallet">{{
                        pallet }}</option>
                </select>
            </div>

            <div class="mb-4" v-if="selectedPallet">
                <label class="block text-sm font-medium text-white">Select Method</label>
                <select v-model="selectedMethod"
                    class="mt-1 block w-full p-2 border border-white bg-blue-200/10 text-white rounded-md">
                    <option class="text-black" disabled value="">Select a method</option>
                    <option class="text-black" v-for="method in palletMethods" :key="method.method"
                        :value="method.method">
                        {{ method.method }}
                    </option>
                </select>
                <div v-if="selectedMethodObj && selectedMethodObj.documentation" class="mt-1 text-sm text-gray-500">
                    {{ selectedMethodObj.documentation }}
                </div>
            </div>

            <div class="mb-4" v-if="paramFields.length > 0">
                <label class="block text-sm font-medium text-white">Parameters</label>
                <div v-for="(param, index) in paramFields" :key="index" class="mt-2">
                    <input v-model="paramValues[index]" type="text" :placeholder="`Parameter ${index + 1}`"
                        class="mt-1 block w-full p-2 border border-white text-white bg-blue-200/10 rounded-md" />
                </div>
            </div>

            <div class="flex mt-8 gap-4">
                <button @click="submitExtrinsic" :disabled="!canSubmit || submitting"
                    class="mt-4 px-12 py-2 border-2 border-white/50 hover:border-white bg-gradient-to-br hover:bg-gradient-to-l from-[#00B7FF] via-[#00DFD4] to-[#00FF95] font-medium text-lg text-white rounded-md disabled:bg-gray-400">
                    {{ submitting ? 'Submitting...' : 'Submit Extrinsic' }}
                </button>
                <div v-if="submitting" class="flex justify-center items-center">
                    <img src="/public/polkadot_loading.svg" alt="" class="w-8 h-8 rounded-full animate-spin">
                </div>
            </div>
        </div>

        <div v-if="txHash" class="mt-4">
            <h3 class="font-medium text-lg mb-2 text-white">Transaction Submitted:</h3>
            <div class="bg-white/25 border-2 border-white text-white font-semibold px-4 py-3 rounded-md">
                <p>Block Hash: {{ txHash }}</p>
            </div>
        </div>

        <div v-if="txError" class="mt-4">
            <h3 class="font-medium text-lg mb-2 text-white">Transaction Error:</h3>
            <div class="bg-white/50 border-2 border-white text-red-600 font-semibold px-4 py-3 rounded-md">
                <p>{{ txError }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import polkadotService from '~/services/polkadotService';

export default {
    props: {
        selectedAccount: {
            type: Object,
            default: null
        }
    },
    data() {
        return {
            availablePallets: [],
            selectedPallet: '',
            palletMethods: [],
            selectedMethod: '',
            paramFields: [],
            paramValues: [],
            txHash: null,
            txError: null,
            submitting: false
        };
    },
    computed: {
        canSubmit() {
            return this.selectedAccount && this.selectedPallet && this.selectedMethod && !this.submitting;
        },
        selectedMethodObj() {
            if (!this.selectedMethod) return null;
            return this.palletMethods.find(method => method.method === this.selectedMethod);
        }
    },
    async mounted() {
        try {
            // Connect to the node
            await polkadotService.connect();

            // Get available pallets
            if (polkadotService.api) {
                // Get all pallets that have extrinsics
                this.availablePallets = Object.keys(polkadotService.api.tx).sort();

                // Add your custom pallet if it's not already in the list
                if (!this.availablePallets.includes('testPallet') && polkadotService.api.tx.testPallet) {
                    this.availablePallets.push('testPallet');
                }
            }
        } catch (error) {
            console.error('Error initializing extrinsics component:', error);
            this.txError = error.message;
        }
    },
    watch: {
        async selectedPallet(pallet) {
            if (!pallet) return;

            try {
                // Get methods for the selected pallet
                if (pallet === 'testPallet') {
                    this.palletMethods = await polkadotService.getPalletExtrinsics();
                } else {
                    const methods = [];
                    Object.keys(polkadotService.api.tx[pallet]).forEach(method => {
                        const meta = polkadotService.api.tx[pallet][method].meta;
                        methods.push({
                            pallet,
                            method,
                            documentation: meta?.documentation?.toString() || 'No documentation available',
                        });
                    });
                    this.palletMethods = methods;
                }

                this.selectedMethod = '';
                this.resetParams();
            } catch (error) {
                console.error('Error loading pallet methods:', error);
                this.txError = error.message;
            }
        },

        async selectedMethod(method) {
            if (!method) return;
            this.resetParams();

            try {
                // Analyze the method to determine its parameters
                const methodMeta = polkadotService.api.tx[this.selectedPallet][method].meta;

                if (methodMeta && methodMeta.args) {
                    // Create parameter fields based on the arguments
                    this.paramFields = methodMeta.args.map(arg => arg.name?.toString() || 'Unnamed parameter');
                    this.paramValues = Array(this.paramFields.length).fill('');
                } else {
                    // Handle case where there are no parameters
                    this.paramFields = [];
                    this.paramValues = [];
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
            this.txHash = null;
            this.txError = null;
        },
        shortenAddress(address) {
            if (!address) return '';
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        },
        async submitExtrinsic() {
            if (!this.canSubmit) return;

            this.submitting = true;
            this.txHash = null;
            this.txError = null;

            try {
                // Submit the extrinsic
                const result = await polkadotService.submitExtrinsic(
                    this.selectedAccount.address,
                    this.selectedPallet,
                    this.selectedMethod,
                    this.paramValues.filter(param => param !== '')
                );

                this.txHash = result.blockHash;

                // Emit event for parent components
                this.$emit('extrinsic-submitted', {
                    success: true,
                    hash: this.txHash,
                    pallet: this.selectedPallet,
                    method: this.selectedMethod
                });
            } catch (error) {
                console.error('Extrinsic submission error:', error);
                this.txError = error.message;

                // Emit event for parent components
                this.$emit('extrinsic-submitted', {
                    success: false,
                    error: error.message,
                    pallet: this.selectedPallet,
                    method: this.selectedMethod
                });
            } finally {
                this.submitting = false;
            }
        }
    }
};
</script>