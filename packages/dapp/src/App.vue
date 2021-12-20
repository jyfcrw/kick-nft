<template>
  <router-view class="app__main" />
</template>

<script setup>
import { ACTION_TYPES } from '@/util/constants'
import { useStore } from 'vuex'

const store = useStore()
store.dispatch(ACTION_TYPES.INIT_WEB3)
</script>
