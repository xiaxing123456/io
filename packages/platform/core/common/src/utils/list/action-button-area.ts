/** 转换数据结构
 * @param targetId 父级目标id
 * @param children 子级数据
 * @param labelKey 初始显示字段
 * @param valueKey 初始值字段
 * @param level 层级
 */
export const dealWithChildren = ({
    targetId,
    children,
    labelKey,
    valueKey,
    level = 0,
}: {
    targetId?: string;
    children: any[];
    labelKey: string;
    valueKey: string;
    level?: number;
}) => {
    children.forEach((item, index) => {
        const setAttr = () => {
            if (targetId && !item.targetId) {
                // 添加目标id属性
                // level 为0时，需要兼容旧版本已设置id，故加此判断
                item.targetId = level
                    ? `${targetId}${index + 1}`
                    : `${Number(targetId) + index + 1}`;
            }
            item.label = item.label || item[labelKey];
            item.value = item.value || item[valueKey];
        };
        setAttr();
        if (item.children) {
            dealWithChildren({
                targetId: item.targetId,
                children: item.children,
                labelKey,
                valueKey,
                level: level + 1,
            });
        }
    });
};
