<template>
  <div class="plt-container">
    <div></div>
    <div class="plt-grid-wrap">
      <plt-grid ref="pltGridRef" v-bind="pltGridOption"></plt-grid>
      <vxe-grid v-bind="pltGridOption"></vxe-grid>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { companyUser } from '@admin-vue/views/company-user/company-user';

const { pltGridRef, pltGridOption } = companyUser();
</script>

<style lang="scss" scoped>
.plt-grid-wrap {
  height: calc(100% - 52px);
}
</style>
