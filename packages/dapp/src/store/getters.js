export default {
  currentAccount(state) {
    return state.accounts.length > 0 ? state.accounts[0] : null
  },
}
