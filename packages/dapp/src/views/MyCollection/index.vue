<template>
  <div class="my-collection-wrapper">
    <div v-if="currentAccount" class="my-collection">
      <el-row>
        <el-col :span="12">
          <h1>
            <el-icon :size="24" class="text-yellow-500"><star /></el-icon>
            My Collection
          </h1>
        </el-col>
        <el-col :span="12" class="flex items-center justify-end">
          <el-button
            class="create-btn"
            type="primary"
            size="medium"
            round
            @click="createFormVisible = true"
          >CREATE</el-button>
          <el-button
            class="ml-5"
            type="text"
            size="medium"
            @click="handleCollectionReload"
          >
            <el-icon :size="26"><refresh /></el-icon>
          </el-button>
        </el-col>
      </el-row>

      <CollectableNew
        :visible="createFormVisible"
        @close="createFormVisible=false"
        @mint="handleTradeReload"
      />

      <CollectableList
        ref="collectableListEl"
        @sell="handleTradeReload"
      />

      <el-divider class="my-12" />

      <el-row>
        <el-col :span="12">
          <h1>
            <el-icon :size="24" class="text-yellow-500"><sell /></el-icon>
            On Sale
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

      <TradeList
        ref="tradeListEl"
        @cancel-sell="handleCollectionReload"
      />
    </div>

    <div v-else class="my-collection-tip">
      <el-empty>
        <template #description>
          <div class="text-sm">Please connect your wallet to continue ..</div>
        </template>
        <el-button type="primary" @click="handleConnectWallet">CONNECT WALLET</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { Star, Sell, Refresh } from '@element-plus/icons-vue'
import { ACTION_TYPES } from '@/util/constants'

import CollectableNew from './collectableNew.vue'
import CollectableList from './colletableList.vue'
import TradeList from './tradeList.vue'

const store = useStore()

const createFormVisible = ref(false)
const collectableListEl = ref()
const tradeListEl = ref()
const currentAccount = computed(() => store.getters['currentAccount'])

const handleConnectWallet = () => {
  store.dispatch(ACTION_TYPES.CONNECT_WALLET)
}

const handleCollectionReload = () => {
  collectableListEl.value.loadCollectables()
}

const handleTradeReload = () => {
  tradeListEl.value.loadTrades()
}

</script>

<style lang="scss" scoped>
.create-btn {
  width: 140px;
}
</style>

<style lang="scss">
.image-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.image-uploader .el-upload:hover {
  border-color: #409eff;
}
.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.image-uploader-icon svg {
  margin-top: 74px; /* (178px - 28px) / 2 - 1px */
}
.image {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
