/**
 * 获取文件类型
 * @description 用于文件上传时前端判断后缀名是否符合要求（如：图标库上传svg）
 * @param filePath 文件名称
 * @returns 文件后缀名（小写）
 */
export const getFileType = (filePath: string) => {
    const startIndex = filePath.lastIndexOf('.');
    if (startIndex !== -1) return filePath.substring(startIndex + 1, filePath.length).toLowerCase();
    return '';
};
