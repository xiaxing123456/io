<template>
  <div class="user-avatar-button">
    <el-dropdown
      trigger="click"
      popper-class="user-dropdown-menu"
      placement="bottom-start"
      @command="triggerCommand"
    >
      <plt-user-avatar v-bind="userInfo"></plt-user-avatar>
      <template #dropdown>
        <el-dropdown-menu>
          <!-- 平台个人首选项的自定义内容 -->
          <div class="person">
            <!-- 个人信息 -->
            <!-- 个性化设置 -->
            <!-- 地区格式 -->
            <div class="person-region">
              <div class="person-region__title">{{ $t('main_page.regionalFormat') }}</div>
              <div class="person-region__content">
                <el-form label-position="top">
                  <el-form-item label="语言">
                    <plt-select v-model="currentLocale" @change="handleLocaleChange">
                      <el-option
                        v-for="item in localeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </plt-select>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>
          <el-dropdown-item
            v-for="item in personDropdownItem"
            :key="item.value"
            :command="item.value"
          >
            {{ item.label }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script lang="ts" setup>
import { logout } from '@admin-vue/apis/login';
import { useApi } from '@admin-vue/composables/use-api';
import { $t, i18n, loadLocaleMessages, localeOptions, SystemLanguage } from '@admin-vue/i18n';
import { userAccessStore } from '@admin-vue/stores';
import { PersonDropdownItemEnum } from '@admin-vue/views/layout/header/components/user-avatar-button/user-avatar-button.enum';
import { computed, ref } from 'vue';

// 获取用户信息
const userAccess = userAccessStore();
const userInfo = computed(() => {
  return {
    id: userAccess.userInfo.id,
    avatar: userAccess.userInfo.avatar,
    username: userAccess.userInfo.name,
    showName: true,
  };
});

// 语言切换
const currentLocale = ref(i18n.global.locale.value);
const handleLocaleChange = async (val: SystemLanguage) => {
  await loadLocaleMessages(val);
  currentLocale.value = val;
};

const personDropdownItem = ref([
  {
    label: '退出登录',
    value: PersonDropdownItemEnum.logout,
  },
]);

/** 退出登录 */
const triggerLogout = useApi(
  async () => {
    await logout(userInfo.value.id);
  },
  undefined,
  { showLoading: false }
).fetchResource;

const triggerCommand = (val: PersonDropdownItemEnum) => {
  switch (val) {
    case PersonDropdownItemEnum.logout:
      triggerLogout();
      break;
  }
};
</script>

<style lang="scss" scoped>
.user-dropdown-menu .el-dropdown-menu {
  width: 300px;
}
.person {
  padding: var(--plt-basic-padding-l) var(--plt-basic-padding-l) 0;
  .person-region {
    border-top: 1px solid var(--plt-basic-border-color-main);
    &__title {
      font-weight: var(--plt-basic-font-weight-bold);
    }
  }
}
</style>
