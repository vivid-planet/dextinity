import "draft-js/dist/Draft.css"; // important for nesting of ul/ol

import { createComponentSlot, type ThemedComponentBaseProps } from "@dextinity/admin";
import { type ComponentsOverrides, css, type Theme, useThemeProps } from "@mui/material";
import {
    type DraftBlockType,
    type DraftEditorCommand,
    type DraftHandleValue,
    type DraftStyleMap,
    Editor as DraftJsEditor,
    type EditorProps as DraftJsEditorProps,
    type EditorState,
    getDefaultKeyBinding,
    RichUtils,
} from "draft-js";
import { onDraftEditorCopy, onDraftEditorCut } from "draftjs-conductor";
import {
    type ClipboardEvent,
    forwardRef,
    type ForwardRefExoticComponent,
    type KeyboardEvent,
    type PropsWithoutRef,
    type RefAttributes,
    useCallback,
    useImperativeHandle,
    useRef,
} from "react";

import Controls from "./Controls/Controls";
import defaultBlocktypeMap, { cleanBlockTypeMap, mergeBlocktypeMaps } from "./defaultBlocktypeMap";
import composeFilterEditorFns from "./filterEditor/composeFilterEditorFns";
import defaultFilterEditorStateBeforeUpdate from "./filterEditor/default";
import manageDefaultBlockType from "./filterEditor/manageStandardBlockType";
import removeBlocksExceedingBlockLimit from "./filterEditor/removeBlocksExceedingBlockLimit";
import type { CustomInlineStyles, IBlocktypeMap, ICustomBlockTypeMap_Deprecated, ToolbarButtonComponent } from "./types";
import createBlockRenderMap from "./utils/createBlockRenderMap";
import getRteTheme, { type RteThemeColors } from "./utils/getRteTheme";
import { pasteAndFilterText } from "./utils/pasteAndFilterText";

const mandatoryFilterEditorStateFn = composeFilterEditorFns([removeBlocksExceedingBlockLimit, manageDefaultBlockType]);

export type SupportedThings =
    | "bold"
    | "italic"
    | "underline"
    | "strikethrough"
    | "sub"
    | "sup"
    | "header-one"
    | "header-two"
    | "header-three"
    | "header-four"
    | "header-five"
    | "header-six"
    | "ordered-list"
    | "unordered-list"
    | "blockquote"
    | "history"
    | "link"
    | "links-remove"
    | "non-breaking-space"
    | "soft-hyphen";

export interface IRteOptions {
    supports: SupportedThings[];
    listLevelMax: number;
    blocktypeMap: IBlocktypeMap;
    overwriteLinkButton?: ToolbarButtonComponent;
    overwriteLinksRemoveButton?: ToolbarButtonComponent;
    customToolbarButtons?: ToolbarButtonComponent[];
    draftJsProps: Partial<
        Pick<
            DraftJsEditorProps,
            | "placeholder"
            | "autoComplete"
            | "autoCorrect"
            | "readOnly"
            | "spellCheck"
            | "stripPastedStyles"
            | "tabIndex"
            | "editorKey"
            | "handlePastedText"
        >
    >;
    filterEditorStateBeforeUpdate?: FilterEditorStateBeforeUpdateFn;
    maxBlocks?: number;
    standardBlockType: DraftBlockType;
    /**
     * @deprecated use `blocktypeMap` instead
     */
    customBlockMap?: ICustomBlockTypeMap_Deprecated;
    customInlineStyles?: CustomInlineStyles;
    disableContentTranslation?: boolean;
}

export type IOptions = Partial<IRteOptions>;

type OnEditorStateChangeFn = (newValue: EditorState) => void;

export type FilterEditorStateBeforeUpdateFn = (
    newState: EditorState,
    context: Pick<IRteOptions, "supports" | "listLevelMax" | "maxBlocks" | "standardBlockType">,
) => EditorState;

export interface RteProps extends ThemedComponentBaseProps<{
    root: "div";
    editor: "div";
}> {
    value: EditorState;
    onChange: OnEditorStateChangeFn;
    options?: IOptions;
    disabled?: boolean;
    minHeight?: number;
    colors?: Partial<RteThemeColors>;
}

export const defaultOptions: IRteOptions = {
    supports: [
        "bold",
        "italic",
        "sub",
        "sup",
        "header-one",
        "header-two",
        "header-three",
        "ordered-list",
        "unordered-list",
        "history",
        "link",
        "links-remove",
    ],
    listLevelMax: 4,
    customToolbarButtons: [],
    draftJsProps: {},
    filterEditorStateBeforeUpdate: defaultFilterEditorStateBeforeUpdate,
    maxBlocks: undefined,
    // standardBlockType can be set to any supported block-type,
    // when set to something other than "unstyled" the unstyled-blockType is disabled (does not show up in the Dropdown)
    standardBlockType: "unstyled",
    blocktypeMap: defaultBlocktypeMap,
};

export interface IRteRef {
    focus: () => void;
}

export const styleMap = {
    SUP: {
        verticalAlign: "super",
        fontSize: "smaller",
    },
    SUB: {
        verticalAlign: "sub",
        fontSize: "smaller",
    },
};

export const Rte: ForwardRefExoticComponent<PropsWithoutRef<RteProps> & RefAttributes<unknown>> = forwardRef((inProps: RteProps, ref) => {
    const {
        value: editorState,
        onChange,
        options: passedOptions,
        disabled,
        minHeight,
        colors,
        slotProps,
        ...restProps
    } = useThemeProps({
        props: inProps,
        name: "DextinityAdminRte",
    });

    const ownerState: OwnerState = {
        disabled,
        minHeight,
    };

    const editorRef = useRef<DraftJsEditor>(null);
    const editorWrapperRef = useRef<HTMLDivElement>(null);

    // merge default options with passed options
    let options = passedOptions ? { ...defaultOptions, ...passedOptions } : defaultOptions;

    // extract deprecated options and handle them specially
    let deprecatedCustomBlockMap: ICustomBlockTypeMap_Deprecated = {};
    if (options.customBlockMap) {
        deprecatedCustomBlockMap = options.customBlockMap;
        delete options.customBlockMap;
    }

    cleanBlockTypeMap(options.blocktypeMap); // mutate object and print warning when configuration is wrong

    // blocktypes need an extra merge as they have their own merge strategy
    options = {
        ...options,
        blocktypeMap: mergeBlocktypeMaps(defaultBlocktypeMap, deprecatedCustomBlockMap, options.blocktypeMap),
    };

    // force draftjs to be readonly when rte is disabled
    if (disabled) {
        options.draftJsProps = { ...options.draftJsProps, readOnly: true };
    }

    /**
     * Expose methods
     */
    useImperativeHandle(ref, () => ({
        focus: () => {
            if (editorRef && editorRef.current) {
                editorRef.current.focus();
            }
        },
    }));

    const { filterEditorStateBeforeUpdate, supports, listLevelMax, maxBlocks, standardBlockType } = options;

    const decoratedOnChange = useCallback(
        (nextEditorState: EditorState) => {
            let modifiedState = nextEditorState;
            const context = {
                supports: supports,
                listLevelMax: listLevelMax,
                maxBlocks: maxBlocks,
                standardBlockType: standardBlockType,
            };
            // apply optional filter to editorState
            if (filterEditorStateBeforeUpdate) {
                modifiedState = filterEditorStateBeforeUpdate(modifiedState, context);
            }
            // apply mandatory filter to editorState
            modifiedState = mandatoryFilterEditorStateFn(modifiedState, context);

            // pass the modified filter to original onChange
            onChange(modifiedState);
        },
        [filterEditorStateBeforeUpdate, supports, listLevelMax, maxBlocks, standardBlockType, onChange],
    );

    const blockRenderMap = createBlockRenderMap({ blocktypeMap: options.blocktypeMap });

    function handleKeyCommand(command: DraftEditorCommand) {
        const commandToSupportsMap: Partial<Record<DraftEditorCommand, SupportedThings>> = {
            bold: "bold",
            italic: "italic",
            strikethrough: "strikethrough",
            underline: "underline",
        };

        const relevantSupports = commandToSupportsMap[command];
        if (relevantSupports && options.supports.includes(relevantSupports)) {
            const newState = RichUtils.handleKeyCommand(editorState, command);

            if (newState) {
                onChange(newState);
                return "handled";
            }
        }

        // disallow user to add a new block when block limit is already reached
        if (command === "split-block" && options.maxBlocks) {
            const content = editorState.getCurrentContent();
            const blockSize = content.getBlockMap().count();

            const userTriesToAddTooMuchBlocks = blockSize >= options.maxBlocks;
            if (userTriesToAddTooMuchBlocks) {
                return "handled"; // do nothing
            }
        }
        return "not-handled";
    }

    function handleReturn(e: KeyboardEvent, innerEditorState: EditorState) {
        // inserts a newline "\n" on SHIFT+ENTER-key
        if (e.shiftKey) {
            onChange(RichUtils.insertSoftNewline(innerEditorState));
            return "handled";
        }
        return "not-handled";
    }

    function keyBindingFn(event: KeyboardEvent) {
        if (event.key === "Tab") {
            // nested lists for ol and ul
            event.preventDefault();
            const newEditorState = RichUtils.onTab(event, editorState, options.listLevelMax);
            if (newEditorState !== editorState) {
                onChange(newEditorState);
            }
        }

        return getDefaultKeyBinding(event);
    }

    const customStyleMap: DraftStyleMap = { ...styleMap };

    if (options.customInlineStyles) {
        Object.entries(options.customInlineStyles).forEach(([name, { style }]) => {
            customStyleMap[name] = style;
        });
    }

    return (
        <Root ref={editorWrapperRef} ownerState={ownerState} {...slotProps?.root} {...restProps}>
            <Controls editorRef={editorRef} editorState={editorState} setEditorState={onChange} options={options} disabled={disabled} />
            <Editor ownerState={ownerState} {...slotProps?.editor}>
                <DraftJsEditor
                    ref={editorRef}
                    editorState={editorState}
                    onChange={decoratedOnChange}
                    handleKeyCommand={handleKeyCommand}
                    handleReturn={handleReturn}
                    keyBindingFn={keyBindingFn}
                    customStyleMap={customStyleMap}
                    blockRenderMap={blockRenderMap}
                    onCopy={(editor, event) => {
                        onDraftEditorCopy(editor, event as ClipboardEvent<HTMLElement>);
                    }}
                    onCut={(editor, event) => {
                        onDraftEditorCut(editor, event as ClipboardEvent<HTMLElement>);
                    }}
                    handlePastedText={(text: string, html: string | undefined, editorState: EditorState): DraftHandleValue => {
                        const nextEditorState = pasteAndFilterText(html, editorState, options);

                        if (nextEditorState) {
                            decoratedOnChange(nextEditorState);
                            return "handled";
                        }

                        return "not-handled";
                    }}
                    {...options.draftJsProps}
                />
            </Editor>
        </Root>
    );
});

export type RteClassKey = "root" | "disabled" | "editor";

type OwnerState = Pick<RteProps, "disabled" | "minHeight">;

const Root = createComponentSlot("div")<RteClassKey, OwnerState>({
    componentName: "Rte",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.disabled && "disabled"];
    },
})(
    ({ theme }) => css`
        --dextinity-admin-rte-outer-border-color: ${getRteTheme(theme.components?.DextinityAdminRte?.defaultProps).colors.border};
        border: 1px solid var(--dextinity-admin-rte-outer-border-color);
        border-top-width: 0; // To prevent the top border from being hidden, when to toolbar is sticky, the top border must be handled by the Toolbar itself
        background-color: #fff;
        border-radius: 2px;

        &:hover {
            --dextinity-admin-rte-outer-border-color: ${getRteTheme(theme.components?.DextinityAdminRte?.defaultProps).colors.outerBorderOnHover};
        }

        &:focus-within {
            --dextinity-admin-rte-outer-border-color: ${getRteTheme(theme.components?.DextinityAdminRte?.defaultProps).colors.outerBorderOnFocus};
        }
    `,
);

const Editor = createComponentSlot("div")<RteClassKey, OwnerState>({
    componentName: "Rte",
    slotName: "editor",
    classesResolver(ownerState) {
        return [ownerState.disabled && "disabled"];
    },
})(
    ({ ownerState, theme }) => css`
        & .public-DraftEditor-content {
            min-height: 240px;

            ${
                ownerState.minHeight !== undefined &&
                css`
                    min-height: ${`${ownerState.minHeight}px`};
                `
            }

            padding: 20px;
            box-sizing: border-box;
        }

        ${
            ownerState.disabled &&
            css`
                color: ${theme.palette.text.disabled};
            `
        }
    `,
);

declare module "@mui/material/styles" {
    interface ComponentNameToClassKey {
        DextinityAdminRte: RteClassKey;
    }

    interface ComponentsPropsList {
        DextinityAdminRte: RteProps;
    }

    interface Components {
        DextinityAdminRte?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminRte"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminRte"];
        };
    }
}
