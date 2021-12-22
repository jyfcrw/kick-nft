<template>
  <el-dialog v-model="visible" title="Create a Kick NFT">
    <el-form ref="formEl" :model="form" :rules="rules" :disabled="creating">
      <el-form-item label="Image" prop="image" :label-width="120">
        <el-upload
          class="image-uploader"
          action=""
          :show-file-list="false"
          :http-request="handleImageUpload"
          :before-upload="beforeImageUpload"
        >
          <img v-if="form.image" :src="imageUrl" class="avatar">
          <el-icon v-else class="image-uploader-icon"><plus /></el-icon>
        </el-upload>
        <div class="text-xs">File types supported: JPG, PNG, GIF, File size &lt; 10MB</div>
      </el-form-item>
      <el-form-item label="Name" prop="name" :label-width="120">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="Description" prop="description" :label-width="120">
        <el-input v-model="form.description" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">Cancel</el-button>
        <el-button type="primary" :loading="creating" @click="handleConfirm">CONFIRM</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits, reactive, toRefs, ref, computed } from 'vue'
import { useStore } from 'vuex'
import { CONTRACTS } from '@/util/constants'
import { NFTStorage } from 'nft.storage'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const store = useStore()
const props = defineProps({
  visible: Boolean,
})
const emit = defineEmits(['close', 'mint'])

const creating = ref(false)
const formEl = ref(null)
const form = reactive({
  image: null,
  name: null,
  description: null,
})

const { visible } = toRefs(props)
const imageUrl = computed(() => {
  return form.image ? URL.createObjectURL(form.image) : ''
})

const currentAccount = computed(() => store.getters['currentAccount'])
const KiCollectable = computed(() => store.state.contracts[CONTRACTS.KICOLLECTABLE])

const rules = reactive({
  image: [
    {
      required: true,
      message: 'Please upload image',
      trigger: 'change',
    },
  ],
  name: [
    {
      required: true,
      message: 'Please input collectable name',
      trigger: 'blur',
    },
    {
      min: 8,
      message: 'Length should be greater than 8',
      trigger: 'blur',
    },
  ],
  description: [
    {
      required: true,
      message: 'Please input collectable description',
      trigger: 'blur',
    },
  ],
})

const handleCancel = async() => {
  emit('close')
}

const handleConfirm = () => {
  formEl.value.validate(async(valid) => {
    if (valid) {
      creating.value = true

      try {
        const metadata = await storeNFTToIPFS(form)
        const tokenURI = metadata.url.replace(/^ipfs:\/\//, '')
        // console.log(tokenURI, currentAccount.value)

        await KiCollectable.value.methods.mintToken(currentAccount.value, tokenURI).send({
          from: currentAccount.value,
        })
        // console.log('receipt: ', receipt)
        creating.value = false
        formEl.value.resetFields()
        ElMessage.success('Mint NFT successfully !')
        emit('close')
        emit('mint')
      } catch (error) {
        ElMessage.error('Failed to create NFT. ' + error?.message)
      }
    }
  })
}

const storeNFTToIPFS = async(data) => {
  const client = new NFTStorage({ token: import.meta.env.VITE_NFT_STORAGE })
  const metadata = await client.store(data)
  return metadata
}

const handleImageUpload = (req) => {
  form.image = req.file
  return true
}

const beforeImageUpload = (file) => {
  const isTyValid = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isTyValid) {
    ElMessage.error('Image must be JPG/PNG/GIF format!')
  }
  if (!isLt10M) {
    ElMessage.error('Image size can not exceed 10MB!')
  }
  return isTyValid && isLt10M
}

</script>
