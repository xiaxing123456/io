import qs from 'qs';
/**
 * 根据链接地址 获取路由path
 * @param href - 链接地址, 如 window.location.href
 * @returns
 */
export const getPathForHref = (href: string): string => {
    const hashIndex = href.indexOf('#');

    if (hashIndex !== -1) {
        // Hash 模式：提取基础路径和 `#` 后的路径
        const basePath = href.slice(0, hashIndex); // 获取 `#` 前的部分
        const hashPart = href.slice(hashIndex + 1); // 获取 `#` 后的部分
        const queryIndex = hashPart.indexOf('?');
        if (queryIndex !== -1) {
            // 去掉 `?` 后的查询参数
            return `${basePath}#${hashPart.slice(0, queryIndex)}`;
        }
        return `${basePath}#${hashPart}`; // 没有查询参数时直接返回完整路径
    }
    // History 模式：直接去掉 `?` 后的查询参数
    const queryIndex = href.indexOf('?');
    if (queryIndex !== -1) {
        return href.slice(0, queryIndex);
    }
    return href; // 没有查询参数时返回完整路径
};

/**
 * 根据链接地址 获取路由查询参数 query (?后面的内容)
 * @param href - 链接地址, 如 window.location.href
 * @returns
 */
export const getPathQueryForHref = (href: string): Record<string, any> => {
    const hashIndex = href.indexOf('#');

    if (hashIndex !== -1) {
        // Hash 模式，提取 `#` 后的部分
        const hashPart = href.slice(hashIndex + 1);
        const queryIndex = hashPart.indexOf('?');
        if (queryIndex !== -1) {
            // Hash 模式的 `?` 后查询参数
            return qs.parse(hashPart.slice(queryIndex + 1)) ?? {};
        }
        // search 参数放在 hash 前边（微信oauth2.0授权跳转时回调链接为 search-hash 的拼接方式，此处判断不能删除）
        if (href.includes('?')) {
            const searchIndex = href.indexOf('?');
            return qs.parse(href.slice(searchIndex + 1, hashIndex + 1)) ?? {};
        }
    } else {
        // History 模式，直接解析 `?` 后查询参数
        const queryIndex = href.indexOf('?');
        if (queryIndex !== -1) {
            return qs.parse(href.slice(queryIndex + 1)) ?? {};
        }
    }

    // 没有查询参数
    return {};
};

/**
 * 根据链接地址 获取清理后的完整路径（不含域名）
 * @param href - 链接地址, 如 window.location.href
 * @returns {string} 清理后的路径字符串
 */
export const getUrlFullPath = (href: string) => {
    const hashIndex = href.indexOf('#');
    let path;

    if (hashIndex !== -1 && href.slice(hashIndex) !== '#') {
        // Hash 模式：提取 `#` 后的部分
        path = href.slice(hashIndex + 1);
        const nextHashIndex = path.indexOf('#');
        if (nextHashIndex !== -1) {
            path = path.slice(0, nextHashIndex); // 截取到下一个 # 前
        }
    } else {
        // History 模式：提取协议后的路径
        const pathStart = href.indexOf('/', href.indexOf('//') + 2);
        path = pathStart !== -1 ? href.slice(pathStart) : '';
    }

    // 清理多余斜杠
    path = path.replace(/\/+/g, '/');

    // 确保以 / 开头
    if (!path.startsWith('/')) {
        path = `/${path}`;
    }

    return path;
};
