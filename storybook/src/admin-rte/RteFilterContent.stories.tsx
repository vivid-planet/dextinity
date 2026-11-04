import {
    type FilterEditorStateBeforeUpdateFn,
    filterEditorStateDefault,
    filterEditorUtilsManipulateEntityData,
    type IRteRef,
    makeRteApi,
    Rte,
} from "@dextinity/admin-rte";
import { Box, Card, CardContent, Typography } from "@mui/material";
import type { EditorState, EntityInstance } from "draft-js";
import { useRef } from "react";

import { PrintEditorState, useAutoFocus } from "./helper";

const [useRteApi] = makeRteApi();

const filterEditorStateBeforeUpdate: FilterEditorStateBeforeUpdateFn = (nextState: EditorState, ctx) => {
    const shouldFilter = nextState.getLastChangeType() === "insert-fragment";

    // this fn will strip out all attributes from link data and add 2 new attributes
    const changeLinkData = filterEditorUtilsManipulateEntityData((entity: EntityInstance) => {
        const data = entity.getData();
        const isLink = "LINK" === entity.getType();
        if (isLink && !data.linkType && data.url) {
            return { linkType: "external", targetUrl: data.url };
        }
        return undefined;
    });
    if (shouldFilter) {
        return changeLinkData(filterEditorStateDefault(nextState, ctx)); // apply default filter and then manipulate data in LINKS
    }
    return filterEditorStateDefault(nextState, ctx);
};

export default {
    title: "@dextinity/admin-rte",
};

export const RteFilterContent = {
    render: () => {
        const { editorState, setEditorState } = useRteApi();

        // focus the editor to see the cursor immediately
        const editorRef = useRef<IRteRef>(undefined);
        useAutoFocus(editorRef);

        return (
            <>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography gutterBottom>
                                <a href="https://google.com">Copy and paste this link into the editor</a>, and see in the editor-state that the
                                link-data has changed.
                            </Typography>
                            <Rte value={editorState} onChange={setEditorState} ref={editorRef} options={{ filterEditorStateBeforeUpdate }} />
                        </CardContent>
                    </Card>
                </Box>
                <PrintEditorState editorState={editorState} />
            </>
        );
    },

    name: "Rte, filter content",
};
