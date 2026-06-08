/**
 * 保留n位小数并格式化输出（不足的部分补0）
 * @param value
 * @param digit default: 0
 */
export const formatFloat = (value: number | string, digit = 0) => {
    const f = value || 0;

    let s = f.toString();
    const rs = s.indexOf('.');

    // intercept digit
    if (rs > 0) {
        const currentDigit = s.length - 1 - rs;
        if (digit >= 0 && digit < currentDigit) {
            // if the digit is equal to 0, ""."" must be removed ;
            const difference = digit > 0 ? 0 : 1;
            s = s.slice(0, digit - currentDigit - difference);
        }
    }

    if (rs < 0) {
        if (digit <= 0) {
            return s;
        }
        s += '.';
    }
    for (let i = s.length - s.indexOf('.'); i <= digit; i++) {
        s += '0';
    }
    return s;
};

export const formatNumberValFroDigit = (value: string | number, digit?: number | string) => {
    if (!value && value !== 0) return value;

    let resVal = `${value}`;

    // replace !number to null
    resVal = resVal.replace(/[^\d.-]/g, '');

    let preSymbol = '';

    // handle first - or .
    if (resVal.includes('-')) {
        if (resVal[0] === '-') {
            preSymbol = resVal[0];
            resVal = resVal.substring(1, resVal.length).replace(/[^\d.]/g, '');
            if (resVal[0] === '.') {
                resVal = `0.${resVal.replace(/[^\d]/g, '')}`;
            }
        } else {
            resVal = resVal.replace(/[^\d.]/g, '');
        }
    }

    // 不限制小数位
    if (!digit && digit !== 0) return preSymbol + resVal;

    // 小数位为0 (整数)
    if (digit === 0) {
        const regDecimal = new RegExp(`^\\d+`);
        const matchVal = resVal.toString().match(regDecimal) ?? '';

        if (!preSymbol && !matchVal) {
            return matchVal;
        }

        return preSymbol + String(matchVal);
    }

    if (resVal[0] === '.') {
        resVal = `0${resVal}`;
    }

    const regDecimal = new RegExp(`^\\d+(?:\\.\\d{0,${~~digit}})?`);

    const matchVal = resVal.toString().match(regDecimal) ?? '';

    if (!preSymbol && !matchVal) {
        return matchVal;
    }

    return preSymbol + String(matchVal);
};

/** 转为正数(去除负号) */
export const transformPositiveNum = (val: string | number) => {
    if (String(val).includes('-')) {
        if (String(val)[0] === '-') {
            return String(val).substring(1);
        }
    }
    return val;
};

/**
 * 截取数字的最大值
 * @param value
 * @param maxValue
 * @returns string
 */
export const formatMaxValue = (value: number, maxValue: number): string => {
    if (value > maxValue) return `${maxValue}+`;
    if (value === 0) return '';
    return value.toString();
};
