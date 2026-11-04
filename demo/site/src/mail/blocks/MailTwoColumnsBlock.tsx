import {
    BlocksBlock,
    css,
    getDefaultFromResponsiveValue,
    MjmlButton,
    MjmlColumn,
    MjmlPixelImageBlock,
    MjmlSection,
    MjmlSpacer,
    type PropsWithData,
    registerStyles,
    type SupportedBlocks,
    useTheme,
    withPreview,
} from "@dextinity/mail-react";
import type { MailButtonBlockData, MailSpacerBlockData, MailTwoColumnsBlockData, PixelImageBlockData } from "@src/blocks.generated";
import { MjmlRichTextBlock } from "@src/mail/blocks/MailRichTextBlock";
import { spacingToHeight } from "@src/mail/blocks/MailSpacerBlock";

const columnGap = 20;

registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .mailTwoColumnsBlock__leftColumn,
            .mailTwoColumnsBlock__rightColumn {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .mailTwoColumnsBlock__leftColumn > table > tbody > tr > td {
                padding-right: 0 !important;
            }

            .mailTwoColumnsBlock__rightColumn > table > tbody > tr > td {
                padding-left: 0 !important;
            }

            .mailTwoColumnsBlock__leftColumn {
                margin-bottom: ${columnGap}px;
            }
        }
    `,
);

const ColumnImageBlock = withPreview<PropsWithData<PixelImageBlockData>>(
    ({ data, className }) => {
        const theme = useTheme();
        const contentWidth = theme.sizes.bodyWidth - 2 * getDefaultFromResponsiveValue(theme.sizes.contentIndentation);

        return (
            <MjmlPixelImageBlock
                data={data}
                width={(contentWidth - columnGap) / 2}
                largestPossibleRenderWidth={contentWidth}
                aspectRatio="4x3"
                fluidOnMobile
                className={className}
            />
        );
    },
    { label: "Image" },
);

const ColumnButtonBlock = withPreview<PropsWithData<MailButtonBlockData>>(
    ({ data, className }) => (
        <MjmlButton href={data.link.targetUrl} variant={data.variant} align={data.align} className={className}>
            {data.text}
        </MjmlButton>
    ),
    { label: "Button" },
);

const ColumnSpacerBlock = withPreview<PropsWithData<MailSpacerBlockData>>(
    ({ data, className }) => <MjmlSpacer height={spacingToHeight[data.spacing]} className={className} />,
    { label: "Spacer" },
);

const supportedBlocks: SupportedBlocks = {
    text: (data) => <MjmlRichTextBlock data={data} />,
    image: (data) => <ColumnImageBlock data={data} />,
    button: (data) => <ColumnButtonBlock data={data} />,
    spacer: (data) => <ColumnSpacerBlock data={data} />,
};

export const MailTwoColumnsBlock = withPreview<PropsWithData<MailTwoColumnsBlockData>>(
    ({ data, className }) => (
        <MjmlSection indent disableResponsiveBehavior className={className}>
            {data.columns.map((column, index) => (
                <MjmlColumn
                    key={column.key}
                    className={index === 0 ? "mailTwoColumnsBlock__leftColumn" : "mailTwoColumnsBlock__rightColumn"}
                    paddingLeft={index === 0 ? 0 : columnGap / 2}
                    paddingRight={index === 0 ? columnGap / 2 : 0}
                >
                    <BlocksBlock data={column.props} supportedBlocks={supportedBlocks} />
                </MjmlColumn>
            ))}
        </MjmlSection>
    ),
    { label: "Two columns" },
);
