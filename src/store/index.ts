import Vuex, { Store } from 'vuex';
import { ipcRenderer } from 'electron';
import { OverlayHostPlugin } from 'vue-overlay-host';

import modules from './modules';

export const config = {
    strict: true,
    modules: {
        splitterino: {
            namespaced: true,
            modules: { ...modules }
        }
    }
};

export function getClientStore(_Vue) {
    _Vue.use(Vuex);

    const store: any = new Vuex.Store({
        state: ipcRenderer.sendSync('vuex-connect'),
        plugins: [OverlayHostPlugin],
        ...config
    });

    // Override the dispatch function to delegate it to the main process instead
    store._dispatch = store.dispatch = function(type, ...payload) {
        // Stolen from vuejs/vuex
        if (typeof type === 'object' && type.type && arguments.length === 1) {
            payload = [type.payload];
            type = type.type;
        }

        console.log('[client] dispatching ', type, payload);
        ipcRenderer.send('vuex-mutate', { type, payload });
    };

    ipcRenderer.on('vuex-apply-mutation', (event, { type, payload }) => {
        console.log('[client] vuex-apply-mutation', type);
        store.commit(type, ...payload);
    });

    return store;
}
