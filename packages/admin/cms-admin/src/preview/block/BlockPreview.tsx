import { Icon, IconButton } from "@dextinity/ui";
import { useIntl } from "react-intl";

import { BlockPreviewPane } from "./BlockPreviewPane";
import type { BlockPreviewApi } from "./useBlockPreview";

interface Props {
    previewApi: BlockPreviewApi;
    url: string;
    previewState: unknown;
    /** The public address of the edited page, shown above the preview. Defaults to `url`. */
    siteUrl?: string;
}

/**
 * The block preview of `SplitPreview`, which can be minimized.
 *
 * @deprecated Use `BlockPreviewPane`, built with `@dextinity/ui`.
 */
function BlockPreview({ url, previewState, previewApi, siteUrl }: Props) {
    const intl = useIntl();

    return (
        <BlockPreviewPane
            url={url}
            siteUrl={siteUrl}
            previewState={previewState}
            previewApi={previewApi}
            actions={
                <IconButton
                    variant="text"
                    color="secondary"
                    size="small"
                    aria-label={intl.formatMessage({ id: "dextinity.preview.minimize", defaultMessage: "Minimize preview" })}
                    onClick={() => previewApi.setMinimized((minimized) => !minimized)}
                >
                    <Icon name="minimize" />
                </IconButton>
            }
        />
    );
}

export { BlockPreview };
