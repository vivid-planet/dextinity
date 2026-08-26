import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor } from "storybook/test";

import type { TipTapRichTextBlockState } from "../createTipTapRichTextBlock";
import { createTipTapTableBlock } from "../createTipTapTableBlock";

function StatePreview({ state }: { state: TipTapRichTextBlockState }) {
    return (
        <Box component="pre" sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", fontSize: 12, overflow: "auto", borderRadius: 1 }}>
            {JSON.stringify(state, null, 2)}
        </Box>
    );
}

const TipTapTableBlock = createTipTapTableBlock();

const SmallTableBlock = createTipTapTableBlock({ defaultRows: 2, defaultColumns: 2, headerRow: false });

const SingleCellTableBlock = createTipTapTableBlock({ defaultRows: 1, defaultColumns: 1, headerRow: false });

function TipTapTableBlockStory({ block }: { block: ReturnType<typeof createTipTapTableBlock> }) {
    const [state, setState] = useState<TipTapRichTextBlockState>(block.defaultValues());
    const { AdminComponent } = block;

    return (
        <>
            <AdminComponent state={state} updateState={setState} />
            <StatePreview state={state} />
        </>
    );
}

const countRows = (table: HTMLElement) => table.querySelectorAll("tr").length;

const countColumns = (table: HTMLElement) => table.querySelector("tr")?.querySelectorAll("td, th").length ?? 0;

const openTableMenu = async (trigger: HTMLElement) => {
    await userEvent.click(trigger);
    await waitFor(() => {
        expect(document.body.querySelector('[role="menu"]')).toBeInTheDocument();
    });
};

const getMenuItem = (label: string) => {
    const menu = document.body.querySelector('[role="menu"]') as HTMLElement;
    return Array.from(menu.querySelectorAll('[role="menuitem"]')).find((element) => element.textContent === label) as HTMLElement;
};

const clickMenuItem = async (label: string) => {
    await userEvent.click(getMenuItem(label));
    await waitFor(() => {
        expect(document.body.querySelector('[role="menu"]')).not.toBeInTheDocument();
    });
};

const config: Meta<typeof TipTapTableBlockStory> = {
    component: TipTapTableBlockStory,
    title: "blocks/TipTapTableBlock",
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    render: () => <TipTapTableBlockStory block={TipTapTableBlock} />,
    play: async ({ canvas, step }) => {
        await step("Editor starts with a 3x3 table that has a header row", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("table")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            expect(countRows(canvas.getByRole("table"))).toBe(3);
            expect(canvas.getAllByRole("columnheader")).toHaveLength(3);
        });

        await step("Table toolbar button is available", async () => {
            expect(canvas.getByLabelText("Table")).toBeInTheDocument();
        });
    },
};

export const WithoutHeaderRow: Story = {
    render: () => <TipTapTableBlockStory block={SmallTableBlock} />,
    play: async ({ canvas, step }) => {
        await step("Editor starts with a 2x2 table without a header row", async () => {
            await waitFor(
                () => {
                    expect(canvas.getByRole("table")).toBeInTheDocument();
                },
                { timeout: 5000 },
            );

            expect(countRows(canvas.getByRole("table"))).toBe(2);
            expect(canvas.queryAllByRole("columnheader")).toHaveLength(0);
            expect(canvas.getAllByRole("cell")).toHaveLength(4);
        });
    },
};

export const AddAndRemoveRowsAndColumns: Story = {
    render: () => <TipTapTableBlockStory block={SmallTableBlock} />,
    play: async ({ canvas, step }) => {
        await waitFor(
            () => {
                expect(canvas.getByRole("table")).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        const trigger = canvas.getByLabelText("Table");

        await step("Insert row below adds a row", async () => {
            await openTableMenu(trigger);
            await clickMenuItem("Insert row below");
            await waitFor(() => {
                expect(countRows(canvas.getByRole("table"))).toBe(3);
            });
        });

        await step("Delete row removes the row the caret is in", async () => {
            await openTableMenu(trigger);
            await clickMenuItem("Delete row");
            await waitFor(() => {
                expect(countRows(canvas.getByRole("table"))).toBe(2);
            });
        });

        await step("Insert column right adds a column", async () => {
            await openTableMenu(trigger);
            await clickMenuItem("Insert column right");
            await waitFor(() => {
                expect(countColumns(canvas.getByRole("table"))).toBe(3);
            });
        });

        await step("Delete column removes the column the caret is in", async () => {
            await openTableMenu(trigger);
            await clickMenuItem("Delete column");
            await waitFor(() => {
                expect(countColumns(canvas.getByRole("table"))).toBe(2);
            });
        });
    },
};

export const TableCannotBeDeleted: Story = {
    render: () => <TipTapTableBlockStory block={SingleCellTableBlock} />,
    play: async ({ canvas, step }) => {
        await waitFor(
            () => {
                expect(canvas.getByRole("table")).toBeInTheDocument();
            },
            { timeout: 5000 },
        );

        await step("Selecting everything and deleting keeps the table", async () => {
            await userEvent.click(canvas.getByRole("textbox"));
            await userEvent.keyboard("{Control>}a{/Control}");
            await userEvent.keyboard("{Delete}");

            expect(canvas.getByRole("table")).toBeInTheDocument();
            expect(countRows(canvas.getByRole("table"))).toBe(1);
            expect(countColumns(canvas.getByRole("table"))).toBe(1);
        });

        await step("Deleting the last row or column is not offered", async () => {
            await openTableMenu(canvas.getByLabelText("Table"));

            expect(getMenuItem("Delete row")).toHaveAttribute("aria-disabled", "true");
            expect(getMenuItem("Delete column")).toHaveAttribute("aria-disabled", "true");
        });
    },
};
