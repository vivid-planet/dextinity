import { Dialog, ProgressBar } from "@dextinity/ui";
import { useIntl } from "react-intl";

import { formatFileSize } from "../../finder/damFinderItems";

interface ProgressDialogProps {
    open: boolean;
    totalSize?: number;
    loadedSize?: number;
}

export const ProgressDialog = ({ open, totalSize, loadedSize }: ProgressDialogProps) => {
    const intl = useIntl();
    const isSizeKnown = totalSize !== undefined && totalSize > 0;

    return (
        <Dialog
            open={open}
            onOpenChange={() => undefined}
            dismissible={false}
            hideCloseButton
            size="small"
            title={intl.formatMessage({ id: "dextinity.dam.file.uploading", defaultMessage: "Uploading" })}
        >
            <ProgressBar
                value={isSizeKnown ? Math.min(loadedSize ?? 0, totalSize) : null}
                max={isSizeKnown ? totalSize : undefined}
                label={
                    isSizeKnown
                        ? intl.formatMessage(
                              { id: "dextinity.dam.file.totalLoadedUpload", defaultMessage: "{loaded} / {total}" },
                              { loaded: formatFileSize(intl, Math.min(loadedSize ?? 0, totalSize)), total: formatFileSize(intl, totalSize) },
                          )
                        : intl.formatMessage({ id: "dextinity.dam.file.loading", defaultMessage: "Loading ..." })
                }
                showValue={isSizeKnown}
                locale={intl.locale}
            />
        </Dialog>
    );
};
