declare global {
    type AnyObj = {
        [key: string]: any;
        [key: number]: any;
    };
    const logger: {
        log: (...args: any[]) => void;
        info: (...args: any[]) => void;
        warn: (...args: any[]) => void;
        error: (...args: any[]) => void;
    };

    interface Window {
        logger: logger;
    }
}

export {};
