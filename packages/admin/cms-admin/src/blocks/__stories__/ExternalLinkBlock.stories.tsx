import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, waitFor } from "storybook/test";

import { createExternalLinkBlock, type ExternalLinkBlockState } from "../createExternalLinkBlock";

function StatePreview({ state }: { state: ExternalLinkBlockState }) {
    return (
        <Box component="pre" data-testid="state" sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", fontSize: 12, overflow: "auto", borderRadius: 1 }}>
            {JSON.stringify(state, null, 2)}
        </Box>
    );
}

function StoryWrapper({ children, state }: { children: ReactNode; state: ExternalLinkBlockState }) {
    return (
        <>
            {children}
            <StatePreview state={state} />
        </>
    );
}

function readState(canvas: { getByTestId: (id: string) => HTMLElement }): ExternalLinkBlockState {
    return JSON.parse(canvas.getByTestId("state").textContent ?? "{}");
}

const ExternalLinkBlock = createExternalLinkBlock();

function ExternalLinkBlockStory() {
    const [state, setState] = useState<ExternalLinkBlockState>(ExternalLinkBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <ExternalLinkBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

const config: Meta<typeof ExternalLinkBlockStory> = {
    component: ExternalLinkBlockStory,
    title: "blocks/ExternalLinkBlock",
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    play: async ({ canvas, userEvent, step }) => {
        await step("Both link options are offered", async () => {
            await waitFor(() => {
                expect(canvas.getByRole("checkbox", { name: "Open in new window" })).toBeInTheDocument();
            });

            expect(canvas.getByRole("checkbox", { name: "No follow" })).toBeInTheDocument();
        });

        await step("Checking an option writes it to the state", async () => {
            await userEvent.click(canvas.getByRole("checkbox", { name: "Open in new window" }));

            await waitFor(() => {
                expect(readState(canvas)).toMatchObject({ openInNewWindow: true });
            });
        });
    },
};

const WithoutOptionsBlock = createExternalLinkBlock({ supports: [] });

function WithoutOptionsStory() {
    const [state, setState] = useState<ExternalLinkBlockState>(WithoutOptionsBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <WithoutOptionsBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const WithoutOptions: StoryObj<typeof WithoutOptionsStory> = {
    render: () => <WithoutOptionsStory />,
    play: async ({ canvas, step }) => {
        await step("Only the URL can be entered", async () => {
            await waitFor(() => {
                expect(canvas.getByRole("textbox")).toBeInTheDocument();
            });

            expect(canvas.queryAllByRole("checkbox")).toHaveLength(0);
        });

        await step("Both options stay part of the data, they are only hidden from the editor", async () => {
            expect(readState(canvas)).toMatchObject({ openInNewWindow: false, noFollow: false });
        });
    },
};
