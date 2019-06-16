import { globalShortcut } from 'electron';
import { Injector } from 'lightweight-di';
import { Store } from 'vuex';

import { FunctionRegistry } from '../../common/function-registry';
import { Logger } from '../../utils/logger';
import { MUTATION_SET_BINDINGS } from '../modules/keybindings.module';
import { RootState } from '../states/root.state';

export function getKeybindingsStorePlugin(injector: Injector) {
    return (store: Store<RootState>) => {
        store.subscribe(mutation => {
            try {
                // Skip all mutations which aren't changing the bindings
                if (mutation == null || mutation.type !== MUTATION_SET_BINDINGS) {
                    return;
                }

                // Remove all previously set shortcuts
                globalShortcut.unregisterAll();
                const state = store.state.splitterino.keybindings;
                const bindings = state.bindings;

                if (!Array.isArray(bindings) || bindings.length < 1) {
                    return;
                }

                bindings.forEach((theBinding, index) => {
                    globalShortcut.register(theBinding.accelerator, () => {
                        Logger.debug({
                            msg: 'Keybinding pressed',
                            binding: theBinding
                        });
                        // TODO: Check if global and if the window is focused

                        const actionFn = FunctionRegistry.getKeybindingAction(theBinding.action);
                        if (typeof actionFn === 'function' && !state.disableBindings) {
                            Logger.debug({
                                msg: 'Calling handler for action',
                                binding: theBinding
                            });
                            actionFn({
                                store: store,
                                injector: injector,
                            });
                        } else {
                            Logger.debug({
                                msg: 'No handler found for action',
                                binding: theBinding
                            });
                        }
                    });
                });
            } catch (err) {
                Logger.error(err);

                return;
            }
        });
    };
}
