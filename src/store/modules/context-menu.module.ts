import { Module } from 'vuex';

import { ContextMenuState } from '../states/context-menu.state';

const MODULE_PATH = 'splitterino/contextMenu';

const ID_GETTER_MENUES = 'ctxMenu';

export const GETTER_MENUES = `${MODULE_PATH}/${ID_GETTER_MENUES}`;

const moduleState: ContextMenuState = {
    def: [
        {
            label: 'Reload',
            actions: ['core.window.reload'],
        },
        {
            label: 'Exit',
            actions: ['core.window.close'],
        },
    ],
    splitter: [
        {
            label: 'Edit Splits ...',
            actions: ['core.splits.edit'],
        },
        {
            label: 'Load Splits ...',
            actions: ['core.splits.load-from-file'],
        },
        {
            label: 'Save Splits ...',
            actions: ['core.splits.save-to-file'],
        },
    ],
    settings: [
        {
            label: 'Settings ...',
            actions: ['core.settings.open'],
        },
    ],
};

const getters = {
    [ID_GETTER_MENUES](state) {
        return (menus: string[]): Object[] => {
            const ctxMenu: Object[] = [];
            menus.forEach((el: string) => {
                if (!(el in state)) {
                    throw new Error(`Menu '${el}' does not exist in state`);
                }
                ctxMenu.push(...state[el]);
            });

            return ctxMenu;
        };
    },
};

const mutations = {};

const actions = {};

export const contextMenuStoreModule: Module<ContextMenuState, any> = {
    namespaced: true,
    state: moduleState,
    getters,
    mutations,
    actions,
};
