import { remote } from 'electron';

export enum LogLevel {
    ERROR = 0b00010,
    WARN = 0b00100,
    INFO = 0b00110,
    DEBUG = 0b01000,
    TRACE = 0b01010,
    ERROR_USER = 0b111111,
    WARN_USER = 0b011111
}
// tslint:disable:no-console
export class Logger {
    public static log(level: LogLevel = LogLevel.INFO, message: string) {
        // tslint:disable-next-line:no-bitwise
        const isUserWarning: number = level & 0b1;
        let prefix: string;
        let logFunction: (message?: any, ...optionalParams: any[]) => void;
        let messageBoxType;
        // tslint:disable-next-line:no-bitwise no-magic-numbers
        level &= 0b1110;
        switch (level) {
            case LogLevel.ERROR: {
                prefix = 'Error';
                logFunction = console.error;
                messageBoxType = 'error';
                break;
            }
            case LogLevel.WARN: {
                prefix = 'Warn';
                logFunction = console.warn;
                messageBoxType = 'warning';
                break;
            }
            case LogLevel.INFO: {
                prefix = 'Info';
                logFunction = console.info;
                break;
            }
            case LogLevel.DEBUG: {
                prefix = 'Debug';
                logFunction = console.debug;
                break;
            }
            case LogLevel.TRACE: {
                prefix = 'Trace';
                logFunction = console.trace;
            }
        }
        logFunction(`[${prefix}] ${message}`);
        if (isUserWarning > 0) {
            remote.dialog.showMessageBox(remote.getCurrentWindow(), {
                title: prefix,
                message: message,
                type: messageBoxType
            });
        }
    }
}
