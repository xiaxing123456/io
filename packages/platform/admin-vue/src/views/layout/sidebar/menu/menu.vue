<template>
  <div class="menu-demo">
    <plt-menu
      :data="menus"
      :min-size="42"
      default-active="/system/user"
      @node-click="handleNodeClick"
    />
  </div>
</template>

<script lang="ts" setup>
const menus = [
  {
    value: 'home',
    label: '首页',
    path: '/home',
  },
  {
    value: 'system',
    label: '系统管理',
    children: [
      {
        value: 'system-user',
        label: '用户管理',
        path: '/system/user',
      },
      {
        value: 'system-role',
        label: '角色管理',
        path: '/system/role',
      },
    ],
  },
];

const handleNodeClick = (data: any, node: any, event: MouseEvent) => {
  console.log('点击菜单：', data, node, event);
};
</script>

<style lang="scss" scoped>
.menu-demo {
  height: 100%;
}

:deep(.plt-virtually-list__client) {
  height: 100%;
  overflow-y: auto;
}
</style>
