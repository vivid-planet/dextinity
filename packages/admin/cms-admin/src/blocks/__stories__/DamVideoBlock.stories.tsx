import { Box } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, waitFor } from "storybook/test";

import { createDamVideoBlock, type DamVideoBlockState } from "../createDamVideoBlock";

function StatePreview({ state }: { state: DamVideoBlockState }) {
    return (
        <Box component="pre" data-testid="state" sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", fontSize: 12, overflow: "auto", borderRadius: 1 }}>
            {JSON.stringify(state, null, 2)}
        </Box>
    );
}

function StoryWrapper({ children, state }: { children: ReactNode; state: DamVideoBlockState }) {
    return (
        <>
            {children}
            <StatePreview state={state} />
        </>
    );
}

function readState(canvas: { getByTestId: (id: string) => HTMLElement }): DamVideoBlockState {
    return JSON.parse(canvas.getByTestId("state").textContent ?? "{}");
}

const DamVideoBlock = createDamVideoBlock();

function DamVideoBlockStory() {
    const [state, setState] = useState<DamVideoBlockState>(DamVideoBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <DamVideoBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

const config: Meta<typeof DamVideoBlockStory> = {
    component: DamVideoBlockStory,
    title: "blocks/DamVideoBlock",
};

export default config;

type Story = StoryObj<typeof config>;

export const Default: Story = {
    play: async ({ canvas, userEvent, step }) => {
        await step("All video options are offered", async () => {
            await waitFor(() => {
                expect(canvas.getByRole("switch", { name: "Autoplay" })).toBeInTheDocument();
            });

            expect(canvas.getByRole("switch", { name: "Loop" })).toBeInTheDocument();
            expect(canvas.getByRole("switch", { name: "Show controls" })).toBeInTheDocument();
        });

        await step("Switching off show controls enables autoplay, as a video needs at least one of them", async () => {
            await userEvent.click(canvas.getByRole("switch", { name: "Show controls" }));

            await waitFor(() => {
                expect(readState(canvas)).toMatchObject({ autoplay: true, showControls: false });
            });
        });
    },
};

const WithoutControlsBlock = createDamVideoBlock({ supports: ["previewImage"] });

function WithoutControlsStory() {
    const [state, setState] = useState<DamVideoBlockState>(WithoutControlsBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <WithoutControlsBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const WithoutControls: StoryObj<typeof WithoutControlsStory> = {
    render: () => <WithoutControlsStory />,
    play: async ({ canvas, step }) => {
        await step("No playback option is offered", async () => {
            await waitFor(() => {
                expect(canvas.getByRole("button", { name: "Choose image" })).toBeInTheDocument();
            });

            expect(canvas.queryAllByRole("switch")).toHaveLength(0);
        });

        await step("The preview image is still offered, it isn't a playback option", async () => {
            expect(canvas.getByRole("button", { name: "Choose image" })).toBeInTheDocument();
        });
    },
};

const FileOnlyBlock = createDamVideoBlock({ supports: [] });

function FileOnlyStory() {
    const [state, setState] = useState<DamVideoBlockState>(FileOnlyBlock.defaultValues());

    return (
        <StoryWrapper state={state}>
            <FileOnlyBlock.AdminComponent state={state} updateState={setState} />
        </StoryWrapper>
    );
}

export const FileOnly: StoryObj<typeof FileOnlyStory> = {
    render: () => <FileOnlyStory />,
    play: async ({ canvas, step }) => {
        await step("Only the video file can be chosen", async () => {
            await waitFor(() => {
                expect(canvas.getByRole("button", { name: "Choose file" })).toBeInTheDocument();
            });

            expect(canvas.queryAllByRole("switch")).toHaveLength(0);
            expect(canvas.queryByRole("button", { name: "Choose image" })).not.toBeInTheDocument();
        });

        await step("The preview image stays part of the data, it is only hidden from the editor", async () => {
            expect(readState(canvas).previewImage).toEqual(FileOnlyBlock.defaultValues().previewImage);
        });
    },
};
