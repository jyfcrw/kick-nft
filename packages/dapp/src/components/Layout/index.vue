<template>
  <div class="main-container">
    <top-bar />
    <main-body />
  </div>
</template>

<script>
import TopBar from './TopBar.vue'
import MainBody from './MainBody.vue'

export default {
  components: {
    TopBar,
    MainBody,
  },
}
</script>

<style lang="scss" scoped>
.main-container {
  width: 100%;
  @include clearfix;
}

.el-header {
  --el-header-padding: 0;
}
</style>
