import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

import { generateResponsiveTextCss } from "../../components/text/generateResponsiveTextCss.js";
import { useOutlookTextStyle } from "../../components/text/OutlookTextStyleContext.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { generateResponsiveTokenCss } from "../../styles/responsiveCss.js";
import { defaultTheme } from "../../theme/defaultTheme.js";
import { getDefaultFromResponsiveValue, getDefaultOrUndefined } from "../../theme/responsiveValue.js";
import { useOptionalTheme } from "../../theme/ThemeProvider.js";
import type { ListMarker, ListMarkerOptions, TextVariantStyles, Theme, ThemeText, VariantName } from "../../theme/themeTypes.js";

function resolveMarker(marker: ListMarker, options: ListMarkerOptions): ReactNode {
    return typeof marker === "function" ? marker(options) : marker;
}

// Variant names come from the consumer, so the `variant` prefix keeps them apart from the package's own modifiers.
function variantModifier(variantName: string): string {
    return `richTextBlock__list--variant${variantName.charAt(0).toUpperCase()}${variantName.slice(1)}`;
}

// MJML wraps every child of a column in a `<td>` with `word-break: break-word`, and this cell inherits it. That lets a
// browser shrink the cell to one character wide, so the full-width text cell next to it pushes the marker onto two
// lines. `word-break: normal` undoes it; `white-space: nowrap` alone does not, because Outlook on the web strips
// `white-space` from inline styles.
const markerCellNoLineBreak: CSSProperties = {
    whiteSpace: "nowrap",
    wordBreak: "normal",
};

interface RichTextListItem {
    key: string;
    content: ReactNode;
}

interface RichTextListProps {
    ordered?: boolean;
    variant?: VariantName;
    /** When true, the variant's spacing below the block applies below the last item. */
    bottomSpacing?: boolean;
    /** How many lists enclose this one; zero for a list that is not nested. */
    depth: number;
    items: RichTextListItem[];
}

/** Renders one rich-text list as a table, because cell padding is the only list indent Outlook applies reliably. */
export function RichTextList({ ordered, variant, bottomSpacing, depth, items }: RichTextListProps): ReactNode {
    const theme = useOptionalTheme();
    const outlookTextStyle = useOutlookTextStyle();

    const list = theme?.list ?? defaultTheme.list;
    const themeText: ThemeText = theme?.text ?? {};
    const { defaultVariant, variants, ...baseTextStyles } = themeText;
    const activeVariant = variant ?? defaultVariant;
    const variantStyles = activeVariant ? variants?.[activeVariant] : undefined;
    const mergedStyles: TextVariantStyles = { ...baseTextStyles, ...variantStyles };

    // The HTML parser can move a raw-HTML block's text element out of the table, so spacing set
    // there would not apply to the list. The last row carries it instead.
    const blockSpacing = bottomSpacing ? getDefaultOrUndefined(mergedStyles.bottomSpacing) : undefined;

    // The cells cannot inherit the text styles: once the parser has moved the text element away,
    // the nearest ancestor with a font size is MJML's column, whose font size is zero.
    const fontStyle: CSSProperties = {
        ...outlookTextStyle,
        ...(outlookTextStyle?.lineHeight !== undefined && { msoLineHeightRule: "exactly" }),
    };

    const itemSpacing = getDefaultFromResponsiveValue(list.itemSpacing);
    const isNestedLevel = depth > 0;

    const markerCellPadding: CSSProperties = {
        paddingLeft: getDefaultFromResponsiveValue(list.indent),
        paddingRight: getDefaultFromResponsiveValue(list.markerGap),
    };

    return (
        <table
            role="presentation"
            cellPadding={0}
            cellSpacing={0}
            border={0}
            width="100%"
            className={clsx(
                "richTextBlock__list",
                ordered ? "richTextBlock__list--ordered" : "richTextBlock__list--unordered",
                `richTextBlock__list--depth${String(depth)}`,
                depth > 0 && "richTextBlock__list--nested",
                depth === 0 && activeVariant && variantModifier(activeVariant),
            )}
            style={{ borderCollapse: "collapse" }}
        >
            <tbody>
                {items.map((item, index) => {
                    const isFirstItem = index === 0;
                    const isLastItem = index === items.length - 1;
                    const spacingAbove = isFirstItem && isNestedLevel ? itemSpacing : undefined;
                    const spacingBelow = isLastItem ? blockSpacing : itemSpacing;
                    const cellStyle: CSSProperties = {
                        ...fontStyle,
                        ...(spacingAbove !== undefined && { paddingTop: spacingAbove }),
                        ...(spacingBelow !== undefined && { paddingBottom: spacingBelow }),
                    };

                    return (
                        <tr
                            key={item.key}
                            className={clsx(
                                "richTextBlock__listItem",
                                spacingAbove !== undefined && "richTextBlock__listItem--itemSpacingAbove",
                                !isLastItem && "richTextBlock__listItem--itemSpacing",
                                isLastItem && blockSpacing !== undefined && "richTextBlock__listItem--blockSpacing",
                            )}
                        >
                            <td
                                className="richTextBlock__listItemMarker"
                                align={ordered ? "right" : "left"}
                                valign="top"
                                style={{
                                    ...cellStyle,
                                    ...markerCellPadding,
                                    ...markerCellNoLineBreak,
                                }}
                            >
                                {resolveMarker(ordered ? list.orderedMarker : list.unorderedMarker, { index, depth })}
                            </td>
                            <td className="richTextBlock__listItemText" width="100%" valign="top" style={cellStyle}>
                                {item.content}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export function generateRichTextListStyles(theme: Theme): string {
    return [
        generateResponsiveListSpacingCss(theme),
        generateResponsiveTextCss(theme, {
            styleSelector: (variantName) =>
                `.${variantModifier(variantName)} .richTextBlock__listItemMarker, .${variantModifier(variantName)} .richTextBlock__listItemText`,
            spacingSelector: (variantName) => `.${variantModifier(variantName)} .richTextBlock__listItem--blockSpacing > td`,
        }),
    ]
        .filter(Boolean)
        .join("\n");
}

function generateResponsiveListSpacingCss(theme: Theme): string {
    return [
        generateResponsiveTokenCss({
            breakpoints: theme.breakpoints,
            selector: ".richTextBlock__listItemMarker",
            tokens: [
                { value: theme.list.indent, cssProperty: "padding-left", unit: "px" },
                { value: theme.list.markerGap, cssProperty: "padding-right", unit: "px" },
            ],
        }),
        generateResponsiveTokenCss({
            breakpoints: theme.breakpoints,
            selector: ".richTextBlock__listItem--itemSpacing > td",
            tokens: [{ value: theme.list.itemSpacing, cssProperty: "padding-bottom", unit: "px" }],
        }),
        generateResponsiveTokenCss({
            breakpoints: theme.breakpoints,
            selector: ".richTextBlock__listItem--itemSpacingAbove > td",
            tokens: [{ value: theme.list.itemSpacing, cssProperty: "padding-top", unit: "px" }],
        }),
    ]
        .filter(Boolean)
        .join("\n");
}

registerStyles(generateRichTextListStyles);
