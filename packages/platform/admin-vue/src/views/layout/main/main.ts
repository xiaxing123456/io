import { ref } from 'vue';

export const main = () => {
  const layoutMainList = ref([
    { key: 'nav', slot: 'nav', width: 260, minWidth: 80, maxWidth: 400 },
    { key: 'main', slot: 'main' },
  ]);

  return {
    layoutMainList,
  };
};
