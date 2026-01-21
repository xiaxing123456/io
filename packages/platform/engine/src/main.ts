// 优先注册全局变量
import '@engine/utils/global-var';
// styles
import '@engine/assets/style/index.scss';
import '@engine/assets/style/tailwind.css';

import App from '@engine/App.vue';
import router from '@engine/router';
import { initApp } from '@engine/utils/app-init';
import { createApp } from 'vue';

const app = createApp(App);
const installAll = async () => {
    try {
        const $_app = await initApp(app);
        $_app.use(router).mount('#app');
    } catch (error) {}
};

installAll();
