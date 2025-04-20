<template>
  <div
    class="relative flex flex-col justify-center items-center w-full min-h-screen p-6 md:p-12 bg-gradient-to-br from-[#181818] to-[#00101E] overflow-hidden">
    <div
      class="w-[200px] lg:w-[400px] h-[200px] lg:h-[320px] rounded-full right-[-10%] top-[-20%] absolute bg-[#0062b9] blur-[80px] lg:blur-[100px]">
    </div>
    <div
      class="w-[200px] lg:w-[600px] h-[200px] lg:h-[160px] rounded-full left-[-10%] bottom-[-5%] absolute bg-[#0062b9] blur-[80px] lg:blur-[100px]">
    </div>
    <div
      class="w-[200px] lg:w-[240px] h-[200px] lg:h-[240px] rounded-full left-[20%] top-[20%] absolute bg-[#00DFD4] blur-[165px] lg:blur-[200px]">
    </div>
    <div
      class="w-[200px] lg:w-[280px] h-[200px] lg:h-[280px] rounded-full right-[10%] bottom-[10%] absolute bg-[#00FF95] blur-[165px] lg:blur-[200px]">
    </div>
    <div
      class="container relative z-10 p-6 md:p-12 rounded-2xl shadow-lg backdrop-blur-3xl bg-[#4D4D4D]/35 overflow-hidden m-0">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-[40px] font-bold text-white">Polkadot Substrate Interface</h1>
        <h2 class="text-white/50 text-end">created by Gustu Ryan</h2>
      </div>
      <div class="mb-8">
        <div class="flex items-center space-x-2 mb-4">
          <div :class="{
            'w-3 h-3 rounded-full': true,
            'bg-green-500': connected,
            'bg-red-500': !connected
          }"></div>
          <span class="text-white">{{ connected ? 'Connected to node' : 'Disconnected' }}</span>
        </div>

        <button @click="connectNode" :disabled="connecting"
          class="px-8 py-2 border-2 border-white/50 hover:border-white bg-gradient-to-br from-[#00B7FF] via-[#00DFD4] to-[#00FF95] font-medium text-lg text-white rounded-md hover:bg-gradient-to-l disabled:bg-gray-400">
          {{ connecting ? 'Connecting...' : connected ? 'Reconnect' : 'Connect to Node' }}
        </button>
      </div>

      <div v-if="connected" class="mb-8">
        <h2 class="text-[30px] font-semibold mb-4 text-white">Accounts</h2>

        <div v-if="accounts.length === 0" class="mb-4">
          <p class="text-white">No accounts found. Please make sure the Polkadot extension is installed and authorized.
          </p>
          <button @click="getAccounts"
            class="mt-4 px-8 py-2 border-2 border-white/50 hover:border-white bg-gradient-to-br from-[#00B7FF] via-[#00DFD4] to-[#00FF95] font-medium text-lg text-white rounded-md hover:bg-gradient-to-l disabled:bg-gray-400">
            Connect to Polkadot Extension
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="account in accounts" :key="account.address" :class="{
            'p-4 border-2 rounded-lg cursor-pointer hover:border-[#00B7FF]': true,
            'bg-blue-200/17 border-white': selectedAccount && selectedAccount.address === account.address,
            'bg-[#5C5C5C]/17 border-[#5C5C5C]/35 backdrop-blur-3xl': !selectedAccount || selectedAccount.address !== account.address
          }" @click="selectAccount(account)">
            <div class='font-semibold text-xl text-white mb-2 truncate'>{{ account.meta.name }}</div>
            <div class='text-white truncate'>{{ account.address }}</div>
          </div>
        </div>
      </div>

      <div v-if="connected && selectedAccount" class="mb-8 overflow-hidden">
        <div class="tabs">
          <div class="flex border-b">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="{
              'px-8 py-4 border-t-2 border-l-2 border-r-2 rounded-t-lg mr-1 -mb-px text-white': true,
              'bg-blue-200/17 border-b-white font-medium': activeTab === tab.id,
              'bg-[#6E6E6E]/17 text-gray-600 hover:bg-blue-100/35': activeTab !== tab.id
            }">
              {{ tab.name }}
            </button>
          </div>
        </div>

        <div class="tab-content p-8 border-2 border-white rounded-b-lg rounded-tr-lg bg-blue-200/17">
          <div v-if="activeTab === 'chain-state'">
            <chain-state></chain-state>
          </div>

          <div v-if="activeTab === 'extrinsics'">
            <extrinsics :selected-account="selectedAccount" @extrinsic-submitted="handleExtrinsicSubmitted">
            </extrinsics>
          </div>

          <div v-if="activeTab === 'transfer'">
            <token-transfer :selected-account="selectedAccount"
              @transfer-completed="handleTransferCompleted"></token-transfer>
          </div>
        </div>
      </div>

      <div class="flex mt-8 justify-between items-center w-full">
        <div class="text-sm text-white/50">
          <p>Connected to: {{ nodeInfo }}</p>
        </div>
        <div
          class="group p-2 w-9 hover:w-[200px] flex gap-3 rounded-full shadow-lg backdrop-blur-3xl bg-white/25 overflow-hidden m-0 transition-all ease-in-out delay-300">
          <img src="/public/icon_arrow_circle_back.svg" alt=""
            class="w-6 opacity-50 group-hover:opacity-100 group-hover:rotate-180 delay-500">
          <a href="https://github.com/GustuRyan" target="_blank">
            <img src="/public/icon_github.svg" alt="" class="w-8 hidden hover:opacity-80 group-hover:block">
          </a>
          <a href="https://www.linkedin.com/in/ida-bagus-putu-ryan-paramasatya-putra-414913250/" target="_blank">
            <img src="/public/icon_linkedin.svg" alt="" class="w-8 hidden hover:opacity-80 group-hover:block">
          </a>
          <a href="https://www.instagram.com/ryannparama" target="_blank">
            <img src="/public/icon_instagram.svg" alt="" class="w-8 hidden hover:opacity-80 group-hover:block">
          </a>
        </div>
      </div>
    </div>
    <div class="h-20 lg:h-[240]"></div>
    <img src="/public/footer_mark.svg" alt="" class="absolute z-0 bottom-0 min-w-screen opacity-10">
  </div>
</template>

<script>
import polkadotService from '~/services/polkadotService';
import ChainState from '~/components/ChainState.vue';
import Extrinsics from '~/components/Extrinsics.vue';
import TokenTransfer from '~/components/TokenTransfer.vue';


export default {
  components: {
    ChainState,
    Extrinsics,
    TokenTransfer
  },
  data() {
    return {
      connecting: false,
      connected: false,
      nodeInfo: '',
      accounts: [],
      selectedAccount: null,
      activeTab: 'chain-state',
      tabs: [
        { id: 'chain-state', name: 'Chain State' },
        { id: 'extrinsics', name: 'Extrinsics' },
        { id: 'transfer', name: 'Transfer' },
      ]
    };
  },
  mounted() {
    this.connectNode();
  },
  methods: {
    async connectNode() {
      this.connecting = true;

      try {
        // Connect to the node
        const api = await polkadotService.connect();

        // Get chain information
        const [chain, nodeName, nodeVersion] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version()
        ]);

        this.nodeInfo = `${chain} using ${nodeName} v${nodeVersion}`;
        this.connected = true;

        // Try to get accounts automatically
        this.getAccounts();
      } catch (error) {
        console.error('Error connecting to node:', error);
        this.connected = false;
        this.nodeInfo = `Error: ${error.message}`;
      } finally {
        this.connecting = false;
      }
    },
    async getAccounts() {
      try {
        this.accounts = await polkadotService.getAccounts();
      } catch (error) {
        console.error('Error getting accounts:', error);
        this.accounts = [];
      }
    },
    selectAccount(account) {
      this.selectedAccount = account;
    },
    handleExtrinsicSubmitted(result) {
      if (result.success) {
        console.log(`Extrinsic submitted successfully: ${result.hash}`);
        // You could add notification here
      } else {
        console.error(`Extrinsic error: ${result.error}`);
        // You could add error notification here
      }
    },
    handleTransferCompleted(result) {
      if (result.success) {
        console.log(`Transfer completed successfully: ${result.hash}`);
        // You could add notification here
      } else {
        console.error(`Transfer error: ${result.error}`);
        // You could add error notification here
      }
    }
  }
};
</script>