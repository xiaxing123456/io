import type { ObjectOptions } from './types/common';

// import directives from './directive/index';
// import elementDirectives from './directive/elementui';

import * as PltLogger from './utils/logger';
import * as pltMath from './utils/math';
import * as pathUtils from './utils/path';
import * as pureFn from './utils/pure-function';

// 新增迁移的工具模块
import * as arrayUtils from './utils/array';
import * as authUtils from './utils/auth';
import * as composeUtils from './utils/compose';
import * as domUtils from './utils/dom';
import * as equalUtils from './utils/equal';
import * as fileUtils from './utils/file';
import * as listUtils from './utils/list';
import * as mathFormatUtils from './utils/math/format';
import * as keyConverterUtils from './utils/recursive-key-converter';
import * as storageUtils from './utils/storage';
import * as stringUtils from './utils/string';
import * as styleUtils from './utils/style';
import * as subscriberUtils from './utils/subscriber';
import * as timeUtils from './utils/time';
import * as treeUtils from './utils/tree';
import * as uuidUtils from './utils/uuid';

// const logger = PltLogger.generateCustomizeLogger({ useLogger: true });

const test = (): void => {
    // eslint-disable-next-line no-console
    // logger.log('hello ~, this is platform-common');
};
// types
export type { ObjectOptions };

export { test };

export {
    globalDependenciesNames,
    globalSources,
    kebabCaseToUpperCase,
} from './dependencies/pkgignore';

export type { GlobalSources } from './dependencies/pkgignore';

export type { InstallAllOptions } from './types';

// directives
// export { directives, elementDirectives };

// math
export { PltLogger, pltMath };

// pure function
export { pureFn };

export { pathUtils };

// 新增迁移的工具模块导出
export {
    arrayUtils,
    authUtils,
    composeUtils,
    domUtils,
    equalUtils,
    fileUtils,
    keyConverterUtils,
    listUtils,
    mathFormatUtils,
    storageUtils,
    stringUtils,
    styleUtils,
    subscriberUtils,
    timeUtils,
    treeUtils,
    uuidUtils,
};

// 导出常用函数(便于直接使用)
export { evaluateLogic, getSortValForOptionIndex, getTrimData } from './utils/array';
export { hasPltAuth } from './utils/auth';
export { compose } from './utils/compose';
export { appendElement, createElment, getActiveDialogSubBox } from './utils/dom';
export { isEqual, isEqualTrim } from './utils/equal';
export { getFileType } from './utils/file';
export { dealWithChildren, MoveTypeEnum, objRowMove } from './utils/list';
export {
    formatFloat,
    formatMaxValue,
    formatNumberValFroDigit,
    transformPositiveNum,
} from './utils/math/format';
export { camelToSnake, convertTreeDataKeys, snakeToCamel } from './utils/recursive-key-converter';
export { getLocalStorage, removeLocalStorage, setLocalStorage } from './utils/storage';
export { convertLanguageCode, getPathForHash } from './utils/string';
export { getConfig, setConfig } from './utils/style';
export { createSubscriberManager } from './utils/subscriber';
export { convertTimestamp, dayjs, timezoneFormat } from './utils/time';
export {
    addPropertyForTree,
    filterNode,
    findTreeToList,
    FindTreeToListMatchTypeEnum,
    getAllParentArr,
    listToTree,
    scrollToTop,
    treeToList,
    updateTreeNodeForTree,
} from './utils/tree';
export { generateUUID } from './utils/uuid';

// 导出类型
export type { TrimOtions } from './utils/array';
export type { argsFn } from './utils/compose';
export type { CreateElement, CreateElementOptions } from './utils/dom';
export type { RowMoveOptions } from './utils/list';
export type { SubscriberManager } from './utils/subscriber';
export type { TimeTranslations } from './utils/time';
export type { GetAllParentArrOpionts } from './utils/tree';

export const delayOneSecond = (time = 200) => {
    return new Promise(resolve => setTimeout(resolve, time));
};
