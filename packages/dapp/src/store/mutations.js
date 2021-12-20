import { MUTATION_TYPES } from '../util/constants'

export default {
  [MUTATION_TYPES.SET_WEB3](state, payload) {
    state.web3 = payload
  },
  [MUTATION_TYPES.SET_COINBASE](state, payload) {
    state.coinbase = payload
  },
  [MUTATION_TYPES.SET_ACCOUNTS](state, payload) {
    state.accounts = payload
  },
  [MUTATION_TYPES.SET_NETWORK_ID](state, payload) {
    state.networkId = payload
  },
  [MUTATION_TYPES.SET_DAPP_READINESS](state, payload) {
    state.isDAppReady = payload
  },
  [MUTATION_TYPES.SET_CONTRACTS](state, payload) {
    state.contracts = payload
  },
}
