import { css, registerStyles } from "@dextinity/mail-react";

// The theme's `list` spacing applies to every list, so this rule changes the small variant only.
// `inline` writes the padding into each cell's `style` attribute, which Outlook needs, and overrides the cell's own value.
registerStyles(
    css`
        .richTextBlock__list--variantCopySmall .richTextBlock__listItem--itemSpacing > td {
            padding-bottom: 4px !important;
        }

        .richTextBlock__list--variantCopySmall .richTextBlock__listItemMarker {
            padding-right: 8px !important;
        }
    `,
    { inline: true },
);
