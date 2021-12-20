<template>
  <div class="main-body" :class="{ 'is-full': isFullContainer }">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    isFullContainer() {
      return !!this.$route.meta.fullContainer
    },
  },
}
</script>

<style lang="scss" scoped>
.main-body {
  padding: 25px;

  &.is-full {
    padding: 0;
    margin: 0;
  }
}
</style>
