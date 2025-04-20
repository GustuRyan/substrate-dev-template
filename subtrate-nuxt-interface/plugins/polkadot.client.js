// plugins/polkadot.client.js
import polkadotService from '~/services/polkadotService';

export default defineNuxtPlugin(() => {
  return {
    provide: {
      polkadot: polkadotService
    }
  };
});
