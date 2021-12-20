<template>
  <el-row>
    <el-col>
      <el-space wrap :size="30" alignment="align-items">
        <el-card v-for="(item, index) in collectables" :key="index" class="collectable-card">
          <img :src="item.image" class="image">
          <div>
            <div class="name truncate ...">
              {{ item.name }}
            </div>
            <div class="bottom flex justify-between">
              <el-button type="primary" round @click="handleViewItem(item)">View</el-button>
              <el-button type="default" round @click="handleSellItem(item)">Sell</el-button>
            </div>
          </div>
        </el-card>
      </el-space>

      <el-empty
        v-if="collectables.length === 0"
        :image-size="150"
        description="Collection is empty! try to create one"
      />

      <el-dialog v-model="viewBoxVisible" title="View KI-NFT" custom-class="view-dialog">
        <el-row :gutter="20">
          <el-col :span="16">
            <img :src="viewItem.image" class="image">
          </el-col>
          <el-col :span="8">
            <div class="content">
              <h2>{{ viewItem.name }}</h2>
              <p>{{ viewItem.description }}</p>
            </div>
          </el-col>
        </el-row>
      </el-dialog>

      <el-dialog v-model="sellFormVisible" :width="360" title="Sell KI-NFT" custom-class="sell-dialog">
        <div class="content">
          <el-avatar :size="80" :src="sellForm.item.image" />
          <h2>{{ sellForm.item.name }}</h2>
          <p class="truncate ...">{{ sellForm.item.description }}</p>
          <el-divider />
        </div>

        <el-form ref="sellFormEl" :model="sellForm" :rules="sellFormRules" label-position="top" :disabled="sellSubmiting">
          <el-form-item label="Price (ETH)" prop="price" class="mb-0">
            <el-input v-model="sellForm.price" autocomplete="off" />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="handleSellCancel">Cancel</el-button>
            <el-button type="primary" :loading="sellSubmiting" @click="handleSellSubmit">CONFIRM</el-button>
          </span>
        </template>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script setup>
import { reactive, ref, computed, onMounted, defineExpose, defineEmits } from 'vue'
import { useStore } from 'vuex'
import Web3 from 'web3'
import { ElMessage } from 'element-plus'
import { CONTRACTS } from '@/util/constants'
import { convertIpfsUrl } from '@/util/helpers'

const store = useStore()
const emit = defineEmits(['sell'])
const collectables = reactive([])
const viewBoxVisible = ref(false)
const viewItem = ref(null)
const sellFormVisible = ref(false)
const sellSubmiting = ref(false)
const sellFormEl = ref(null)
const sellForm = reactive({
  item: null,
  price: 0 // in ETH
})

const validatePrice = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('Please input selling price'))
  } else {
    try {
      Web3.utils.toWei(value, 'ether')
      callback()
    } catch (error) {
      callback(new Error('Invalid ether value'))
    }
  }
}
const sellFormRules = reactive({
  price: [{ validator: validatePrice, trigger: 'blur' }]
})

const currentAccount = computed(() => store.getters['currentAccount'])
const KiCollectable = computed(() => store.state.contracts[CONTRACTS.KICOLLECTABLE])
const Marketplace = computed(() => store.state.contracts[CONTRACTS.MARKETPLACE])

onMounted(async() => {
  await loadCollectables()
})

const loadCollectables = async() => {
  collectables.length = 0
  const balance = await KiCollectable.value.methods.balanceOf(currentAccount.value).call({ from: currentAccount.value })
  for (let index = 0; index < balance; index++) {
    const tokenId = await KiCollectable.value.methods.tokenOfOwnerByIndex(currentAccount.value, index).call({ from: currentAccount.value })
    const tokenURI = await KiCollectable.value.methods.tokenURI(tokenId).call({ from: currentAccount.value })
    const metadata = await fetch(tokenURI).then(resp => resp.json())
    metadata.image = convertIpfsUrl(metadata.image)

    collectables.push({
      id: tokenId,
      ...metadata
    })
  }
}

const handleViewItem = (item) => {
  viewItem.value = item
  viewBoxVisible.value = true
}

const handleSellItem = (item) => {
  sellForm.item = item
  sellFormVisible.value = true
}

const handleSellCancel = () => {
  sellFormVisible.value = false
}

const handleSellSubmit = () => {
  sellFormEl.value.validate(async(valid) => {
    if (valid) {
      sellSubmiting.value = true

      try {
        const marketPlaceAddress = Marketplace.value.options.address
        await KiCollectable.value.methods.approve(marketPlaceAddress, sellForm.item.id).send({
          from: currentAccount.value,
        })

        const priceInWei = Web3.utils.toWei(sellForm.price, 'ether')
        await Marketplace.value.methods.openTrade(sellForm.item.id, priceInWei).send({
          from: currentAccount.value,
        })
        // console.log('receipt: ', receipt)
        sellSubmiting.value = false
        sellFormEl.value.resetFields()
        sellFormVisible.value = false
        loadCollectables()
        emit('sell', sellForm)
        ElMessage.success('Open trade for your NFT successfully !')
      } catch (error) {
        ElMessage.error('Failed to sell NFT. ' + error?.message)
        sellSubmiting.value = false
      }
    }
  })
}

defineExpose({ loadCollectables })

</script>

<style lang="scss" scoped>
.collectable-card {
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

.view-dialog {
  .image {
    width: 100%;
    min-height: 360px;
    max-height: 600px;
    object-fit: contain;
    background-color: black;
  }
}

.sell-dialog {
  .content {
    text-align: center;
  }
}
</style>
