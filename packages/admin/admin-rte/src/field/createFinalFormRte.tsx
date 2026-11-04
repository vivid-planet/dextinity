import type { EditorState } from "draft-js";
import { type FunctionComponent, useRef } from "react";
import type { FieldRenderProps } from "react-final-form";

import makeRteApi, { type IMakeRteApiProps, type OnDebouncedContentChangeFn } from "../core/makeRteApi";
import { type IOptions as RteOptions, Rte, type RteProps } from "../core/Rte";
import RteReadOnlyBase from "../core/RteReadOnly";

export interface IConfig<T = any> {
    rteApiOptions?: IMakeRteApiProps<T>;
    rteOptions?: RteOptions;
}

const defaultConfig: IConfig = {};

/**
 * Used to create a Final Form-compatible RTE component.
 *
 * @see {@link createRteField} – preferred for typical form use. Use this only if no Field wrapper is needed.
 */
function createFinalFormRte<T = any>(config: IConfig<T> = defaultConfig) {
    const { rteApiOptions, rteOptions } = config;
    const [useRteApi, { createStateFromRawContent }] = makeRteApi(rteApiOptions);

    const RteField: FunctionComponent<FieldRenderProps<T, HTMLInputElement> & Pick<RteProps, "options">> = ({
        input: { value, onChange, ...restInput },
        meta,
        value: remove,
        ...rest
    }) => {
        const ref = useRef<any>(undefined);

        const onDebouncedContentChange: OnDebouncedContentChangeFn<T> = (debouncedEditorState: EditorState, convertStateToRawContent) => {
            onChange(convertStateToRawContent(debouncedEditorState));
        };

        const { editorState, setEditorState } = useRteApi({
            defaultValue: value,
            onDebouncedContentChange,
        });

        return (
            <Rte
                ref={ref}
                value={editorState}
                onChange={(c: EditorState) => {
                    setEditorState(c);
                }}
                options={rteOptions}
                {...rest}
                {...restInput}
            />
        );
    };

    const RteReadOnly: FunctionComponent<{ content?: T; plainTextOnly?: boolean }> = ({ content, plainTextOnly }) => {
        if (!content) {
            return null;
        }
        return (
            <RteReadOnlyBase
                value={createStateFromRawContent(content)}
                plainTextOnly={plainTextOnly}
                options={{
                    blocktypeMap: rteOptions ? rteOptions.blocktypeMap : undefined,
                    customBlockMap: rteOptions ? rteOptions.customBlockMap : undefined,
                }}
            />
        );
    };

    return { RteField, RteReadOnly };
}

export default createFinalFormRte;
