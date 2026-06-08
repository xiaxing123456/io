export const setLocalStorage = <T>(name: string, data: T) => {
    localStorage.setItem(name, JSON.stringify(data));
};

export const getLocalStorage = <T>(name: string): T | null => {
    const storageStr = localStorage.getItem(name) || '';
    return (storageStr && JSON.parse(storageStr)) || null;
};

/**
 * ## 根据name清除对应localStorage
 * - 该方法是对 localStorage.removeItem 封装, 可以使用数组提供多个 name
 * @param name 需要删除的名称, 可以使用单个字符串或者一个字符串组
 */
export const removeLocalStorage = (name: string | string[]) => {
    if (typeof name === 'string') {
        localStorage.removeItem(name);
    } else if (Array.isArray(name)) {
        name.forEach(item => {
            localStorage.removeItem(item);
        });
    }
};
