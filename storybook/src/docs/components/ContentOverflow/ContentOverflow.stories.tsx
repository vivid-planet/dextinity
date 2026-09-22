import { ContentOverflow, type GridColDef } from "@dextinity/admin";
import { Box, Link, Paper, Typography, type TypographyProps } from "@mui/material";
import {} from "@mui/system";
import { DataGrid } from "@mui/x-data-grid";

export default {
    title: "Docs/Components/ContentOverflow",
};

export const BasicUsage = {
    render: () => {
        const DummyParagraph = (p: TypographyProps) => (
            <Typography variant="body2" {...p}>
                Curabitur blandit tempus porttitor. Nullam id dolor{" "}
                <Link href="#" target="_blank">
                    this is a link
                </Link>{" "}
                id nibh ultricies vehicula ut id elit. Cras mattis consectetur purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo,
                tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus.
            </Typography>
        );

        const DummyImage = () => (
            <Box
                sx={({ palette }) => ({
                    aspectRatio: "21 / 9",
                    backgroundColor: palette.grey[100],
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 4,
                })}
            >
                <Typography variant="h2">This could be an image.</Typography>
            </Box>
        );

        return (
            <Paper elevation={1} sx={{ p: 2, height: 110 }}>
                <ContentOverflow>
                    <Typography variant="h4" fontWeight={600} gutterBottom>
                        Ornare Inceptos Egestas Bibendum
                    </Typography>
                    <DummyParagraph gutterBottom />
                    <DummyImage />
                    <DummyParagraph gutterBottom />
                    <DummyParagraph gutterBottom />
                    <DummyImage />
                    <DummyParagraph gutterBottom />
                    <DummyParagraph />
                </ContentOverflow>
            </Paper>
        );
    },
    name: "Basic usage",
};

export const InDataGrid = {
    render: () => {
        const gridRows = Array.from({ length: 4 }).map((_, index) => ({
            id: index + 1,
            firstName: "Lorem",
            lastName: "Ipsum",
        }));

        const gridColumns: GridColDef[] = [
            {
                field: "firstName",
                headerName: "First name",
                width: 150,
                renderCell: ({ row }) => <Typography>{row.firstName}</Typography>,
            },
            {
                field: "lastName",
                headerName: "Last name",
                width: 150,
                renderCell: ({ row }) => <Typography>{row.lastName}</Typography>,
            },
            {
                field: "lotsOfText",
                headerName: "Lots of text",
                flex: 1,
                renderCell: () => {
                    const paragraphsCount = 10;
                    return (
                        <ContentOverflow>
                            <Typography fontWeight={600} gutterBottom>
                                Ornare Inceptos Egestas Bibendum
                            </Typography>
                            {Array.from({ length: paragraphsCount }).map((_, index) => (
                                <Typography key={index} variant="body2" gutterBottom={index !== paragraphsCount - 1}>
                                    Curabitur blandit tempus porttitor. Nullam id dolor id nibh ultricies vehicula ut id elit. Cras mattis consectetur
                                    purus sit amet fermentum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum
                                    massa justo sit amet risus.
                                </Typography>
                            ))}
                        </ContentOverflow>
                    );
                },
            },
        ];

        return <DataGrid autoHeight rows={gridRows} columns={gridColumns} getRowHeight={() => 100} />;
    },
    name: "In DataGrid",
};
