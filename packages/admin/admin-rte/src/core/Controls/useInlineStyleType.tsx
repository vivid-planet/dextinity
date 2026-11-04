import { RteBold, RteItalic, RteStrikethrough, RteSub, RteSup, RteUnderlined } from "@dextinity/admin-icons";
import * as detectBrowser from "detect-browser";
import { type Editor, type EditorState, RichUtils } from "draft-js";
import { type RefObject, useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";

import type { SupportedThings } from "../Rte";
import type { CustomInlineStyles, IFeatureConfig, InlineStyleType } from "../types";

const browser = detectBrowser.detect();

interface IProps {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
    supportedThings: SupportedThings[];
    editorRef: RefObject<Editor | null>;
    customInlineStyles?: CustomInlineStyles;
}

const defaultFeatures: Array<IFeatureConfig<InlineStyleType>> = [
    {
        name: "BOLD",
        label: <FormattedMessage id="dextinity.rte.controls.blockType.bold.label" defaultMessage="Bold" />,
        icon: RteBold,
        tooltipText:
            browser?.os === "Mac OS" ? (
                <FormattedMessage id="dextinity.rte.controls.blockType.bold.tooltipMac" defaultMessage="Cmd+B" />
            ) : (
                <FormattedMessage id="dextinity.rte.controls.blockType.bold.tooltip" defaultMessage="Ctrl+B" />
            ),
    },
    {
        name: "ITALIC",
        label: <FormattedMessage id="dextinity.rte.controls.blockType.italic.label" defaultMessage="Italic" />,
        icon: RteItalic,
        tooltipText:
            browser?.os === "Mac OS" ? (
                <FormattedMessage id="dextinity.rte.controls.blockType.italic.tooltipMac" defaultMessage="Cmd+I" />
            ) : (
                <FormattedMessage id="dextinity.rte.controls.blockType.italic.tooltip" defaultMessage="Ctrl+I" />
            ),
    },
    {
        name: "UNDERLINE",
        label: <FormattedMessage id="dextinity.rte.controls.blockType.underlined.label" defaultMessage="underlined" />,
        icon: RteUnderlined,
        tooltipText:
            browser?.os === "Mac OS" ? (
                <FormattedMessage id="dextinity.rte.controls.blockType.underlined.tooltipMac" defaultMessage="Cmd+U" />
            ) : (
                <FormattedMessage id="dextinity.rte.controls.blockType.underlined.tooltip" defaultMessage="Ctrl+U" />
            ),
    },
    {
        name: "STRIKETHROUGH",
        label: <FormattedMessage id="dextinity.rte.controls.blockType.strikethrough.label" defaultMessage="Strikethrough" />,
        icon: RteStrikethrough,
    },
    {
        name: "SUP",
        label: <FormattedMessage id="dextinity.rte.controls.blockType.super.label" defaultMessage="Superscript" />,
        icon: RteSup,
    },
    {
        name: "SUB",
        label: <FormattedMessage id="dextinity.rte.controls.blockType.sub.label" defaultMessage="Subscript" />,
        icon: RteSub,
    },
];

export default function useInlineStyleType({ editorState, setEditorState, supportedThings, editorRef, customInlineStyles }: IProps) {
    // can check if inlineStyleType is supported by the editor
    const supports = useCallback(
        (inlineStyle: InlineStyleType) => {
            switch (inlineStyle) {
                case "BOLD":
                    return supportedThings.includes("bold");
                case "ITALIC":
                    return supportedThings.includes("italic");
                case "UNDERLINE":
                    return supportedThings.includes("underline");
                case "STRIKETHROUGH":
                    return supportedThings.includes("strikethrough");
                case "SUB":
                    return supportedThings.includes("sub");
                case "SUP":
                    return supportedThings.includes("sup");
                default:
                    return false;
            }
        },
        [supportedThings],
    );

    const inlineStyleActive = useCallback(
        (draftInlineStyleType: InlineStyleType) => {
            const currentStyle = editorState.getCurrentInlineStyle();
            return currentStyle.has(draftInlineStyleType);
        },
        [editorState],
    );

    const handleInlineStyleButtonClick = useCallback(
        (draftInlineStyleType: InlineStyleType, e: MouseEvent) => {
            e.preventDefault();
            setEditorState(RichUtils.toggleInlineStyle(editorState, draftInlineStyleType));
        },
        [setEditorState, editorState],
    );

    const features: Array<IFeatureConfig<InlineStyleType>> = useMemo(
        () => [
            ...defaultFeatures
                .filter((c) => supports(c.name))
                .map((c) => ({
                    ...c,
                    selected: inlineStyleActive(c.name),
                    onButtonClick: handleInlineStyleButtonClick.bind(null, c.name),
                })),
            ...(customInlineStyles
                ? Object.entries(customInlineStyles).map(([name, { style, ...restOptions }]) => ({
                      ...restOptions,
                      name,
                      selected: inlineStyleActive(name),
                      onButtonClick: handleInlineStyleButtonClick.bind(null, name),
                  }))
                : []),
        ],
        [supports, inlineStyleActive, handleInlineStyleButtonClick, customInlineStyles],
    );

    return {
        features,
    };
}
