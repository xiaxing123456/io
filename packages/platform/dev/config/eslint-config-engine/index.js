/**
 * ESLint 配置文件
 * 用于统一代码风格和检查代码质量
 * 基于 Airbnb 规范 + TypeScript + Vue 3 + Prettier
 */
module.exports = {
    // 标记为根配置文件，停止向上查找父级配置
    root: true,

    /**
     * 运行环境配置
     * 定义预定义的全局变量
     */
    env: {
        browser: true, // 浏览器环境全局变量 (window, document 等)
        es2021: true, // 启用 ES2021 全局变量和语法
        node: true, // Node.js 全局变量和作用域 (process, __dirname 等)
    },

    /**
     * 继承的规则集
     * 按优先级从低到高排列，后面的会覆盖前面的
     */
    extends: [
        'airbnb-base', // Airbnb JavaScript 编码规范基础版
        'plugin:@typescript-eslint/recommended', // TypeScript 推荐规则
        'plugin:vue/vue3-strongly-recommended', // Vue 3 强烈推荐规则
        'plugin:vue/vue3-recommended', // Vue 3 推荐规则
        'plugin:prettier/recommended', // Prettier 集成，必须放在最后
    ],

    /**
     * 解析器选项
     * 配置如何解析代码
     */
    parserOptions: {
        ecmaVersion: 12, // ECMAScript 版本 (ES2021)
        parser: '@typescript-eslint/parser', // TypeScript 解析器
        sourceType: 'module', // 使用 ES6 模块
    },

    /**
     * 插件设置
     * 配置导入解析器和路径解析
     */
    settings: {
        // 为不同文件扩展名指定解析器
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx', '.js', '.jsx', '.tsx'],
        },
        // 配置模块导入解析规则
        'import/resolver': {
            typescript: {
                alwaysTryTypes: true, // 总是尝试解析类型
                // TypeScript 配置文件路径（支持 monorepo）
                project: ['packages/*/tsconfig.json', 'tsconfig.json'],
            },
        },
    },

    /**
     * 使用的插件列表
     */
    plugins: ['import', 'vue', '@typescript-eslint'],

    /**
     * 自定义规则配置
     * 0 = off（关闭）, 1 = warn（警告）, 2 = error（错误）
     */
    rules: {
        // ===== 命名规范 =====
        // 关闭驼峰命名检查（允许下划线命名）
        camelcase: [
            0,
            {
                properties: 'never', // 不检查对象属性
            },
        ],

        // ===== 表达式和运算符 =====
        // 允许使用短路表达式（a && b()）
        'no-unused-expressions': [2, { allowShortCircuit: true }],
        // 允许使用 ++ 和 -- 运算符
        'no-plusplus': 0,
        // 允许使用位运算符
        'no-bitwise': 0,

        // ===== TypeScript 规则 =====
        // 允许使用 require() 导入模块
        '@typescript-eslint/no-var-requires': 0,
        // 关闭 any 类型检查（项目允许使用 any）
        '@typescript-eslint/no-explicit-any': ['off'],
        // 关闭函数返回类型必须显式声明
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        // 关闭不安全的成员访问检查
        '@typescript-eslint/no-unsafe-member-access': 'off',
        // 关闭不安全的函数调用检查
        '@typescript-eslint/no-unsafe-call': 'off',
        // 关闭不安全的赋值检查
        '@typescript-eslint/no-unsafe-assignment': 'off',

        // ===== 函数规则 =====
        // 禁止使用命名函数表达式（强制使用箭头函数或函数声明）
        'func-names': ['error', 'never'],

        // ===== 调试和日志 =====
        // 关闭 console 检查（允许使用 console.log 等）
        'no-console': 'off',
        // 禁止使用 debugger（生产环境必须移除）
        'no-debugger': 'error',

        // ===== 其他规范 =====
        // 关闭换行符格式检查（兼容 Windows/Linux/Mac）
        'linebreak-style': 0,
        // 关闭 Symbol 描述必须提供的检查
        'symbol-description': 'off',

        // ===== 导入规则 =====
        // 关闭外部依赖检查（monorepo 互相依赖）
        'import/no-extraneous-dependencies': 'off',
        // 启用模块路径必须可解析检查
        'import/no-unresolved': 'error',
        // 关闭必须使用 default export 的检查
        'import/prefer-default-export': 'off',
        // 导入文件扩展名规则
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                js: 'never', // .js 文件导入时省略扩展名
                mjs: 'never', // .mjs 文件导入时省略扩展名
                jsx: 'never', // .jsx 文件导入时省略扩展名
                ts: 'never', // .ts 文件导入时省略扩展名
                tsx: 'never', // .tsx 文件导入时省略扩展名
            },
        ],

        // ===== Vue 规则 =====
        // 允许 Vue 3 多根节点（Fragment）
        'vue/no-multiple-template-root': 0,
        // Vue 事件名必须使用 kebab-case（短横线命名）
        'vue/v-on-event-hyphenation': [
            'error',
            'always',
            {
                autofix: true, // 自动修复
                ignore: [], // 无忽略项
            },
        ],

        // ===== 变量规则 =====
        // 关闭 ESLint 的变量阴影检查（使用 TypeScript 版本）
        'no-shadow': 'off',
        // 启用 TypeScript 版本的变量阴影检查
        '@typescript-eslint/no-shadow': ['error', { ignoreTypeValueShadow: true }],

        // ===== Prettier 格式化规则 =====
        'prettier/prettier': [
            'error',
            {
                useTabs: false, // 使用空格缩进
                printWidth: 100, // 单行最大长度 100 字符
                singleQuote: true, // 使用单引号
                trailingComma: 'es5', // ES5 规范的尾逗号（对象、数组末尾）
                bracketSpacing: true, // 对象花括号内保留空格 { key: value }
                arrowParens: 'avoid', // 箭头函数单参数省略括号 x => x
                semi: true, // 语句末尾必须有分号
                vueIndentScriptAndStyle: false, // Vue 文件 <script> 和 <style> 不缩进
            },
        ],

        // ===== 参数规则 =====
        // 允许修改函数参数的属性（但不能重新赋值参数本身）
        'no-param-reassign': [
            'error',
            {
                props: false, // 允许修改参数的属性
            },
        ],
    },

    /**
     * 针对特定文件的规则覆盖
     */
    overrides: [
        // 测试文件配置
        {
            files: ['**/__tests__/*.{j,t}s?(x)', '**/tests/unit/**/*.spec.{j,t}s?(x)'],
            // 测试文件的特殊规则可在此配置
        },

        // Vue 单文件组件配置
        {
            files: ['**/src/**/*.vue'],
            rules: {
                // 关闭 ESLint 的基础检查（由 TypeScript 和 Vue 编译器处理）
                'constructor-super': 'off', // TypeScript 已检查
                'getter-return': 'off', // TypeScript 已检查
                'no-const-assign': 'off', // TypeScript 已检查
                'no-dupe-args': 'off', // TypeScript 已检查
                'no-dupe-class-members': 'off', // TypeScript 已检查
                'no-dupe-keys': 'off', // TypeScript 已检查
                'no-func-assign': 'off', // TypeScript 已检查
                'no-import-assign': 'off', // TypeScript 已检查
                'no-new-symbol': 'off', // TypeScript 已检查
                'no-obj-calls': 'off', // TypeScript 已检查
                'no-redeclare': 'off', // TypeScript 已检查
                'no-setter-return': 'off', // TypeScript 已检查
                'no-this-before-super': 'off', // TypeScript 已检查
                'no-undef': 'off', // TypeScript 已检查
                'no-unreachable': 'off', // TypeScript 已检查
                'no-unsafe-negation': 'off', // TypeScript 已检查
                'valid-typeof': 'off', // TypeScript 已检查 (ts(2367))

                // 启用 ES6+ 规范（Vue 组件必须遵守）
                'no-var': 'error', // 禁止使用 var，必须使用 const/let
                'prefer-const': 'error', // 优先使用 const
                'prefer-rest-params': 'error', // 优先使用剩余参数 ...args
                'prefer-spread': 'error', // 优先使用展开运算符 ...
            },
        },

        // SVG 和 HTML 文件配置
        {
            files: ['**/*.svg', '**/*.html'],
            rules: {
                // SVG/HTML 文件不使用分号
                'prettier/prettier': [
                    'error',
                    {
                        semi: false, // 不使用分号
                    },
                ],
            },
        },
    ],
};
