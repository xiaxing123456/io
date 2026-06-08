import type { ObjectOptions } from './types/common';

// import directives from './directive/index';
// import elementDirectives from './directive/elementui';

import * as pltMath from './utils/math';
import * as PltLogger from './utils/logger';
import * as pureFn from './utils/pure-function';
import * as pathUtils from './utils/path';

// 新增迁移的工具模块
import * as authUtils from './utils/auth';
import * as uuidUtils from './utils/uuid';
import * as storageUtils from './utils/storage';
import * as stringUtils from './utils/string';
import * as fileUtils from './utils/file';
import * as composeUtils from './utils/compose';
import * as domUtils from './utils/dom';
import * as listUtils from './utils/list';
import * as keyConverterUtils from './utils/recursive-key-converter';
import * as styleUtils from './utils/style';
import * as arrayUtils from './utils/array';
import * as equalUtils from './utils/equal';
import * as treeUtils from './utils/tree';
import * as timeUtils from './utils/time';
import * as mathFormatUtils from './utils/math/format';
import * as subscriberUtils from './utils/subscriber';

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
    kebabCaseToUpperCase,
    moduleImportMap,
    globalSources,
} from './dependencies/pkgignore';

export type { GlobalSources } from './dependencies/pkgignore';

export type { InstallAllOptions } from './types';

// directives
// export { directives, elementDirectives };

// math
export { pltMath, PltLogger };

// pure function
export { pureFn };

export { pathUtils };

// 新增迁移的工具模块导出
export {
    authUtils,
    uuidUtils,
    storageUtils,
    stringUtils,
    fileUtils,
    composeUtils,
    domUtils,
    listUtils,
    keyConverterUtils,
    styleUtils,
    arrayUtils,
    equalUtils,
    treeUtils,
    timeUtils,
    mathFormatUtils,
    subscriberUtils,
};

// 导出常用函数(便于直接使用)
export { hasPltAuth } from './utils/auth';
export { generateUUID } from './utils/uuid';
export { setLocalStorage, getLocalStorage, removeLocalStorage } from './utils/storage';
export { getPathForHash, convertLanguageCode } from './utils/string';
export { getFileType } from './utils/file';
export { compose } from './utils/compose';
export { createElment, appendElement, getActiveDialogSubBox } from './utils/dom';
export { dealWithChildren, objRowMove, MoveTypeEnum } from './utils/list';
export { camelToSnake, snakeToCamel, convertTreeDataKeys } from './utils/recursive-key-converter';
export { getConfig, setConfig } from './utils/style';
export { getTrimData, getSortValForOptionIndex, evaluateLogic } from './utils/array';
export { isEqualTrim, isEqual } from './utils/equal';
export { createSubscriberManager } from './utils/subscriber';
export {
    treeToList,
    getAllParentArr,
    findTreeToList,
    FindTreeToListMatchTypeEnum,
    addPropertyForTree,
    listToTree,
    filterNode,
    scrollToTop,
} from './utils/tree';
export { timezoneFormat, convertTimestamp, dayjs } from './utils/time';
export {
    formatFloat,
    formatNumberValFroDigit,
    transformPositiveNum,
    formatMaxValue,
} from './utils/math/format';

// 导出类型
export type { TrimOtions } from './utils/array';
export type { GetAllParentArrOpionts } from './utils/tree';
export type { TimeTranslations } from './utils/time';
export type { RowMoveOptions } from './utils/list';
export type { CreateElement, CreateElementOptions } from './utils/dom';
export type { argsFn } from './utils/compose';
export type { SubscriberManager } from './utils/subscriber';

export const delayOneSecond = (time = 200) => {
    return new Promise(resolve => setTimeout(resolve, time));
};
