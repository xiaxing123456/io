import { i18n } from '@admin-vue/i18n';
import VxeUI from 'vxe-pc-ui';
import 'vxe-pc-ui/lib/style.css';
import VXETable from 'vxe-table';
import 'vxe-table-plugin-element/dist/style.css';
import 'vxe-table/lib/style.css';
import 'xe-utils';

// 全局配置项(见文档)
VXETable.setConfig({
  i18n: (key, args) => i18n.global.t(key, args),
});

export { VXETable, VxeUI };
