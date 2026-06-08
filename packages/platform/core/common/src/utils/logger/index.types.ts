import { LogLevel } from './index.enum';

export interface GetLogFunctionByLevelOptions {
    level?: LogLevel;
}

export type GetLogFunctionByLevel = (
    options?: GetLogFunctionByLevelOptions
) => (...args: any[]) => void;
