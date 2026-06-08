import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 时区转换
 * @param date 日期
 * @param targetTimezone 目标时区
 * @param formatType 格式化类型
 * @returns
 */
export const timezoneFormat = (
    date: Date | string | number,
    targetTimezone: string,
    formatType = 'YYYY-MM-DD HH:mm:ss'
) => {
    return dayjs(date).tz(targetTimezone).format(formatType);
};

/**
 * 时间单位翻译配置
 */
export interface TimeTranslations {
    day?: string;
    hour?: string;
    minute?: string;
}

/**
 * 计算时间差（将毫秒数转换为 天 小时 分钟 格式）
 * @param seconds 毫秒数
 * @param translations 翻译配置，用于国际化
 * @returns
 */
export const convertTimestamp = (seconds: number, translations?: TimeTranslations) => {
    const { day = '天', hour = '小时', minute = '分钟' } = translations || {};

    let date = seconds / 1000;
    const days = Math.floor(date / 86400);
    date %= 86400;
    const hours = Math.floor(date / 3600);
    date %= 3600;
    const minutes = Math.floor(date / 60);

    return `${days}${day} ${hours}${hour} ${minutes}${minute}`;
};

export { dayjs };
