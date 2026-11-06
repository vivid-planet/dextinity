import type { Meta, StoryObj } from "@storybook/react-vite";
import { type KeyboardEvent, useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import quickLookTokens from "../_tokens.scss?raw";
import { QuickLook, type QuickLookItem, type QuickLookProps } from "../QuickLook";
import styles from "./QuickLook.stories.module.scss";

function placeholderImage(hue: number, label: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="oklch(0.78 0.12 ${hue})"/><stop offset="1" stop-color="oklch(0.45 0.14 ${hue + 40})"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="600" y="420" font-family="sans-serif" font-size="64" fill="white" text-anchor="middle">${label}</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const items: QuickLookItem[] = [
    { src: placeholderImage(250, "team.jpg"), title: "team.jpg", description: "JPG · 2.4 MB · 2400 × 1600" },
    { src: placeholderImage(160, "office.jpg"), title: "office.jpg", description: "JPG · 1.8 MB · 2400 × 1600" },
    { src: placeholderImage(40, "event.png"), title: "event.png", description: "PNG · 3.1 MB · 2400 × 1600" },
];

function Finder(props: QuickLookProps) {
    const [open, setOpen] = useState(props.open);
    const [index, setIndex] = useState(props.index);
    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        props.onOpenChange(nextOpen);
    };
    const handleTileKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === " ") {
            event.preventDefault();
            handleOpenChange(true);
        }
    };
    return (
        <>
            <div className={styles.grid}>
                {props.items.map((item, itemIndex) => (
                    <button
                        key={item.title}
                        type="button"
                        className={styles.tile}
                        aria-pressed={itemIndex === index}
                        onClick={() => setIndex(itemIndex)}
                        onDoubleClick={() => handleOpenChange(true)}
                        onFocus={() => setIndex(itemIndex)}
                        onKeyDown={handleTileKeyDown}
                    >
                        <img src={item.src} alt="" />
                        {item.title}
                    </button>
                ))}
            </div>
            <QuickLook
                {...props}
                open={open}
                onOpenChange={handleOpenChange}
                index={index}
                onIndexChange={(nextIndex) => {
                    setIndex(nextIndex);
                    props.onIndexChange(nextIndex);
                }}
            />
        </>
    );
}

const meta = {
    component: QuickLook,
    title: "Building blocks/Modals & overlays/QuickLook",
    decorators: [themeDecorator],
    parameters: { tokens: quickLookTokens },
    render: (args) => <Finder key={`${args.open}-${args.index}`} {...args} />,
    args: {
        open: false,
        onOpenChange: fn(),
        items,
        index: 0,
        onIndexChange: fn(),
    },
    argTypes: {
        index: { control: { type: "number", min: 0, max: items.length - 1 } },
        items: { control: false },
        actions: { control: false },
        renderPreview: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof QuickLook>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Space on the selected file opens quick look, as in the finder; the arrow keys step through the files, Space or Escape
 * close it and focus returns to the file.
 *
 * **Rules**
 *
 * - Open it with Space, close it with Space or Escape.
 * - The arrow keys step through the same files as the list behind it.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const tile = canvas.getByRole("button", { name: "team.jpg" });
        tile.focus();
        await userEvent.keyboard(" ");
        await screen.findByRole("dialog", { name: "team.jpg" });
        await userEvent.keyboard("{ArrowRight}");
        await waitFor(() => expect(args.onIndexChange).toHaveBeenLastCalledWith(1));
        await expect(await screen.findByRole("dialog", { name: "office.jpg" })).toBeInTheDocument();
        await userEvent.keyboard("{ArrowLeft}");
        await waitFor(() => expect(args.onIndexChange).toHaveBeenLastCalledWith(0));
        await userEvent.keyboard(" ");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    },
};

export const Open: Story = {
    args: { open: true, index: 1 },
};

/**
 * `actions` for the shown file, e.g. editing it.
 */
export const WithActions: Story = {
    args: {
        open: true,
        actions: (
            <>
                <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="download" />}>
                    Download
                </Button>
                <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="edit" />}>
                    Edit
                </Button>
            </>
        ),
    },
};

/**
 * The buttons step too; they are disabled at the first and the last file.
 */
export const Buttons: Story = {
    args: { open: true, index: 2 },
    play: async ({ args }) => {
        await expect(await screen.findByRole("button", { name: "Next" })).toBeDisabled();
        await userEvent.click(screen.getByRole("button", { name: "Previous" }));
        await waitFor(() => expect(args.onIndexChange).toHaveBeenLastCalledWith(1));
    },
};
