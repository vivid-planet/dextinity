import clsx from "clsx";
import { createContext, type CSSProperties, type ReactNode, useContext } from "react";

import { generateResponsiveTextCss } from "../../components/text/generateResponsiveTextCss.js";
import { OutlookTextStyleProvider, type OutlookTextStyleValues, useOutlookTextStyle } from "../../components/text/OutlookTextStyleContext.js";
import { getDefaultTextStyle, resolveTextVariant } from "../../components/text/textVariantStyles.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { generateResponsiveTokenCss } from "../../styles/responsiveCss.js";
import { defaultTheme } from "../../theme/defaultTheme.js";
import { getDefaultFromResponsiveValue, getDefaultOrUndefined } from "../../theme/responsiveValue.js";
import { useOptionalTheme } from "../../theme/ThemeProvider.js";
import type { ListMarker, ListMarkerOptions, Theme, ThemeText, VariantName } from "../../theme/themeTypes.js";
import type { BlockTypeTextProps } from "./BlockText.js";

function resolveMarker(marker: ListMarker, options: ListMarkerOptions): ReactNode {
    return typeof marker === "function" ? marker(options) : marker;
}

// Variant names come from the consumer, so the `variant` prefix keeps them apart from the package's own modifiers.
function variantModifier(element: "list" | "listItem", variantName: string): string {
    return `richTextBlock__${element}--variant${variantName.charAt(0).toUpperCase()}${variantName.slice(1)}`;
}

const ListItemVariantContext = createContext<VariantName | undefined>(undefined);

// MJML wraps every child of a column in a `<td>` with `word-break: break-word`, and this cell inherits it. That lets a
// browser shrink the cell to one character wide, so the full-width text cell next to it pushes the marker onto two
// lines. `word-break: normal` undoes it; `white-space: nowrap` alone does not, because Outlook on the web strips
// `white-space` from inline styles.
const markerCellNoLineBreak: CSSProperties = {
    whiteSpace: "nowrap",
    wordBreak: "normal",
};

export interface RichTextListItem {
    key: string;
    content: ReactNode;
    textStyle?: BlockTypeTextProps;
}

interface ListItemTextStyle {
    variant?: VariantName;
    className?: string;
    style: CSSProperties;
}

function resetUnsetInheritedTextStyle(style: CSSProperties): CSSProperties {
    return {
        ...style,
        fontWeight: style.fontWeight ?? "normal",
        fontStyle: style.fontStyle ?? "normal",
        letterSpacing: style.letterSpacing ?? "normal",
        textTransform: style.textTransform ?? "none",
    };
}

function resolveOwnListItemTextStyle(themeText: ThemeText, { variant, className, ...explicitStyles }: BlockTypeTextProps): ListItemTextStyle {
    const { activeVariant, mergedStyles } = resolveTextVariant(themeText, variant);

    return { variant: activeVariant, className, style: resetUnsetInheritedTextStyle({ ...getDefaultTextStyle(mergedStyles), ...explicitStyles }) };
}

function pickOutlookTextStyle({ fontFamily, fontSize, lineHeight, fontWeight, color }: CSSProperties): OutlookTextStyleValues {
    return { fontFamily, fontSize, lineHeight, fontWeight, color };
}

interface RichTextListProps {
    ordered?: boolean;
    variant?: VariantName;
    /** When true, the variant's spacing below the block applies below the last item. */
    bottomSpacing?: boolean;
    hasItemSpacingBelowLastItem?: boolean;
    firstMarkerIndex?: number;
    /** How many lists enclose this one; zero for a list that is not nested. */
    depth: number;
    items: RichTextListItem[];
}

/** Renders one rich-text list as a table, because cell padding is the only list indent Outlook applies reliably. */
export function RichTextList({
    ordered,
    variant,
    bottomSpacing,
    hasItemSpacingBelowLastItem = false,
    firstMarkerIndex = 0,
    depth,
    items,
}: RichTextListProps): ReactNode {
    const theme = useOptionalTheme();
    const outlookTextStyle = useOutlookTextStyle();
    const enclosingItemVariant = useContext(ListItemVariantContext);

    const list = theme?.list ?? defaultTheme.list;
    const themeText: ThemeText = theme?.text ?? {};
    const { activeVariant, mergedStyles } = resolveTextVariant(themeText, variant ?? enclosingItemVariant);

    // The HTML parser can move a raw-HTML block's text element out of the table, so spacing set
    // there would not apply to the list. The last row carries it instead.
    const blockSpacing = bottomSpacing ? getDefaultOrUndefined(mergedStyles.bottomSpacing) : undefined;

    const enclosingTextStyle: ListItemTextStyle = { variant: activeVariant, style: { ...outlookTextStyle } };

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
                depth === 0 && activeVariant && variantModifier("list", activeVariant),
            )}
            style={{ borderCollapse: "collapse" }}
        >
            <tbody>
                {items.map((item, index) => {
                    const itemTextStyle = item.textStyle ? resolveOwnListItemTextStyle(themeText, item.textStyle) : enclosingTextStyle;
                    // The cells cannot inherit the text styles: once the parser has moved the text element away,
                    // the nearest ancestor with a font size is MJML's column, whose font size is zero.
                    const fontStyle: CSSProperties = {
                        ...itemTextStyle.style,
                        ...(itemTextStyle.style.lineHeight !== undefined && { msoLineHeightRule: "exactly" }),
                    };
                    const isFirstItem = index === 0;
                    const isLastItem = index === items.length - 1;
                    const spacingAbove = isFirstItem && isNestedLevel ? itemSpacing : undefined;
                    const hasItemSpacingBelow = !isLastItem || hasItemSpacingBelowLastItem;
                    const spacingBelow = hasItemSpacingBelow ? itemSpacing : blockSpacing;
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
                                itemTextStyle.variant && variantModifier("listItem", itemTextStyle.variant),
                                itemTextStyle.className,
                                spacingAbove !== undefined && "richTextBlock__listItem--itemSpacingAbove",
                                hasItemSpacingBelow && "richTextBlock__listItem--itemSpacing",
                                !hasItemSpacingBelow && blockSpacing !== undefined && "richTextBlock__listItem--blockSpacing",
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
                                {resolveMarker(ordered ? list.orderedMarker : list.unorderedMarker, { index: firstMarkerIndex + index, depth })}
                            </td>
                            <td className="richTextBlock__listItemText" width="100%" valign="top" style={cellStyle}>
                                <ListItemVariantContext value={itemTextStyle.variant}>
                                    <OutlookTextStyleProvider value={pickOutlookTextStyle(itemTextStyle.style)}>
                                        {item.content}
                                    </OutlookTextStyleProvider>
                                </ListItemVariantContext>
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
                `.${variantModifier("listItem", variantName)} > .richTextBlock__listItemMarker, .${variantModifier("listItem", variantName)} > .richTextBlock__listItemText`,
            spacingSelector: (variantName) => `.${variantModifier("listItem", variantName)}.richTextBlock__listItem--blockSpacing > td`,
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
