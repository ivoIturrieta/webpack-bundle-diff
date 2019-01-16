import { DiffResults, ChunkGroupDiff } from '../../types/DiffResults';

export function generateReport(diff: DiffResults) {
    const lines: string[] = [];

    for (let chunkGroupName of Object.keys(diff)) {
        reportChunkGroup(chunkGroupName, diff[chunkGroupName], lines);
        lines.push('');
    }

    return lines.join('\n');
}

function reportChunkGroup(chunkGroupName: string, chunkGroupDiff: ChunkGroupDiff, lines: string[]) {
    // If there are no changes in the chunk group, don't report it
    if (
        !chunkGroupDiff.added.length &&
        !chunkGroupDiff.removed.length &&
        !chunkGroupDiff.changed.length
    ) {
        return;
    }

    lines.push(`## ${chunkGroupName}`);

    // Header
    lines.push('|| Module | Count | Size |');
    lines.push('|-|-|-|-|-|');

    for (const moduleDiff of chunkGroupDiff.added) {
        lines.push(
            `|+|${moduleDiff.module}|${moduleDiff.weight.moduleCount}|${moduleDiff.weight.size}|`
        );
    }

    for (const moduleDiff of chunkGroupDiff.removed) {
        lines.push(
            `|-|${moduleDiff.module}|${moduleDiff.weight.moduleCount}|${moduleDiff.weight.size}|`
        );
    }

    const THRESHOLD = 100;
    let count = 0;
    let netDelta = 0;
    for (const moduleDelta of chunkGroupDiff.changed) {
        if (Math.abs(moduleDelta.delta) < THRESHOLD) {
            count++;
            netDelta += moduleDelta.delta;
        } else {
            lines.push(`|△|${moduleDelta.module}| |${moduleDelta.delta}|`);
        }
    }

    if (count) {
        lines.push(`|△|*${count} modules with minor changes*| |${netDelta}|`);
    }
}