import { Segment } from '../../common/segment';

export interface SplitsState {
    /**
     * Index of the current segment.
     * Is -1 when the splits are not running.
     */
    current: number;
    /**
     * All segments
     */
    segments: Segment[];
}
