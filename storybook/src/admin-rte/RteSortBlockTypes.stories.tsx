import { type IRteOptions, makeRteApi, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent } from "@mui/material";

const rteOptions: IRteOptions = {
    blocktypeMap: {
        "header-two": {}, // change the order of block-types
        unstyled: {},
        "header-three": {},
    },
};

const [useRteApi] = makeRteApi();

export default {
    title: "@dextinity/admin-rte",
};

export const RteSortBlockTypes = {
    render: () => {
        const { editorState, setEditorState } = useRteApi();

        return (
            <Box marginBottom={4}>
                <Card variant="outlined">
                    <CardContent>
                        <Rte value={editorState} onChange={setEditorState} options={rteOptions} />
                    </CardContent>
                </Card>
            </Box>
        );
    },

    name: "Rte, sort block types",
};
