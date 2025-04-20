<template>
    <div class="token-transfer-component">
        <h2 class="text-[30px] font-semibold mb-4 text-white">Transfer Tokens</h2>

        <div v-if="!selectedAccount" class="mb-4">
            <p class="text-red-600">Please select an account first</p>
        </div>

        <div v-else class="mb-6">
            <div class="mb-4">
                <div class="font-medium text-white">From Account:</div>
                <div class="mt-1 text-sm text-white">
                    {{ selectedAccount.meta.name }} ({{ shortenAddress(selectedAccount.address) }})
                </div>

                <div v-if="accountBalance"
                    class="w-fit mt-4 text-sm text-white bg-blue-200/10 border border-white rounded-md px-8 py-2">
                    <span class="font-medium">Balance:</span> {{ formatBalance(accountBalance.free) }}
                </div>
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-white">Recipient Address</label>
                <input v-model="recipientAddress" type="text" placeholder="5..."
                    class="mt-1 block w-full p-2 border border-white bg-blue-200/10 text-white rounded-md" />
            </div>

            <div class="mb-4">
                <label class="block text-sm font-medium text-white">Amount</label>
                <div class="mt-1 flex rounded-md shadow-sm">
                    <input v-model="amount" type="text" placeholder="0.0"
                        class="flex-1 p-2 border border-white bg-blue-200/10 text-white rounded-l-md" />
                    <span
                        class="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-white text-gray-500">
                        tokens
                    </span>
                </div>
            </div>

            <div class="flex mt-8 gap-4">
                <button @click="transfer" :disabled="!canTransfer || transferring"
                    class="px-8 py-2 border-2 border-white/50 hover:border-white bg-gradient-to-br from-[#00B7FF] via-[#00DFD4] to-[#00FF95] font-medium text-lg text-white rounded-md hover:bg-gradient-to-l disabled:bg-gray-400">
                    {{ transferring ? 'Transferring...' : 'Send Transfer' }}
                </button>
    
                <div v-if="transferring" class="flex justify-center items-center">
                    <img src="/public/polkadot_loading.svg" alt="" class="w-8 h-8 rounded-full animate-spin">
                </div>
            </div>
        </div>

        <div v-if="txHash" class="mt-4">
            <h3 class="font-medium text-lg mb-2 text-white">Transaction Successful:</h3>
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <p>Block Hash: {{ txHash }}</p>
            </div>
        </div>

        <div v-if="txError" class="mt-4">
            <h3 class="font-medium text-lg mb-2 text-white">Transaction Error:</h3>
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{{ txError }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
const { $polkadot } = useNuxtApp()

const props = defineProps({
    selectedAccount: {
        type: Object,
        default: null
    }
})

const recipientAddress = ref('')
const amount = ref('')
const accountBalance = ref(null)
const txHash = ref(null)
const txError = ref(null)
const transferring = ref(false)

const canTransfer = computed(() => {
    return (
        props.selectedAccount &&
        isValidAddress(recipientAddress.value) &&
        isValidAmount(amount.value) &&
        !transferring.value
    )
})

watch(() => props.selectedAccount, async (account) => {
    if (account) {
        await fetchBalance()
    } else {
        accountBalance.value = null
    }
}, { immediate: true })

onMounted(() => {
    if (props.selectedAccount) {
        fetchBalance()
    }
})

function isValidAddress(address) {
    return address && address.length > 10
}

function isValidAmount(value) {
    const parsed = parseFloat(value)
    return !isNaN(parsed) && parsed > 0
}

function shortenAddress(address) {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatBalance(balance) {
    if (!balance) return '0'
    // Format balance to display with decimals
    const numBalance = Number(balance.replaceAll(',', ''))
    const formattedBalance = (numBalance / Math.pow(10, 12)).toFixed(4)
    return `${formattedBalance} tokens`
}

async function fetchBalance() {
    if (!props.selectedAccount) return
    try {
        accountBalance.value = await $polkadot.getBalance(props.selectedAccount.address)
    } catch (err) {
        console.error('Error fetching balance:', err)
        txError.value = `Error fetching balance: ${err.message}`
    }
}

async function transfer() {
    if (!canTransfer.value) return

    transferring.value = true
    txHash.value = null
    txError.value = null

    try {
        // Convert to smallest unit (assuming 12 decimals)
        const amountInSmallestUnit = parseFloat(amount.value) * Math.pow(10, 12)
        const result = await $polkadot.transferTokens(
            props.selectedAccount.address,
            recipientAddress.value,
            amountInSmallestUnit.toString()
        )

        if (result.success) {
            txHash.value = result.blockHash
            // Clear fields on success
            amount.value = ''
            recipientAddress.value = ''
            // Refresh balance after a short delay
            setTimeout(() => fetchBalance(), 2000)
        }

    } catch (err) {
        console.error('Transfer error:', err)
        txError.value = err.message || 'An error occurred during transfer'

    } finally {
        transferring.value = false
    }
}
</script>