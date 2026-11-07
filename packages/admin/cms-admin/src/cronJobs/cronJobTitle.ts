export function getCronJobTitle(cronJob: { name: string; label?: string | null }) {
    return cronJob.label || cronJob.name;
}
