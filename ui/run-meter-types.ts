/** Prepared display data; counters include expanded primitives, never wrapper rows twice. */
export interface RunMeterRow {
    id: string;
    title: string;
    status: string;
    executableCount: number;
    completedCount: number;
}
export interface RunMeterView {
    status: string;
    rows: RunMeterRow[];
    completedCount: number;
    executableCount: number;
    actualCalls: number;
    callBound: number;
    elapsedMs: number | null;
}
