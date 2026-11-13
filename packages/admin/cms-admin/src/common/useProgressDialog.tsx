import { Dialog, ProgressBar } from "@dextinity/ui";
import { type ReactNode, useCallback, useState } from "react";
import { useIntl } from "react-intl";

interface ProgressDialogProps {
    title: string;
    progress: { value: number; message?: ReactNode } | undefined;
}

function ignoreOpenChange() {}

/**
 * Shows how far a task is, e.g. pasting blocks or pages, or translating pages. It can't be closed, since stopping halfway would leave
 * the content half done.
 */
export function ProgressDialog({ title, progress }: ProgressDialogProps) {
    const intl = useIntl();

    return (
        <Dialog open={progress !== undefined} onOpenChange={ignoreOpenChange} title={title} size="small" hideCloseButton dismissible={false}>
            <ProgressBar
                value={progress?.value ?? null}
                label={progress?.message}
                aria-label={progress?.message == null ? title : undefined}
                showValue
                locale={intl.locale}
            />
        </Dialog>
    );
}

export function useProgressDialog(options: { title: string }) {
    const [progress, setProgress] = useState<{
        progress: number | undefined;
        message?: ReactNode;
    }>({
        progress: undefined,
        message: undefined,
    });

    const updateProgress = useCallback((progress: number | undefined, message?: ReactNode) => {
        setProgress({ progress, message });
    }, []);

    return {
        progress: progress.progress,
        message: progress.message,
        updateProgress,
        dialog: (
            <ProgressDialog
                title={options.title}
                progress={progress.progress !== undefined ? { value: progress.progress, message: progress.message } : undefined}
            />
        ),
    };
}
