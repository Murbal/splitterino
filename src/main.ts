import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { Aevum } from 'aevum';
import { ipcRenderer } from 'electron';
import VRuntimeTemplate from 'v-runtime-template';
import Vue from 'vue';
import VueSelect from 'vue-select';
import draggable from 'vuedraggable';

import App from './app.vue';
import { DEFAULT_TIMER_FORMAT } from './common/constants';
import { registerDefaultContextMenuFunctions } from './common/function-registry';
import { ELECTRON_INTERFACE_TOKEN } from './common/interfaces/electron';
import { getFinalTime, SegmentTime, TimingMethod } from './common/interfaces/segment';
import AevumFormatInputComponent from './components/aevum-format-input.vue';
import BestPossibleTimeComponent from './components/best-possible-time.vue';
import ButtonComponent from './components/button.vue';
import CheckboxComponent from './components/checkbox.vue';
import ConfigurationEditorComponent from './components/configuration-editor.vue';
import GameInfoEditorComponent from './components/game-info-editor.vue';
import KeybindingEditorComponent from './components/keybinding-editor.vue';
import KeybindingInputComponent from './components/keybinding-input.vue';
import NumberInputComponent from './components/number-input.vue';
import OpenSplitsPromptComponent from './components/open-splits-prompt.vue';
import OpenTemplatePromptComponent from './components/open-template-prompt.vue';
import PossibleTimeSaveComponent from './components/possible-time-save.vue';
import PreviousSegmentComponent from './components/previous-segment.vue';
import SegmentsEditorComponent from './components/segments-editor.vue';
import SettingsEditorSidebarComponent from './components/settings-editor-sidebar.vue';
import SettingsEditorComponent from './components/settings-editor.vue';
import SplitsComponent from './components/splits.vue';
import SummaryOfBestComponent from './components/summary-of-best.vue';
import TextInputComponent from './components/text-input.vue';
import TimeInputComponent from './components/time-input.vue';
import TimerComponent from './components/timer.vue';
import TitleBarComponent from './components/title-bar.vue';
import { getContextMenuDirective } from './directives/context-menu.directive';
import { router } from './router';
import { getClientStore } from './store';
import { eventHub } from './utils/event-hub';
import { Logger, LogLevel } from './utils/logger';
import { createInjector } from './utils/services';

process.on('uncaughtException', error => {
    Logger.fatal({
        msg: 'Uncaught Exception in render process!',
        error: error,
    });

    // Close the window
    window.close();

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
    const injector = createInjector();

    // Initialize the logger
    const logLevel = ipcRenderer.sendSync('spl-log-level') as LogLevel;
    Logger.initialize(injector, logLevel);

    const electron = injector.get(ELECTRON_INTERFACE_TOKEN);

    // FontAwesome Icons
    library.add(fas);
    Vue.component('fa-icon', FontAwesomeIcon);

    // Draggable
    Vue.component('draggable', draggable);

    // Select
    Vue.component('vue-select', VueSelect);

    // v-runtime-template
    Vue.component('v-runtime-template', VRuntimeTemplate);

    // Register Components
    Vue.component('spl-aevum-format-input', AevumFormatInputComponent);
    Vue.component('spl-best-possible-time', BestPossibleTimeComponent);
    Vue.component('spl-button', ButtonComponent);
    Vue.component('spl-checkbox', CheckboxComponent);
    Vue.component('spl-configuiration-editor', ConfigurationEditorComponent);
    Vue.component('spl-game-info-editor', GameInfoEditorComponent);
    Vue.component('spl-keybinding-editor', KeybindingEditorComponent);
    Vue.component('spl-keybinding-input', KeybindingInputComponent);
    Vue.component('spl-number-input', NumberInputComponent);
    Vue.component('spl-possible-time-save', PossibleTimeSaveComponent);
    Vue.component('spl-previous-segment', PreviousSegmentComponent);
    Vue.component('spl-segments-editor', SegmentsEditorComponent);
    Vue.component('spl-splits', SplitsComponent);
    Vue.component('spl-summary-of-best', SummaryOfBestComponent);
    Vue.component('spl-text-input', TextInputComponent);
    Vue.component('spl-time-input', TimeInputComponent);
    Vue.component('spl-timer', TimerComponent);
    Vue.component('spl-title-bar', TitleBarComponent);
    Vue.component('spl-settings-editor', SettingsEditorComponent);
    Vue.component('spl-settings-editor-sidebar', SettingsEditorSidebarComponent);
    Vue.component('spl-open-splits-prompt', OpenSplitsPromptComponent);
    Vue.component('spl-open-template-prompt', OpenTemplatePromptComponent);

    // Register Directives
    Vue.directive('spl-ctx-menu', getContextMenuDirective(injector));

    // Register Filters
    const formatterCache = {};

    Vue.filter('aevum', (value: any, format?: string) => {
        if (value == null || !isFinite(value) || isNaN(value)) {
            return '';
        }
        if (typeof format !== 'string' || format.trim().length < 1) {
            format = DEFAULT_TIMER_FORMAT;
        }
        let formatter = formatterCache[format];
        if (formatter == null) {
            formatter = new Aevum(format);
            formatterCache[format] = formatter;
        }

        return formatter.format(value, { padding: true });
    });
    Vue.filter('time', (value: SegmentTime, timing: TimingMethod = TimingMethod.RTA) => {
        return value == null || value[timing] == null ? null : getFinalTime(value[timing]);
    });

    // Disable tips
    Vue.config.productionTip = false;

    // Update the Prototype with an injector and event-hub
    Vue.prototype.$services = injector;
    Vue.prototype.$eventHub = eventHub;

    // Register context-menu functions
    registerDefaultContextMenuFunctions(injector);

    // Initialize the Application
    const vue = new Vue({
        render: h => h(App),
        store: getClientStore(Vue, injector),
        router
    }).$mount('#app');

    // Only execute certain functionality if window is main window
    if (electron.getCurrentWindow().id === 1) {
        // loadSettings(vue);
    }
})().catch(err => {
    Logger.fatal({
        msg: 'Unknown Error in the render thread!',
        error: err,
    });
});
