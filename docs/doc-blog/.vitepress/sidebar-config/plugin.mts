const sidebarPlugin = () => {
    return [
        {
            text: '导览',
            link: '/导览',
        },
    ];
};

/** mysql侧边栏 */
const mysqlPlugin = () => {
    return [
        {
            text: '数据库相关概念',
            link: '/数据库相关概念',
        },
    ];
};

/** 服务端侧边栏 */
const servicePlugin = () => {
    return [
        {
            text: '服务端相关理论',
            link: '/服务端相关理论',
        },
        {
            text: 'Linux',
            collapsed: false,
            items: [
                {
                    text: 'Linux 常用命令',
                    link: '/linux/linux-commands',
                },
            ],
        },
        {
            text: 'Docker',
            collapsed: false,
            items: [
                {
                    text: 'Docker 安装指南',
                    link: '/docker/docker-install',
                },
                {
                    text: 'Docker Compose 集成管理',
                    link: '/docker/docker-compose',
                },
                {
                    text: 'Compose 服务集成',
                    collapsed: false,
                    items: [
                        {
                            text: 'MySQL',
                            link: '/docker/compose-services/mysql',
                        },
                        {
                            text: 'Redis',
                            link: '/docker/compose-services/redis',
                        },
                        {
                            text: 'Nacos',
                            link: '/docker/compose-services/nacos',
                        },
                    ],
                },
                {
                    text: 'Docker 常用命令',
                    link: '/docker/docker-commands',
                },
                {
                    text: 'Portainer',
                    collapsed: false,
                    items: [
                        {
                            text: 'Portainer 介绍',
                            link: '/docker/portainer/portainer-intro',
                        },
                        {
                            text: '安装 Portainer',
                            link: '/docker/portainer/portainer-install',
                        },
                        {
                            text: 'Portainer 使用手册',
                            link: '/docker/portainer/portainer-manual',
                        },
                        {
                            text: 'Portainer 安装 MySQL',
                            link: '/docker/portainer/portainer-mysql',
                        },
                    ],
                },
            ],
        },
    ];
};

/** nestjs侧边栏 */
const nestjsPlugin = () => {
    return [
        {
            text: 'NestJS',
            collapsed: false,
            items: [
                {
                    text: 'NestJS 快速入门',
                    link: '/nestjs-quickstart',
                },
                {
                    text: 'SWC 加速编译',
                    link: '/nestjs-swc',
                },
                {
                    text: '日志系统（Winston）',
                    link: '/nestjs-logger',
                },
                {
                    text: 'CLI 生成命令',
                    link: '/nestjs-cli-generate',
                },
                {
                    text: '集成 Prisma 模块',
                    link: '/prisma-nestjs-module',
                },
            ],
        },
        {
            text: 'Prisma 数据库',
            collapsed: false,
            items: [
                {
                    text: 'PostgreSQL',
                    link: '/prisma-postgresql',
                },
                {
                    text: 'MySQL',
                    link: '/prisma-mysql',
                },
                {
                    text: 'Data Model 建表指南',
                    link: '/prisma-data-model',
                },
            ],
        },
    ];
};

/** java侧边栏 */
const javaPlugin = () => {
    return [
        {
            text: 'Java',
            collapsed: false,
            items: [
                {
                    text: 'Java 快速入门',
                    link: '/java-quickstart',
                },
            ],
        },
        {
            text: 'Spring',
            collapsed: false,
            items: [
                {
                    text: 'MyBatis 教程',
                    link: '/mybatis',
                },
                {
                    text: 'SpringBoot3',
                    collapsed: true,
                    items: [
                        { text: '快速入门', link: '/springboot/quickstart' },
                        { text: 'Web开发', link: '/springboot/web' },
                        { text: '数据访问', link: '/springboot/data-access' },
                        { text: '基础特性', link: '/springboot/basic-features' },
                        { text: '核心原理', link: '/springboot/core-principles' },
                        { text: 'NoSQL', link: '/springboot/nosql' },
                        { text: '接口文档', link: '/springboot/api-docs' },
                        { text: '远程调用', link: '/springboot/remote-call' },
                        { text: '消息服务', link: '/springboot/message-service' },
                        { text: 'Web安全', link: '/springboot/web-security' },
                        { text: '可观测性', link: '/springboot/observability' },
                        { text: 'AOT', link: '/springboot/aot' },
                        { text: 'Reactor核心', link: '/springboot/reactor' },
                        { text: 'Spring Webflux', link: '/springboot/webflux' },
                        { text: 'R2DBC', link: '/springboot/r2dbc' },
                        { text: 'Security Reactive', link: '/springboot/security-reactive' },
                    ],
                },
            ],
        },
    ];
};

export default {
    sidebarPlugin,
    mysqlPlugin,
    servicePlugin,
    nestjsPlugin,
    javaPlugin,
};
