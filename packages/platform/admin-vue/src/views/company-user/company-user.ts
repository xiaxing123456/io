import { ref } from 'vue';

export const companyUser = () => {
  const pltGridRef = ref();
  const pltGridOption = ref({
    border: true,
    columns: [
      {
        field: 'account',
        title: '账户',
      },
      {
        field: 'username',
        title: '姓名',
      },
      {
        field: 'email',
        title: '邮箱',
      },
      {
        field: 'phone',
        title: '电话',
      },
      {
        field: 'role',
        title: '角色',
      },
      {
        field: 'state',
        title: '状态',
      },
    ],
    data: [
      {
        account: 'admin',
        username: '管理员',
        email: '<EMAIL>',
        phone: '12345678901',
        role: '管理员',
        state: '正常',
      },
      {
        account: 'user',
        username: '用户',
        email: '<EMAIL>',
        phone: '12345678901',
        role: '用户',
        state: '正常',
      },
    ],
  });
  return { pltGridRef, pltGridOption };
};
