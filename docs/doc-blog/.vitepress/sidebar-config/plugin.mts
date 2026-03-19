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
                    text: 'Docker 常用命令',
                    link: '/docker/docker-commands',
                },
                {
                    text: 'Portainer 介绍',
                    link: '/docker/portainer-intro',
                },
                {
                    text: '安装 Portainer',
                    link: '/docker/portainer-install',
                },
                {
                    text: 'Portainer 使用手册',
                    link: '/docker/portainer-manual',
                },
                {
                    text: 'Portainer 安装 MySQL',
                    link: '/docker/portainer-mysql',
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

export default {
    sidebarPlugin,
    mysqlPlugin,
    servicePlugin,
    nestjsPlugin,
};
