import { defineComponent, h, onBeforeUnmount, onMounted, PropType, ref } from 'vue';

export default defineComponent({
  name: 'PltObserverItem',
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
    resizeObserver: {
      type: Object as PropType<ResizeObserver | undefined>,
      required: true,
    },
    fullPath: {
      type: String,
      default: '',
    },
    class: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const pltObserverItemRef = ref();

    onMounted(() => {
      if (!props.resizeObserver || pltObserverItemRef.value) return;
      props.resizeObserver.observe(pltObserverItemRef.value);
    });

    onBeforeUnmount(() => {
      if (!props.resizeObserver || pltObserverItemRef.value) return;
      props.resizeObserver.unobserve(pltObserverItemRef.value);
    });

    return {
      pltObserverItemRef,
    };
  },
  render() {
    return h(
      'div',
      {
        ref: 'pltObserverItemRef',
        class: this.class,
        'data-id': this.id,
        'full-path': this.fullPath,
      },
      [this.$slots.default?.()]
    );
  },
});
