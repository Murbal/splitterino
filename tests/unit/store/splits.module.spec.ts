import { expect } from 'chai';
import { Injector } from 'lightweight-di';
import { v4 as uuid } from 'uuid';
import { Module } from 'vuex';

import { ELECTRON_INTERFACE_TOKEN } from '../../../src/common/interfaces/electron-interface';
import { Segment } from '../../../src/common/interfaces/segment';
import {
    getSplitsStoreModule,
    ID_MUTATION_ADD_SEGMENT,
    MUTATION_ADD_SEGMENT,
} from '../../../src/store/modules/splits.module';
import { RootState } from '../../../src/store/states/root.state';
import { SplitsState } from '../../../src/store/states/splits.state';
import { ElectronMockService } from '../../mocks/electron-mock.service';

// Initialize the Dependency-Injection
const injector = Injector.resolveAndCreate([
    { provide: ELECTRON_INTERFACE_TOKEN, useClass: ElectronMockService },
]);

describe('Splits Store-Module', () => {
    describe('mutations', () => {
        it(MUTATION_ADD_SEGMENT, () => {
            const state: SplitsState = {
                current: -1,
                currentOpenFile: null,
                segments: [],
            };

            const segment: Segment = {
                id: uuid(),
                name: 'test',
            };

            const module: Module<SplitsState, RootState> = getSplitsStoreModule(injector);

            module.mutations[ID_MUTATION_ADD_SEGMENT](state, segment);

            expect(state.segments.length).to.equal(1);
            expect(state.segments[0].id).to.equal(segment.id);
        });
    });
});
