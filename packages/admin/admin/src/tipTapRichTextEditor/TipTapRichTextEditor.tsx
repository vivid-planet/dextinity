import {
    MoreHorizontal,
    RteAlignCenter,
    RteAlignJustify,
    RteAlignLeft,
    RteAlignRight,
    RteBold,
    RteClearLink,
    RteIndentDecrease,
    RteIndentIncrease,
    RteItalic,
    RteLink,
    RteNonBreakingSpace,
    RteOl,
    RteRedo,
    RteSoftHyphen,
    RteStrikethrough,
    RteSub,
    RteSup,
    RteTextPlaceholder,
    RteUl,
    RteUnderlined,
    RteUndo,
    Translate,
} from "@dextinity/admin-icons";
import { type ComponentsOverrides, css, type FormControl, type Theme, useThemeProps } from "@mui/material";
import { EditorContent, type JSONContent, useEditor } from "@tiptap/react";
import { deepEqual } from "fast-equals";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

import { useErrorDialog } from "../error/errordialog/useErrorDialog";
import { createComponentSlot } from "../helpers/createComponentSlot";
import type { ThemedComponentBaseProps } from "../helpers/ThemedComponentBaseProps";
import { useContentTranslationService } from "../translator/useContentTranslationService";
import { buildTipTapExtensions } from "./buildExtensions";
import { translateTipTapContent } from "./contentTranslation";
import { ContentTranslationDialog } from "./ContentTranslationDialog";
import { InlineStyleContext } from "./InlineStyleContext";
import { getListNestingDepthFromJson, trimListNesting } from "./listLevelMaxHelpers";
import { resolveTipTapOptions, type TipTapResolvedOptions, type TipTapRichTextEditorOptions } from "./options";
import { TextBlockContext } from "./TextBlockContext";
import { TipTapRichTextEditorToolbar } from "./TipTapRichTextEditorToolbar";

export type TipTapRichTextEditorClassKey = "root" | "readOnly" | "content" | "toolbar" | "toolbarGroup" | "toolbarSelect";

export interface TipTapRichTextEditorIconMapping {
    undo?: ReactNode;
    redo?: ReactNode;
    translate?: ReactNode;
    bold?: ReactNode;
    italic?: ReactNode;
    underline?: ReactNode;
    strike?: ReactNode;
    superscript?: ReactNode;
    subscript?: ReactNode;
    moreOptions?: ReactNode;
    alignLeft?: ReactNode;
    alignCenter?: ReactNode;
    alignRight?: ReactNode;
    alignJustify?: ReactNode;
    orderedList?: ReactNode;
    unorderedList?: ReactNode;
    indent?: ReactNode;
    dedent?: ReactNode;
    link?: ReactNode;
    removeLink?: ReactNode;
    placeholder?: ReactNode;
    nonBreakingSpace?: ReactNode;
    softHyphen?: ReactNode;
}

export interface TipTapRichTextEditorProps extends ThemedComponentBaseProps<{
    root: "div";
    content: "div";
    toolbar: "div";
    toolbarGroup: "div";
    toolbarSelect: typeof FormControl;
}> {
    value: JSONContent;
    onChange?: (value: JSONContent) => void;
    /**
     * Define the options outside of the component, so they keep their identity between renders.
     */
    options?: TipTapRichTextEditorOptions;
    readOnly?: boolean;
    iconMapping?: TipTapRichTextEditorIconMapping;
}

type OwnerState = {
    readOnly: boolean;
    minHeight: number;
};

export function TipTapRichTextEditor(inProps: TipTapRichTextEditorProps) {
    const { options, ...props } = useThemeProps({ props: inProps, name: "DextinityAdminTipTapRichTextEditor" });
    const resolvedOptions = useMemo(() => resolveTipTapOptions(options), [options]);
    return <ResolvedTipTapRichTextEditor resolvedOptions={resolvedOptions} {...props} />;
}

const resolveIcons = ({
    undo = <RteUndo />,
    redo = <RteRedo />,
    translate = <Translate />,
    bold = <RteBold />,
    italic = <RteItalic />,
    underline = <RteUnderlined />,
    strike = <RteStrikethrough />,
    superscript = <RteSup />,
    subscript = <RteSub />,
    moreOptions = <MoreHorizontal />,
    alignLeft = <RteAlignLeft />,
    alignCenter = <RteAlignCenter />,
    alignRight = <RteAlignRight />,
    alignJustify = <RteAlignJustify />,
    orderedList = <RteOl />,
    unorderedList = <RteUl />,
    indent = <RteIndentIncrease />,
    dedent = <RteIndentDecrease />,
    link = <RteLink />,
    removeLink = <RteClearLink />,
    placeholder = <RteTextPlaceholder />,
    nonBreakingSpace = <RteNonBreakingSpace />,
    softHyphen = <RteSoftHyphen />,
}: TipTapRichTextEditorIconMapping): Required<TipTapRichTextEditorIconMapping> => ({
    undo,
    redo,
    translate,
    bold,
    italic,
    underline,
    strike,
    superscript,
    subscript,
    moreOptions,
    alignLeft,
    alignCenter,
    alignRight,
    alignJustify,
    orderedList,
    unorderedList,
    indent,
    dedent,
    link,
    removeLink,
    placeholder,
    nonBreakingSpace,
    softHyphen,
});

interface ResolvedTipTapRichTextEditorProps extends Omit<TipTapRichTextEditorProps, "options"> {
    resolvedOptions: TipTapResolvedOptions;
}

export const ResolvedTipTapRichTextEditor = ({
    value,
    onChange,
    resolvedOptions,
    readOnly = false,
    iconMapping = {},
    slotProps,
    ...restProps
}: ResolvedTipTapRichTextEditorProps) => {
    const { maxTextBlocks, listLevelMax, minHeight } = resolvedOptions;
    const ownerState: OwnerState = { readOnly, minHeight };

    // Content the editor holds that hasn't come back through `value` yet. Matched by identity, not by
    // value: content set from outside can be equal to one of these and still has to be applied.
    // Seeded with the content useEditor is created with, which the editor already holds at mount.
    const contentEmittedByEditor = useRef<JSONContent[]>([value]);

    const extensions = buildTipTapExtensions(resolvedOptions);
    const textBlockContextValue = {
        textBlocks: resolvedOptions.textBlocks,
        orderedList: resolvedOptions.orderedList,
        unorderedList: resolvedOptions.unorderedList,
    };

    const editor = useEditor({
        extensions,
        content: value,
        editable: !readOnly,
        onUpdate: ({ editor }) => {
            if (maxTextBlocks !== undefined && editor.state.doc.childCount > maxTextBlocks) {
                // Remove excess text blocks (e.g. from paste)
                const { tr } = editor.state;
                const doc = editor.state.doc;
                // Find the resolved position after the maxTextBlocks-th child
                let pos = 0;
                for (let i = 0; i < maxTextBlocks; i++) {
                    pos += doc.child(i).nodeSize;
                }
                tr.delete(pos, doc.content.size);
                editor.view.dispatch(tr);
                return;
            }

            if (listLevelMax !== undefined) {
                const json = editor.getJSON();
                const currentDepth = getListNestingDepthFromJson(json);
                if (currentDepth > listLevelMax) {
                    // Trim nested lists that exceed the limit (e.g. from paste)
                    const trimmed = trimListNesting(json, listLevelMax);
                    editor.commands.setContent(trimmed);
                    return;
                }
            }

            const content = editor.getJSON();
            contentEmittedByEditor.current.push(content);
            onChange?.(content);
        },
    });

    // useEditor applies its content once, at creation, so content set from outside needs re-syncing here.
    useEffect(() => {
        if (!editor) {
            return;
        }

        // React can render a keystroke's state after later keystrokes already reached the editor, so
        // applying anything the editor emitted itself would undo those later keystrokes.
        const emittedIndex = contentEmittedByEditor.current.indexOf(value);
        if (emittedIndex >= 0) {
            contentEmittedByEditor.current.splice(0, emittedIndex + 1);
            return;
        }

        contentEmittedByEditor.current.length = 0;

        if (deepEqual(value, editor.getJSON())) {
            return;
        }

        // setContent replaces the whole document, which moves the caret to the end.
        const { from, to } = editor.state.selection;
        editor.commands.setContent(value, { emitUpdate: false });
        editor.commands.setTextSelection({ from, to });
    }, [editor, value]);

    const translationContext = useContentTranslationService();
    const canTranslate = translationContext.enabled && resolvedOptions.contentTranslation;
    const [translationDialogState, setTranslationDialogState] = useState<{ original: JSONContent; translated: JSONContent } | null>(null);
    const errorDialog = useErrorDialog();

    if (!editor) {
        return null;
    }

    async function handleTranslateClick() {
        try {
            const original = editor.getJSON();
            const translated = await translateTipTapContent(original, translationContext.translate, { resolvedOptions, extensions });
            if (translationContext.showApplyTranslationDialog) {
                setTranslationDialogState({ original, translated });
            } else {
                editor.commands.setContent(translated);
            }
        } catch (error) {
            errorDialog?.showError({
                title: <FormattedMessage id="dextinity.translator.error.title" defaultMessage="Translation failed" />,
                userMessage: (
                    <FormattedMessage
                        id="dextinity.translator.error.message"
                        defaultMessage="An error occurred while translating the content. Please try again."
                    />
                ),
                error: error instanceof Error ? error.message : "Translation failed",
            });
        }
    }

    return (
        <TextBlockContext.Provider value={textBlockContextValue}>
            <InlineStyleContext.Provider value={resolvedOptions.inlineStyles}>
                <Root ownerState={ownerState} {...slotProps?.root} {...restProps}>
                    {!readOnly && (
                        <TipTapRichTextEditorToolbar
                            editor={editor}
                            resolvedOptions={resolvedOptions}
                            canTranslate={canTranslate}
                            onTranslateClick={handleTranslateClick}
                            icons={resolveIcons(iconMapping)}
                            slotProps={slotProps}
                        />
                    )}
                    <Content ownerState={ownerState} {...slotProps?.content}>
                        <EditorContent editor={editor} />
                    </Content>
                </Root>
                {translationDialogState && (
                    <ContentTranslationDialog
                        open
                        onClose={() => setTranslationDialogState(null)}
                        originalContent={translationDialogState.original}
                        translatedContent={translationDialogState.translated}
                        onApplyTranslation={(content) => {
                            editor.commands.setContent(content);
                            setTranslationDialogState(null);
                        }}
                        resolvedOptions={resolvedOptions}
                        iconMapping={iconMapping}
                    />
                )}
            </InlineStyleContext.Provider>
        </TextBlockContext.Provider>
    );
};

const Root = createComponentSlot("div")<TipTapRichTextEditorClassKey, OwnerState>({
    componentName: "TipTapRichTextEditor",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.readOnly && "readOnly"];
    },
})(
    ({ theme, ownerState }) => css`
        ${
            !ownerState.readOnly &&
            css`
                border: 1px solid ${theme.palette.grey[100]};
                border-top-width: 0;
                background-color: white;
                border-radius: 2px;
            `
        }
    `,
);

const Content = createComponentSlot("div")<TipTapRichTextEditorClassKey, OwnerState>({
    componentName: "TipTapRichTextEditor",
    slotName: "content",
})(({ ownerState }) =>
    ownerState.readOnly
        ? css`
              .tiptap > :first-child,
              .tiptap > :first-child > :first-child {
                  margin-top: 0;
              }

              .tiptap > :last-child,
              .tiptap > :last-child > :last-child {
                  margin-bottom: 0;
              }
          `
        : css`
              .tiptap {
                  min-height: ${ownerState.minHeight}px;
                  padding: 20px;
                  outline: none;
              }
          `,
);

declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminTipTapRichTextEditor: TipTapRichTextEditorProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminTipTapRichTextEditor: TipTapRichTextEditorClassKey;
    }

    interface Components {
        DextinityAdminTipTapRichTextEditor?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminTipTapRichTextEditor"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminTipTapRichTextEditor"];
        };
    }
}
