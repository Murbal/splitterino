'use strict';
import { app, BrowserWindow, ipcMain, WebContents } from 'electron';
import { join } from 'path';
import * as pino from 'pino';
import { format as formatUrl } from 'url';
import Vue from 'vue';
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib';
import Vuex from 'vuex';
import { registerDefaultKeybindingFunctions } from './common/function-registry';
import { ActionResult } from './common/interfaces/electron';
import { IO_SERVICE_TOKEN } from './services/io.service';
import { getStoreConfig } from './store';
import { ACTION_SET_BINDINGS } from './store/modules/keybindings.module';
import { getKeybindingsStorePlugin } from './store/plugins/keybindings';
import { RootState } from './store/states/root.state';
import { Logger } from './utils/logger';
import { createInjector } from './utils/services';

process.on('uncaughtException', (error: Error) => {
    Logger.fatal({
        msg: 'Uncaught Exception in background process!',
        error: error,
    });

    Logger.trace({
        error: error.stack
    });

    // exit the application safely
    // FIXME: Does not actually quit app
    app.exit(1);

    // end the process
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.fatal({
        msg: 'There was an unhandled Rejection in the background process!',
        promise,
        error: reason,
    });
});

(async () => {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (isDevelopment) {
        // Don't load any native (external) modules until the following line is run:
        // tslint:disable-next-line no-require-imports no-var-requires
        require('module').globalPaths.push(process.env.NODE_MODULES_PATH);
    }

    // Standard scheme must be registered before the app is ready
    // protocol.registerStandardSchemes(['app'], { secure: true });

    /**
     * global reference of the main window.
     * necessary to prevent window from being garbage collected.
     */
    let mainWindow: BrowserWindow;

    /**
     * List of all clients/windows that were created.
     * The index in which they are put, is the corresponding BrowserWindow ID
     */
    const clients: WebContents[] = [];

    /** Instance of an injector with resolved services */
    const injector = createInjector();

    // Initialize the logger
    Logger.initialize(injector);

    // Setting up a log-handler which logs the messages to a file
    const io = injector.get(IO_SERVICE_TOKEN);
    const logFile = join(io.getAssetDirectory(), 'application.log');
    Logger.registerHandler(pino.destination(logFile), { level: 'trace' });

    // Main instance of the Vuex-Store
    Vue.use(Vuex);
    const store = new Vuex.Store<RootState>({
        ...getStoreConfig(injector),
        plugins: [
            storeInstance => {
                storeInstance.subscribe(mutation => {
                    try {
                        Object.keys(clients).forEach(id => {
                            clients[id].send('vuex-apply-mutation', mutation);
                        });
                    } catch (error) {
                        Logger.error({
                            msg: 'Error while sending mutation to other processes',
                            mutation,
                            error,
                        });
                    }
                });
            },
            getKeybindingsStorePlugin(injector),
        ]
    });

    let splitsFile: string;
    if (!isDevelopment) {
        splitsFile = process.argv[1];
    }

    const appSettings = await io.loadApplicationSettingsFromFile(store, splitsFile);
    await io.loadSettingsFromFileToStore(store);

    // Setup the Keybiding Functions
    registerDefaultKeybindingFunctions();

    // Listener to transfer the current state of the store
    ipcMain.on('vuex-connect', event => {
        const windowId = BrowserWindow.fromWebContents(event.sender).id;
        Logger.debug(`vuex-connect: ${windowId}`);

        clients[windowId] = event.sender;
        event.returnValue = store.state;
    });

    ipcMain.on('vuex-disconnect', event => {
        const windowId = BrowserWindow.fromWebContents(event.sender).id;
        Logger.debug(`vuex-disconnect ${windowId}`);

        delete clients[windowId];
    });

    // Listener to perform a delegate mutation on the main store
    ipcMain.on('vuex-dispatch', async (event, { type, payload, options }) => {
        Logger.debug({
            msg: 'vuex-dispatch',
            type,
            payload,
            options,
        });
        try {
            const dispatchResult = await store.dispatch(type, payload, options);
            const eventResponse: ActionResult = { result: dispatchResult, error: null };
            event.returnValue = eventResponse;
        } catch (error) {
            const eventResponse: ActionResult = { result: null, error };
            event.returnValue = eventResponse;
        }
    });

    ipcMain.on('spl-log', (_, level: string, data: object) => {
        Logger._logToHandlers(level, data);
    });

    function createMainWindow() {
        const window = new BrowserWindow(appSettings.windowOptions);

        if (isDevelopment) {
            // Load the url of the dev server if in development mode
            window.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
            if (!process.env.IS_TEST) {
                window.webContents.openDevTools({ mode: 'detach' });
            }
        } else {
            createProtocol('app');
            //   Load the index.html when not in development
            window.loadURL(
                formatUrl({
                    pathname: join(__dirname, 'index.html'),
                    protocol: 'file',
                    slashes: true
                })
            );
        }

        window.on('close', () => {
            io.saveApplicationSettingsToFile(mainWindow, store);
        });

        window.on('closed', () => {
            mainWindow = null;
        });

        window.webContents.on('devtools-opened', () => {
            window.focus();
            setImmediate(() => {
                window.focus();
            });
        });

        return window;
    }

    // quit application when all windows are closed
    app.on('window-all-closed', () => {
        // on macOS it is common for applications to stay open
        // until the user explicitly quits
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // on macOS it is common to re-create a window
        // even after all windows have been closed
        if (mainWindow === null) {
            mainWindow = createMainWindow();
        }
    });

    // create main BrowserWindow when electron is ready
    app.on('ready', async () => {
        if (isDevelopment && !process.env.IS_TEST) {
            // Install Vue Devtools
            await installVueDevtools();
        }

        // Load the keybindings once the application is actually loaded
        // Has to be done before creating the main window.
        if (Array.isArray(appSettings.keybindings)) {
            store.dispatch(ACTION_SET_BINDINGS, appSettings.keybindings);
        }

        mainWindow = createMainWindow();
    });

    // Exit cleanly on request from parent process in development mode.
    if (isDevelopment) {
        if (process.platform === 'win32') {
            process.on('message', data => {
                if (data === 'graceful-exit') {
                    Logger.info('Received message to shutdown! Closing app ...');
                    app.quit();
                }
            });
        } else {
            process.on('SIGTERM', () => {
                Logger.info('Received message to shutdown! Closing app ...');
                app.quit();
            });
        }
    }
})().catch(err => {
    Logger.fatal({
        msg: 'Unknown Error in the main thread!',
        error: err,
    });
});
