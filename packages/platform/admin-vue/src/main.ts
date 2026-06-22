// 优先注册全局变量
import '@admin-vue/utils/global-var';

import { initApp } from '@admin-vue/utils/app-init';
import { createApp } from 'vue';
import App from './App.vue';

// styles
import '@admin-vue/assets/style/index.scss';

// mock
import '@admin-vue/apis/moke';

const app = createApp(App);

const installAll = async () => {
  const $_app = await initApp(app);
  $_app.mount('#app');
};
installAll();
