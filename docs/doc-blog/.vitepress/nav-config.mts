export const nav = () => {
    return [
        { text: '首页', link: '/' },
        { text: '博客', link: '/blog/导览' },
        {
            text: '数据库',
            items: [
                { text: 'MySQL', link: '/doc-menu/mysql/mysql-quickstart' },
            ],
        },
        { text: '服务端', link: '/doc-menu/service/服务端相关理论' },
        { text: 'Nestjs', link: '/doc-menu/nestjs/nestjs-quickstart' },
        { text: 'Java', link: '/doc-menu/java/java-quickstart' },
        {
            text: '项目',
            items: [
                { text: '尚品甄选', link: '/doc-menu/project/shangpin-selection/01 尚品甄选-项目概述' },
            ],
        },
    ];
};
