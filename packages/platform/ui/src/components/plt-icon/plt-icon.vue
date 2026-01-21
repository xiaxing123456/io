<!-- eslint-disable vue/no-v-html -->
<template>
    <component
        :is="resolvedIconComponent"
        v-if="resolvedIconComponent"
        :style="style"
        class="font-svg"
        v-bind="attrs"
    />
    <!-- 因为菜单中对span做了隐藏处理，这里暂时用div -->
    <div
        v-else-if="svgUse"
        ref="svgEl"
        :style="style"
        class="svg-box inline-block"
        v-html="svgUse"
    />
    <i v-else :class="icon" class="iconfont inline-block text-center" :style="style"></i>
</template>

<script lang="ts">
import * as Icons from '@element-plus/icons-vue';
import type { CSSProperties } from 'vue';
import { computed, defineComponent, nextTick, onMounted, ref, watch } from 'vue';
import { fontToSvgMap } from './font-mapping-icon';

export default defineComponent({
    name: 'PltIcon',
    props: {
        size: {
            type: [Number, String],
            default: 16,
        },
        color: {
            type: String,
            default: '',
        },
        svg: {
            type: String,
            default: '',
        },
        icon: {
            type: String,
            default: '',
        },
    },
    setup(props, { attrs }) {
        const svgEl = ref();
        /** 把props.svg中所有id和使用id的元素都统一加上唯一前缀，防止id冲突
         * - 由于系统中使用的主题svg大批量使用了重复的id，导致指向错误显示异常
         * - 参考https://github.com/jpkleemans/vite-svg-loader/issues/122
         */
        const svgUse = computed(() => {
            if (!props.svg) return '';
            const timestamp = Date.now() + Math.floor(Math.random() * 1000); // 获取时间戳+随机数，处理唯一
            return props.svg
                .replace(/(id=")(.*?")/gi, `$1${timestamp}-$2`)
                .replace(/(url\(#)(.*?\))/gi, `$1${timestamp}-$2`)
                .replace(/(href="#)(.*?")/gi, `$1${timestamp}-$2`);
        });

        /** 设置svg图标大小和颜色 */
        const setSvgSizeAndColor = () => {
            if (props.svg && svgEl.value) {
                svgEl.value.style.setProperty('--plt-icon-svg-size', `${props.size}px`);

                if (props.color) {
                    const pathList = Array.from(svgEl.value.getElementsByTagName('path'));
                    (pathList as HTMLElement[])?.forEach(element => {
                        element.style.setProperty('fill', props.color);
                    });
                }
            }
        };

        onMounted(() => {
            setSvgSizeAndColor();
        });

        watch(
            () => props.svg,
            () => {
                nextTick(() => {
                    setSvgSizeAndColor();
                });
            }
        );

        /**
         * 解析图标
         * 目前element-plus原有的font-icon，在element-plus升级后，已被废弃，改为基于 SVG 的图标组件
         * 所以这里做了兼容处理，通过映射来渲染新版本的图标组件
         */
        const resolvedIconComponent = computed(() => {
            const iconKey: string | undefined = props.icon;

            // 第一步：从 props.icon 中提取（如果存在）
            if (typeof iconKey === 'string' && iconKey.trim()) {
                const directMatch = fontToSvgMap[iconKey] || iconKey;
                if (directMatch in Icons) {
                    return Icons[directMatch];
                }
            }

            // 第二步：从 props.class 中匹配出 icon-* 或 el-icon-* 的类名
            if (typeof attrs.class === 'string') {
                const match = attrs.class.match(/\b(?:el-icon|icon)-([a-zA-Z0-9_-]+)\b/);

                if (match) {
                    const classKey = match[0]; // 提取到 xxx
                    const iconName = fontToSvgMap[classKey] || classKey;
                    if (iconName in Icons) {
                        return Icons[iconName];
                    }
                }
            }

            // 都匹配不到，返回 null
            return null;
        });

        return {
            resolvedIconComponent,
            svgEl,
            svgUse,
            Icons,
            attrs,
            style: computed(() => {
                /**
                 * elementIcon 映射的svg不需要右边距
                 */
                const mapIconStyle = resolvedIconComponent.value ? { marginRight: 0 } : {};

                if (!props.size && !props.color) {
                    return mapIconStyle;
                }
                return {
                    ...(props.size ? { 'font-size': `${props.size}px` } : {}),
                    ...(props.color ? { color: props.color } : {}),
                    ...mapIconStyle,
                } as CSSProperties;
            }),
        };
    },
});
</script>
<style lang="scss" scoped>
:deep(svg),
.font-svg {
    display: inline-block;
    width: var(--plt-icon-svg-size);
    height: var(--plt-icon-svg-size);
    vertical-align: baseline !important;
    margin-right: var(--plt-basic-margin-s);
}

.font-svg {
    margin-right: var(--plt-basic-margin-s);
}
</style>
