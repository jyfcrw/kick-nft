<template>
  <div ref="loadingTarget" class="trade-list">
    <el-space wrap :size="30" alignment="align-items">
      <el-card v-for="(item, index) in trades" :key="index" class="trade-card">
        <img :src="item.token.image" class="image">
        <div>
          <div class="name truncate ...">
            {{ item.token.name }}
          </div>
          <div class="bottom flex justify-between">
            <span class="flex items-center text-lg">
              <el-icon class="mr-1 text-yellow-400" :size="18"><coin /></el-icon>
              {{ item.price }} ETH
            </span>
            <el-button type="primary" round @click="handleBuy(item)">BUY</el-button>
          </div>
        </div>
      </el-card>
    </el-space>

    <el-empty
      v-if="!loading && trades.length === 0"
      :image-size="150"
      description="No opened selling collectable for now"
    />
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, defineEmits, defineExpose } from 'vue'
import { useStore } from 'vuex'
import Web3 from 'web3'
import { Coin } from '@element-plus/icons-vue'
import { CONTRACTS } from '@/util/constants'
import { convertIpfsUrl } from '@/util/helpers'
import useLoading from '@/composables/useLoading'

const store = useStore()
const emit = defineEmits(['buy'])
const currentAccount = computed(() => store.getters['currentAccount'])
const KiCollectable = computed(() => store.state.contracts[CONTRACTS.KICOLLECTABLE])
const Marketplace = computed(() => store.state.contracts[CONTRACTS.MARKETPLACE])
const trades = reactive([])
const { loading, loadingTarget, wrapLoading } = useLoading()

onMounted(async() => {
  loadOpenedTrades()
})

const loadOpenedTrades = () => {
  wrapLoading(async() => {
    trades.length = 0

    const totalTrade = await Marketplace.value.methods.totalTrade().call({ from: currentAccount.value })
    for (let index = 0; index < totalTrade; index++) {
      const tradeId = index
      const tradeData = await Marketplace.value.methods.getTrade(tradeId).call({ from: currentAccount.value })
      // console.log(tradeData)

      const poster = tradeData[0]
      const tokenId = tradeData[1]
      const priceInWei = tradeData[2]
      const status = Web3.utils.hexToUtf8(tradeData[3])

      if (status !== 'Open') {
        // skip invalid trades
        continue
      }

      const tokenURI = await KiCollectable.value.methods.tokenURI(tokenId).call({ from: currentAccount.value })
      const metadata = await fetch(tokenURI).then(resp => resp.json())
      metadata.image = convertIpfsUrl(metadata.image)

      trades.push({
        id: tradeId,
        poster,

        priceInWei,
        price: Web3.utils.fromWei(priceInWei.toString(), 'ether'),
        status,
        token: {
          id: tokenId,
          ...metadata
        }
      })
    }
  })
}

const handleBuy = (item) => {
  emit('buy', item)
}

defineExpose({ loadOpenedTrades })
</script>

<style lang="scss" scoped>
.trade-list {
  min-height: 500px;
}

.trade-card {
  --el-card-padding: 0;
  width: 320px;

  .image {
    width: 320px;
    height: 320px;
    object-fit: cover;
  }

  .name {
    width: 100%;
    font-size: 24px;
    padding: 15px;
  }

  .bottom {
    padding: 0 15px 15px;
    button {
      width: 120px;
      font-size: 1.1em;
    }
  }
}
</style>
