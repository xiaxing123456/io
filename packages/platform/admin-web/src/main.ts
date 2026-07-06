import { initApp } from '@admin-web/utils/app-init';
import { createApp } from 'vue';
import App from './App.vue';
import './style.css';

const app = createApp(App);

const installAll = async () => {
  const $_app = await initApp(app);
  $_app.mount('#app');
};
installAll();
