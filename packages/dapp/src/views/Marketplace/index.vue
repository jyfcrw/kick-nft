<template>
  <div class="marketplace-wrapper">
    <el-row>
      <el-col :span="12">
        <h1>
          <el-icon :size="24" class="text-purple-500"><shopping-cart-full /></el-icon>
          Marketplace
        </h1>
      </el-col>
      <el-col :span="12" class="flex items-center justify-end">
        <el-button
          class="ml-5"
          type="text"
          size="medium"
          @click="handleTradeReload"
        >
          <el-icon :size="26"><refresh /></el-icon>
        </el-button>
      </el-col>
    </el-row>

    <el-row>
      <el-col>
        <TradeList
          ref="tradeListEl"
          @buy="handleTradeItem"
        />

        <el-dialog v-model="tradeBoxVisible" title="Buy KI-NFT" custom-class="trade-dialog">
          <el-row :gutter="20">
            <el-col :span="16">
              <img :src="tradeItem.token.image" class="image">
            </el-col>
            <el-col :span="8">
              <div class="content">
                <h1>{{ tradeItem.token.name }}</h1>
                <div class="text-gray-400 text-sm truncate ...">
                  Owner: {{ isYours(tradeItem) ? 'You' : tradeItem.poster }}
                </div>
                <p>{{ tradeItem.token.description }}</p>
                <div class="checkout">
                  <el-divider />
                  <div class="price flex justify-between items-center">
                    <span class="flex items-center">
                      <el-icon class="mr-1 text-yellow-400" :size="24"><coin /></el-icon>
                      <span class="text-sm font-bold">PRICE</span>
                    </span>
                    <span>{{ tradeItem.price }} ETH</span>
                  </div>

                  <el-button
                    v-if="!currentAccount"
                    class="buy-btn"
                    type="default"
                    round
                    @click="handleConnectWallet"
                  >
                    Connect wallet to buy
                  </el-button>
                  <el-button
                    v-else-if="!isYours(tradeItem)"
                    class="buy-btn"
                    type="primary"
                    round
                    @click="handleTradeConfirm"
                  >
                    CONFIRM
                  </el-button>
                  <el-button
                    v-else
                    disabled
                    class="buy-btn"
                    type="default"
                    round
                  >
                    You own it
                  </el-button>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-dialog>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { ShoppingCartFull, Coin, Refresh } from '@element-plus/icons-vue'
import { ACTION_TYPES, CONTRACTS } from '@/util/constants'
import TradeList from './tradeList.vue'

const store = useStore()
const tradeBoxVisible = ref(false)
const tradeItem = ref(null)
const tradeListEl = ref()

const currentAccount = computed(() => store.getters['currentAccount'])
const Marketplace = computed(() => store.state.contracts[CONTRACTS.MARKETPLACE])

const isYours = (item) => {
  return currentAccount.value && item.poster.toLowerCase() === currentAccount.value
}

const handleTradeItem = (item) => {
  tradeItem.value = item
  tradeBoxVisible.value = true
}

const handleTradeConfirm = async() => {
  const tradeId = tradeItem.value.id
  const priceInWei = tradeItem.value.priceInWei

  try {
    await Marketplace.value.methods.executeTrade(tradeId).send({
      from: currentAccount.value,
      value: priceInWei,
    })
    ElMessage.success('Buy succeeded. ')
    tradeBoxVisible.value = false
    tradeListEl.value.loadOpenedTrades()
  } catch (error) {
    ElMessage.error('Failed to buy. ' + error?.message)
  }
}

const handleTradeReload = () => {
  tradeListEl.value.loadOpenedTrades()
}

const handleConnectWallet = () => {
  store.dispatch(ACTION_TYPES.CONNECT_WALLET)
}
</script>

<style lang="scss" scoped>
.trade-dialog {
  .image {
    width: 100%;
    min-height: 360px;
    max-height: 600px;
    object-fit: contain;
    background-color: black;
  }
  .content {
    min-height: 300px;
    max-height: 600px;
    height: 100%;
    position: relative;
    h1 {
      margin-top: 0;
    }
  }
  .checkout {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
  }

  .price {
    padding: 0 0 20px;
    font-size: 1.5em;
  }

  .buy-btn {
    width: 100%;
  }
}

</style>
