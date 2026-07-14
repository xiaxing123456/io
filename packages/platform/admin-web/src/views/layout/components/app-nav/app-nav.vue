<template>
  <aside class="app-nav">
    <div class="nav-box">
      <vxe-menu v-model="selectNav" :options="userStore.navigationMenuTreeList"></vxe-menu>
    </div>
    <div class="nav-foot" @click="changeNavigationType">
      {{ menuModelTitle }}
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { MenuStatus } from '@admin-web/enums/global.enum';
import { userAccessStore } from '@admin-web/stores/modules/user-access';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

defineOptions({
  name: 'AppNav',
});

const route = useRoute();
const router = useRouter();
const userStore = userAccessStore();

const selectNav = computed(() => route.name as string);

const menuModelTitle = computed(() =>
  userStore.navigationType === MenuStatus.CompanyManagement ? '公司管理' : '个人中心'
);
const changeNavigationType = async () => {
  userStore.changeNavigationType();
  await userStore.updateUserMenu();
  router.push('/');
  console.log('changeNavigationType', userStore.navigationMenuTreeList);
};
</script>

<style lang="scss" scoped>
.app-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
  .nav-box {
    flex: 1;
    overflow: auto;
  }
  .nav-foot {
    padding: 20px;
    cursor: pointer;
  }
}
</style>
