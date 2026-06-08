/**
 * 根据window.location.hash 获取path
 * @param hash window.location.hash
 * @returns
 */
export const getPathForHash = (hash: string) => {
    const fullUrl = hash.slice(1);
    if (fullUrl.includes('?')) {
        return fullUrl.split('?')[0];
    }
    return fullUrl;
};
