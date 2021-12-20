import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import state from './state'
import actions from './actions'
import getters from './getters'
import mutations from './mutations'

const persistedState = createPersistedState({
  storage: window.localStorage,
  key: 'kick-nft',
  reducer: state => {
    return {
      user: state.user
    }
  }
})

const store = createStore({
  plugins: [persistedState],
  state,
  actions,
  getters,
  mutations
})

export default store
