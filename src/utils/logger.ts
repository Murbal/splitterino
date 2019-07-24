import { Injector } from 'lightweight-di';
import pino from 'pino';

import { ELECTRON_INTERFACE_TOKEN, ElectronInterface } from '../common/interfaces/electron';

/**
 * Enum to map log levels
 */
export enum LogLevel {
    TRACE = 'trace',
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    FATAL = 'fatal'
}

/**
 * Wrapper Class to nearly log all messages from Splitterino
 * and Plugins in one centralized and unified way.
 *
 * Currently using the pino library for handling log messages.
 */
export class Logger {

    // Starts with a default handler for the console
    private static logHandlers: pino.Logger[] = [];
    private static isInitialized = false;
    private static windowId: number = null;
    private static electron: ElectronInterface;

    private static enrichMessage(messageOrData: string | object): object {
        let data: object = {
            isMainThread: this.windowId == null,
            windowId: this.windowId,
        };

        if (typeof messageOrData === 'string') {
            data = {
                ...data,
                msg: messageOrData,
            };
        } else {
            data = {
                ...(messageOrData || {}),
                ...data,
            };
        }

        return data;
    }

    public static initialize(injector: Injector, logLevel: LogLevel) {
        if (this.isInitialized) {
            return;
        }

        this.logHandlers.push(pino({
            level: logLevel,
            base: null,
            prettyPrint: {
                colorize: true,
                translateTime: 'SYS:HH:MM:ss',
                ignore: 'isMainThread,windowId'
            },
        }));
        this.electron = injector.get(ELECTRON_INTERFACE_TOKEN);
        const window = this.electron.getCurrentWindow();
        if (window != null && typeof window.id === 'number') {
            this.windowId = window.id;
        }
        this.isInitialized = true;
    }

    public static registerHandler(stream?: pino.DestinationStream, options?: pino.LoggerOptions) {
        this.logHandlers.push(pino(options || {}, stream));
    }

    /**
     * Internal function! Do not use unless you know what you're doing.
     * Prone to change! Use the regular logging functions instead if possible.
     *
     * @param logFnName The logging function to call in the handlers
     * @param data The data which the handlers should receive
     */
    public static _logToHandlers(logFnName: string, data: object) {
        if (this.electron && this.electron.isRenderProcess()) {
            this.electron.ipcSend('spl-log', logFnName, data);
        }
        this.logHandlers.forEach(handler => {
            handler[logFnName](data);
        });
    }

    public static trace(messageOrData: string | object) {
        const data = this.enrichMessage(messageOrData);
        this._logToHandlers('trace', data);
    }

    public static debug(messageOrData: string | object) {
        const data = this.enrichMessage(messageOrData);
        this._logToHandlers('debug', data);
    }

    public static info(messageOrData: string | object) {
        const data = this.enrichMessage(messageOrData);
        this._logToHandlers('info', data);
    }

    public static warn(messageOrData: string | object) {
        const data = this.enrichMessage(messageOrData);
        this._logToHandlers('warn', data);
    }

    public static error(messageOrData: string | object) {
        const data = this.enrichMessage(messageOrData);
        this._logToHandlers('error', data);
    }

    public static fatal(messageOrData: string | object) {
        const data = this.enrichMessage(messageOrData);
        this._logToHandlers('fatal', data);
    }
}
