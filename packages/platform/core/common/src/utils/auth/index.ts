/**
 * 校验当前操作是否有权限
 * @param authVal 权限值
 * @param mathVal 匹配值
 * @returns boolean => true: 有权限; false: 没有权限
 */
export const hasPltAuth = (authVal: number, mathVal: number) => {
    return (mathVal & authVal) !== 0;
};
