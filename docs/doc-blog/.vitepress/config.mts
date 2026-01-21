import { defineConfig } from 'vitepress';
import { nav } from './nav-config.mjs';
import { sidebarPlugin } from './sidebar-config/index';

const base = `/${process.env.VITE_DOCS_NAME}/${process.env.VITE_DOCS_VERSION}`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: process.env.VITE_DOCS_TITLE,
    description: process.env.DESCRIPTION,
    base,
    head: [
        [
            'link',
            {
                rel: 'icon',
                href: `${base}/icon.png`, // 图标路径统一
            },
        ],
    ],
    assetsDir: 'static',
    outDir: './dist',
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        search: {
            provider: 'local',
            options: {
                miniSearch: {
                    options: {
                        // 自定义分词函数，可以根据具体语言特性来优化
                        tokenize: text => {
                            const subTokenize = (word: string): string[] => {
                                const result: string[] = [];
                                const minWordLength = 5; // 仅对长度大于等于此值的单词执行操作
                                const subTokenLength = 3; // 子串的长度

                                if (word.length >= minWordLength) {
                                    // 添加单词的开始和结束部分作为子串
                                    result.push(word.substring(0, subTokenLength));
                                    result.push(word.substring(word.length - subTokenLength));
                                }

                                return result;
                            };
                            const tokens: string[] = []; // 分词结果数组
                            let buffer = ''; // 用于暂存字符的缓冲区

                            for (let i = 0; i < text.length; i++) {
                                const char = text[i];
                                if (/[\u4e00-\u9fa5]/.test(char)) {
                                    // 中文字符处理: 直接作为单独的token
                                    if (buffer) {
                                        tokens.push(buffer);
                                        buffer = '';
                                    }
                                    tokens.push(char);
                                } else if (/\s/.test(char)) {
                                    // 空白字符处理: 作为英文单词的分隔符
                                    if (buffer) {
                                        tokens.push(buffer);
                                        buffer = '';
                                    }
                                } else {
                                    // 英文和其他字符处理: 加入缓冲区等待分割
                                    buffer += char;
                                }
                            }

                            // 处理最后的缓冲区内的英文单词
                            if (buffer) {
                                tokens.push(buffer);
                            }

                            return tokens.flatMap(token =>
                                // 对每个token，除了直接返回自身外，还可以返回其子串作为潜在的搜索关键字，以实现更灵活的匹配
                                // 注意：这将增加索引的大小，可能影响性能，根据实际需要调整
                                [token].concat(subTokenize(token))
                            );
                        },
                        // 自定义字段提取函数，可以根据文档结构调整
                        extractField: (document, fieldName) => {
                            // 默认行为：直接返回字段值
                            return document[fieldName];
                        },
                        // 处理搜索项，例如小写化以增加匹配的灵活性
                        processTerm: term => {
                            return term.toLowerCase();
                        },
                    },
                },
            },
        },
        // 侧边栏层级
        outline: [0, 6],
        outlineTitle: '导览',
        // 上下篇
        docFooter: { prev: '上一篇', next: '下一篇' },
        nav: nav(),
        sidebar: {
            'blog/': {
                base: '/blog/',
                items: sidebarPlugin(),
            },
        },

        socialLinks: [{ icon: 'github', link: 'https://github.com/vuejs/vitepress' }],
    },
});
