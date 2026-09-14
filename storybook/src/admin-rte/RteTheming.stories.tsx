import { makeRteApi, Rte } from "@dextinity/admin-rte";
import { Box, Card, CardContent } from "@mui/material";

const [useRteApi] = makeRteApi();

export default {
    title: "@dextinity/admin-rte",
    args: {
        minHeight: 0,
    },
    argTypes: {
        minHeight: {
            name: "Min Height",
            control: "select",
            options: [0, 100, 200, 300, 1000],
        },
    },
};

type Args = {
    minHeight: number;
};

export const RteMinHeight = {
    render: ({ minHeight }: Args) => {
        const { editorState, setEditorState } = useRteApi();

        return (
            <Box marginBottom={4}>
                <Card variant="outlined">
                    <CardContent>
                        <Rte value={editorState} onChange={setEditorState} minHeight={minHeight} />
                    </CardContent>
                </Card>
            </Box>
        );
    },

    name: "Rte, minHeight",
};
