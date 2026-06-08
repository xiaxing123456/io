import { initApp } from '@admin-vue/utils/app-init';
import { createApp } from 'vue';
import App from './App.vue';
// import './style.css';

// styles
import '@admin-vue/assets/style/index.scss';
import '@admin-vue/assets/style/tailwind.css';

const app = createApp(App);

const installAll = async () => {
  const $_app = await initApp(app);
  $_app.mount('#app');
};
installAll();
