import { type IRteReadOnlyOptions, makeRteApi, RteReadOnly } from "@dextinity/admin-rte";
import { Box, Card, CardContent } from "@mui/material";
import type { ReactNode } from "react";

import { exampleContent, PrintEditorState } from "./helper";

const [useRteApi] = makeRteApi();

const GreenCustomHeader = ({ children }: { children?: ReactNode }) => <span style={{ color: "green" }}>{children}</span>;

const rteOptions: IRteReadOnlyOptions = {
    blocktypeMap: {
        "header-custom-green": {
            label: "Custom Green Header",
            renderConfig: {
                element: "h1",
                wrapper: <GreenCustomHeader />,
            },
        },
    },
};

export default {
    title: "@dextinity/admin-rte",
};

export const RteReadonly = {
    render: () => {
        const { editorState } = useRteApi({ defaultValue: JSON.stringify(exampleContent) }); // defaultValue is optional

        return (
            <>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <RteReadOnly value={editorState} options={rteOptions} />
                        </CardContent>
                    </Card>
                </Box>
                <PrintEditorState editorState={editorState} />
            </>
        );
    },

    name: "Rte readonly",
};
