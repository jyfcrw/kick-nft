<template>
  <div class="navbar">
    <div class="logo">
      <span>KICK</span>
      <span class="text-gray-300 mx-1">-</span>
      <span>NFT</span>
    </div>

    <el-menu class="menu" mode="horizontal">
      <el-menu-item index="1">
        <router-link to="/marketplace">Marketplace</router-link>
      </el-menu-item>
      <el-menu-item index="2">
        <router-link to="/my-collection">My Collection</router-link>
      </el-menu-item>
    </el-menu>

    <div class="right-menu">
      <template v-if="currentAccount">
        <el-dropdown class="right-menu-item" trigger="click">
          <div class="avatar-wrapper flex items-center">
            <el-avatar :size="26" shape="square" :src="avatarUrl" />
            <span class="mx-2">{{ accountName }}</span>
          </div>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleDisconnectWallet">
                <div>Disconnect</div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>

      <div
        v-else
        class="right-menu-item connect-wallet"
        @click="handleConnectWallet"
      >
        <el-icon :size="24"><wallet /></el-icon>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Web3 from 'web3'
import { Wallet } from '@element-plus/icons-vue'
import ethereumBlockies from 'ethereum-blockies'
import { ACTION_TYPES, IDENTICON_COLORS } from '@/util/constants'
import { truncate } from 'lodash'

function generateAvatar(seed) {
  const colorPosition = Math.abs(
    Web3.utils.keccak256(seed) % IDENTICON_COLORS.length
  )
  const identiconColor = IDENTICON_COLORS[colorPosition]
  return ethereumBlockies
    .create({
      seed,
      color: identiconColor.color,
      bgcolor: identiconColor.bgColor,
      size: 8,
      scale: 13,
      spotcolor: identiconColor.spotColor,
    })
    .toDataURL()
}

export default {
  name: 'TopBar',
  components: {
    Wallet,
  },
  computed: {
    ...mapGetters(['currentAccount']),
    avatarUrl() {
      return this.currentAccount ? generateAvatar(this.currentAccount) : ''
    },
    accountName() {
      return truncate(this.currentAccount, { length: 12 })
    },
  },
  methods: {
    handleConnectWallet() {
      this.$store.dispatch(ACTION_TYPES.CONNECT_WALLET)
    },
    handleDisconnectWallet() {
      this.$store.dispatch(ACTION_TYPES.DISCONNECT_WALLET)
    },
  },
}
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  height: 100%;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logo {
  padding: 0 30px;
  font-size: 24px;
  font-weight: bold;
  border-right: 1px solid #efefef;
}

.menu {
  flex: 1;
  border-bottom: 0;
  padding: 0 30px;

  .el-menu-item {
    font-weight: bold;
  }
}

.right-menu {
  padding: 0 30px;
  display: flex;

  .el-icon {
    --color: #222;
    cursor: pointer;
  }
}

.right-menu-item {
  padding: 0 30px;
}
</style>
