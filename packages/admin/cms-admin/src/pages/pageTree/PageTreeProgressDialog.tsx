import { Dialog, ProgressBar } from "@dextinity/ui";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";

interface PageTreeProgressDialogProps {
    title: string;
    progress: { value: number; message?: ReactNode } | undefined;
}

function ignoreOpenChange() {}

/**
 * Shows how far a task on pages is, e.g. pasting or translating them. It can't be closed, since stopping halfway would leave
 * the pages half done.
 */
export function PageTreeProgressDialog({ title, progress }: PageTreeProgressDialogProps) {
    const intl = useIntl();

    return (
        <Dialog open={progress !== undefined} onOpenChange={ignoreOpenChange} title={title} size="small" hideCloseButton dismissible={false}>
            <ProgressBar
                value={progress?.value ?? null}
                label={progress?.message}
                aria-label={progress?.message == null ? title : undefined}
                showValue
                format={{ style: "percent", maximumFractionDigits: 0 }}
                locale={intl.locale}
            />
        </Dialog>
    );
}
