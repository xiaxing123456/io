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
            text: 'MySQL',
            collapsed: false,
            items: [
                {
                    text: '快速入门',
                    link: '/mysql-quickstart',
                },
                {
                    text: '数据库相关概念',
                    link: '/数据库相关概念',
                },
                {
                    text: '基础语法',
                    link: '/mysql-basic-syntax',
                },
                {
                    text: '数据类型',
                    link: '/mysql-data-types',
                },
                {
                    text: '查询示例',
                    link: '/mysql-query-examples',
                },
            ],
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

/** 项目侧边栏 */
const projectPlugin = () => {
    return [
        {
            text: '尚品甄选',
            collapsed: false,
            items: [
                { text: '01 项目概述', link: '/shangpin-selection/01 尚品甄选-项目概述' },
                { text: '02 后台系统-搭建环境', link: '/shangpin-selection/02 尚品甄选-后台系统-搭建环境' },
                { text: '03 后台系统-用户登录', link: '/shangpin-selection/03 尚品甄选-后台系统-用户登录' },
                { text: '04 权限管理之角色管理', link: '/shangpin-selection/04 尚品甄选-后台系统-权限管理之角色管理' },
                { text: '05 权限管理之用户管理', link: '/shangpin-selection/05 尚品甄选-后台系统-权限管理之用户管理' },
                { text: '06 权限管理之菜单管理', link: '/shangpin-selection/06 尚品甄选-后台系统-权限管理之菜单管理' },
                { text: '07 分类和品牌管理', link: '/shangpin-selection/07 尚品甄选-后台系统-分类和品牌管理' },
                { text: '08 分类品牌和规格管理', link: '/shangpin-selection/08 尚品甄选-后台系统-分类品牌和规格管理' },
                { text: '09 商品和订单管理', link: '/shangpin-selection/09 尚品甄选-后台系统-商品和订单管理' },
                { text: '10 记录日志功能', link: '/shangpin-selection/10 尚品甄选-后台系统-记录日志功能' },
                { text: '11 前台系统-搭建环境', link: '/shangpin-selection/11 尚品甄选-前台系统-搭建环境' },
                { text: '12 首页数据和商品列表', link: '/shangpin-selection/12 尚品甄选-前台系统-首页数据和商品列表' },
                { text: '13 商品详情和注册登录', link: '/shangpin-selection/13 尚品甄选-前台系统-商品详情和注册登录' },
                { text: '14 购物车和订单结算', link: '/shangpin-selection/14 尚品甄选-前台系统-购物车和订单结算' },
                { text: '15 下单和订单查询', link: '/shangpin-selection/15 尚品甄选-前台系统-下单和订单查询' },
                { text: '16 订单支付功能', link: '/shangpin-selection/16 尚品甄选-前台系统-订单支付功能' },
                { text: '17 项目部署', link: '/shangpin-selection/17 尚品甄选-项目部署（docker部署）' },
                { text: '18 项目总结', link: '/shangpin-selection/18 尚品甄选-项目总结' },
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
    projectPlugin,
};
