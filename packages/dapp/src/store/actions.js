import Web3 from 'web3'
import { ElMessage } from 'element-plus'
import { forEach } from 'lodash'
import { ACTION_TYPES, MUTATION_TYPES } from '../util/constants'
import Contracts from './contracts'

export default {
  async [ACTION_TYPES.INIT_WEB3]({ state, commit, dispatch }) {
    if (typeof window.ethereum !== 'undefined') {
      const ethereum = window.ethereum
      const web3Instance = new Web3(window.ethereum)
      commit(MUTATION_TYPES.SET_WEB3, web3Instance)
      commit(MUTATION_TYPES.SET_NETWORK_ID, await web3Instance.eth.net.getId())
      // console.log(web3Instance)

      ethereum.on('chainChanged', (chainId) => window.location.reload())
      ethereum.on('accountsChanged', (accounts) => {
        commit(MUTATION_TYPES.SET_ACCOUNTS, accounts)
      })

      await dispatch(ACTION_TYPES.INIT_CONTRACTS)

      commit(MUTATION_TYPES.SET_DAPP_READINESS, true)
    } else {
      ElMessage({
        message: 'Non-Ethereum browser detected.',
        type: 'error',
      })
    }
  },

  async [ACTION_TYPES.INIT_CONTRACTS]({ state, commit }) {
    const { web3, networkId } = state
    const instances = {}

    forEach(Contracts, (artefact, name) => {
      const network = artefact.networks[networkId]
      if (!network) {
        ElMessage({
          message: 'No contract deployed on the network that you are connected.',
          type: 'error',
        })
        return
      }

      instances[name] = new web3.eth.Contract(artefact.abi, network.address, {
        gasPrice: Web3.utils.toWei('40', 'gwei'),
      })
    })

    commit(MUTATION_TYPES.SET_CONTRACTS, instances)
  },

  async [ACTION_TYPES.CONNECT_WALLET]({ state, commit }) {
    const { web3 } = state
    commit(MUTATION_TYPES.SET_COINBASE, await web3.eth.getCoinbase())

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      commit(MUTATION_TYPES.SET_ACCOUNTS, accounts)

      ElMessage({
        message: 'Wallet connected!',
        type: 'success',
      })
    } catch (error) {
      ElMessage({
        message: 'Unable to connect wallet: ' + error,
        type: 'error',
      })
    }
  },

  async [ACTION_TYPES.DISCONNECT_WALLET]({ state, commit }) {
    commit(MUTATION_TYPES.SET_ACCOUNTS, [])
    commit(MUTATION_TYPES.SET_COINBASE, null)
  },
}
