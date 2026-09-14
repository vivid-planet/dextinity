import { Button, FillSpace, Toolbar, ToolbarActions } from "@dextinity/admin";
import { type IRteRef, makeRteApi, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent } from "@mui/material";
import { useReducer, useRef } from "react";

import { exampleContent, PrintEditorState, useAutoFocus } from "./helper";

const [useRteApi] = makeRteApi();

export default {
    title: "@dextinity/admin-rte",
};

export const RteDisable = {
    render: () => {
        const { editorState, setEditorState } = useRteApi({ defaultValue: JSON.stringify(exampleContent) }); // defaultValue is optional
        const [disabled, toggleDisabled] = useReducer((s) => !s, false);

        // focus the editor to see the cursor immediately
        const editorRef = useRef<IRteRef>(undefined);
        useAutoFocus(editorRef);

        return (
            <>
                <Box marginBottom={4}>
                    <Toolbar>
                        <FillSpace />
                        <ToolbarActions>
                            <Button onClick={toggleDisabled}>{disabled ? "Enable" : "Disable"}</Button>
                        </ToolbarActions>
                    </Toolbar>
                </Box>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Rte value={editorState} onChange={setEditorState} ref={editorRef} disabled={disabled} />
                        </CardContent>
                    </Card>
                </Box>
                <PrintEditorState editorState={editorState} />
            </>
        );
    },

    name: "Rte, disable",
};
