import { Module } from 'vuex';

import {
    CTX_MENU_KEYBINDINGS_OPEN,
    CTX_MENU_SETTINGS_OPEN,
    CTX_MENU_SPLITS_EDIT,
    CTX_MENU_SPLITS_LOAD_FROM_FILE,
    CTX_MENU_SPLITS_SAVE_TO_FILE,
    CTX_MENU_WINDOW_CLOSE,
    CTX_MENU_WINDOW_RELOAD,
    CTX_MENU_TEMPLATES_LOAD_FROM_FILE,
} from '../../common/constants';
import { ContextMenuState } from '../states/context-menu.state';
import { RootState } from '../states/root.state';

const MODULE_PATH = 'splitterino/contextMenu';

const ID_GETTER_MENUES = 'ctxMenu';

export const GETTER_MENUES = `${MODULE_PATH}/${ID_GETTER_MENUES}`;

export function getContextMenuStoreModule(): Module<ContextMenuState, RootState> {
    return {
        namespaced: true,
        state: {
            def: [
                {
                    label: 'Reload',
                    actions: [CTX_MENU_WINDOW_RELOAD],
                },
                {
                    label: 'Exit',
                    actions: [CTX_MENU_WINDOW_CLOSE],
                },
            ],
            splitter: [
                {
                    label: 'Edit Splits ...',
                    actions: [CTX_MENU_SPLITS_EDIT],
                },
                {
                    label: 'Load Splits ...',
                    actions: [CTX_MENU_SPLITS_LOAD_FROM_FILE],
                },
                {
                    label: 'Save Splits ...',
                    actions: [CTX_MENU_SPLITS_SAVE_TO_FILE],
                },
            ],
            templates: [
                {
                    label: 'Load Templates ...',
                    actions: [CTX_MENU_TEMPLATES_LOAD_FROM_FILE],
                },
            ],
            settings: [
                {
                    label: 'Settings ...',
                    actions: [CTX_MENU_SETTINGS_OPEN],
                },
            ],
            keybindings: [
                {
                    label: 'Keybindings ...',
                    actions: [CTX_MENU_KEYBINDINGS_OPEN],
                },
            ],
        },
        getters: {
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
        },
        mutations: {},
        actions: {},
    };
}
