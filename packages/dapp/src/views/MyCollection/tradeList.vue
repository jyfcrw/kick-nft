<template>
  <el-row>
    <el-col>
      <el-space wrap :size="30" alignment="align-items">
        <el-card v-for="(item, index) in trades" :key="index" class="trade-card">
          <img :src="item.token.image" class="image">
          <div>
            <div class="name truncate ...">
              {{ item.token.name }}
            </div>
            <div class="bottom flex justify-between">
              <span class="flex items-center"><el-icon class="mr-1 text-gray-400" :size="18"><coin /></el-icon> {{ item.price }} ETH</span>
              <el-popconfirm
                v-if="item.status === 'Open'"
                title="Are you sure to cancel?"
                @confirm="handleCancelItem(item)"
              >
                <template #reference>
                  <el-button type="default" round>Cancel</el-button>
                </template>
              </el-popconfirm>
              <el-tag v-else-if="item.status === 'Executed'" effect="plain">{{ item.status }}</el-tag>
              <el-tag v-else type="info">{{ item.status }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-space>

      <el-empty
        v-if="trades.length === 0"
        :image-size="150"
        description="No selling collectable for now"
      />
    </el-col>
  </el-row>
</template>

<script setup>
import { reactive, computed, onMounted, defineExpose, defineEmits } from 'vue'
import { useStore } from 'vuex'
import Web3 from 'web3'
import { ElMessage } from 'element-plus'
import { Coin } from '@element-plus/icons-vue'
import { CONTRACTS } from '@/util/constants'
import { convertIpfsUrl } from '@/util/helpers'

const store = useStore()
const emit = defineEmits(['cancel-sell'])
const trades = reactive([])

const currentAccount = computed(() => store.getters['currentAccount'])
const KiCollectable = computed(() => store.state.contracts[CONTRACTS.KICOLLECTABLE])
const Marketplace = computed(() => store.state.contracts[CONTRACTS.MARKETPLACE])

onMounted(async() => {
  await loadTrades()
})

const loadTrades = async() => {
  trades.length = 0

  const totalTrade = await Marketplace.value.methods.totalTradeOf(currentAccount.value).call({ from: currentAccount.value })
  for (let index = 0; index < totalTrade; index++) {
    const tradeId = await Marketplace.value.methods.tradeOfPosterByIndex(currentAccount.value, index).call({ from: currentAccount.value })
    const tradeData = await Marketplace.value.methods.getTrade(tradeId).call({ from: currentAccount.value })
    // console.log(tradeData)

    const poster = tradeData[0]
    const tokenId = tradeData[1]
    const priceInWei = tradeData[2]
    const status = Web3.utils.hexToUtf8(tradeData[3])

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
}

const handleCancelItem = async(trade) => {
  try {
    await Marketplace.value.methods.cancelTrade(trade.id).send({
      from: currentAccount.value,
    })
    ElMessage.success('Operation succeeded. ')
    loadTrades()
    emit('cancel-sell', trade)
  } catch (error) {
    ElMessage.error('Failed to cancel selling. ' + error?.message)
  }
}

defineExpose({ loadTrades })

</script>

<style lang="scss" scoped>
.trade-card {
  --el-card-padding: 0;
  width: 260px;

  .image {
    width: 260px;
    height: 260px;
    object-fit: cover;
  }

  .name {
    width: 100%;
    font-size: 20px;
    padding: 15px;
  }

  .bottom {
    padding: 0 15px 15px;
    button {
      width: 80px;
    }
  }
}
</style>
