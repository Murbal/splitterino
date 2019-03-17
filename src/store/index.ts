import { ipcRenderer, remote } from 'electron';
import { OverlayHostPlugin } from 'vue-overlay-host';
import Vuex, { Dispatch } from 'vuex';
import { merge, cloneDeep } from 'lodash';

import { splitterinoStoreModules } from './modules';
import { Logger } from '../utils/logger';
import { RootState } from './states/root';

export const config = {
    strict: true,
    modules: {
        splitterino: {
            namespaced: true,
            modules: splitterinoStoreModules
        }
    }
};

export function getClientStore(vueRef) {
    vueRef.use(Vuex);

    const store = new Vuex.Store<RootState>({
        plugins: [
            OverlayHostPlugin,
            events => {
                events.subscribe(mutation => {
                    // Ignore mutations of the overlay-host,
                    // since these are window specific.
                    if (mutation.type.includes('overlay-host')) {
                        return;
                    }
                    let payload: any;
                    let id = '';

                    if (
                        typeof mutation.payload === 'object' &&
                        'id' in mutation.payload &&
                        'payload' in mutation.payload
                    ) {
                        payload = mutation.payload.payload;
                        id = `:${mutation.payload.id}`;
                    } else {
                        payload = mutation.payload;
                    }

                    vueRef.prototype.$eventHub.$emit(
                        `commit:${mutation.type}${id}`,
                        payload
                    );
                });
            },
        ],
        ...config
    });

    // ! FIXME: Just a workaround for store instantiation
    // ! Try to not instantiate store first and then replace state
    // ! Problem: Modules in config overwrite store if given in options
    store.replaceState(merge({}, ipcRenderer.sendSync('vuex-connect'), cloneDeep(store.state)));

    const windowRef = remote.getCurrentWindow();
    windowRef.on('close', () => {
        ipcRenderer.send('vuex-disconnect');
    });

    // Override the dispatch function to delegate it to the main process instead
    // tslint:disable-next-line only-arrow-functions no-string-literal
    store['_dispatch'] = store.dispatch = function(
        type: string | { type: string; payload: any },
        ...payload: any[]
    ) {
        if (Array.isArray(payload)) {
            if (payload.length === 0) {
                payload = undefined;
            } else if (payload.length === 1) {
                payload = payload[0];
            }
        }

        // Stolen from vuejs/vuex
        if (typeof type === 'object' && type.type && arguments.length === 1) {
            payload = [type.payload];
            type = type.type;
        }

        ipcRenderer.send('vuex-mutate', { type, payload });
    } as Dispatch;

    ipcRenderer.on('vuex-apply-mutation', (event, { type, payload }) => {
        Logger.debug('[client] vuex-apply-mutation', type);
        if (
            payload != null &&
            typeof payload === 'object' &&
            !Array.isArray(payload)
        ) {
            store.commit({
                type,
                ...payload
            });
        } else {
            store.commit(type, payload);
        }
    });

    return store;
}
