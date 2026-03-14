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

export default {
    sidebarPlugin,
    mysqlPlugin,
    servicePlugin,
};
