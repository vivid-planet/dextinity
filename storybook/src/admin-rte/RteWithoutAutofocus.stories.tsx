import { IRteOptions, makeRteApi, Rte } from "@comet/admin-rte";
import { Box, Card, CardContent } from "@mui/material";
import { ReactNode } from "react";

import { PrintEditorState } from "./helper";

const GreenCustomHeader = ({ children }: { children?: ReactNode }) => <h2 style={{ color: "green" }}>{children}</h2>;

const rteOptions: IRteOptions = {
    supports: [
        "bold",
        "italic",
        "underline",
        "strikethrough",
        "sub",
        "sup",
        "header-one",
        "header-two",
        "header-three",
        "header-four",
        "header-five",
        "header-six",
    ],
    listLevelMax: 2,
    blocktypeMap: {
        "header-custom-green": {
            label: "Custom Green Header",
            renderConfig: {
                element: (p) => <GreenCustomHeader {...p} />,
                aliasedElements: ["h2"],
            },
        },
    },
    standardBlockType: "header-custom-green",
};

const [useRteApi] = makeRteApi();

export default {
    title: "@comet/admin-rte",
};

export const RteWithoutAutofocus = {
    render: () => {
        const { editorState, setEditorState } = useRteApi();

        return (
            <>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Rte value={editorState} onChange={setEditorState} options={rteOptions} />
                        </CardContent>
                    </Card>
                </Box>
                <PrintEditorState editorState={editorState} />
            </>
        );
    },

    name: "Rte without autofocus",
};
