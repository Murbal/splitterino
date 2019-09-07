import { getFinalTime, SegmentTime, TimingMethod } from '../common/interfaces/segment';

export function timeFilter(value: SegmentTime, timing: TimingMethod = TimingMethod.RTA) {
    return value == null || value[timing] == null ? null : getFinalTime(value[timing]);
}
