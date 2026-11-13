import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Field } from "../../field/Field";
import { Icon } from "../../icon/Icon";
import { Input } from "../../input/Input";
import { Drawer, type DrawerProps } from "../Drawer";
import drawerTokens from "../Drawer.tokens.scss?raw";
import styles from "./Drawer.stories.module.scss";

const redirects = ["/alt-1", "/alt-2", "/alt-3", "/alt-4"];

function RedirectForm({ source }: { source: string }) {
    const [value, setValue] = useState(source);
    const [target, setTarget] = useState("/careers");
    return (
        <>
            <Field label="Source">
                <Input name="source" value={value} onChange={(event) => setValue(event.target.value)} />
            </Field>
            <Field label="Target">
                <Input name="target" value={target} onChange={(event) => setTarget(event.target.value)} />
            </Field>
        </>
    );
}

function RedirectList(props: DrawerProps) {
    const [selected, setSelected] = useState<string | null>(props.open ? redirects[1] : null);
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setSelected(null);
        }
        props.onOpenChange(nextOpen);
    };
    return (
        <>
            <ul className={styles.list}>
                {redirects.map((source, index) => (
                    <li key={source}>
                        <button
                            type="button"
                            className={styles.row}
                            aria-current={selected === source}
                            onClick={() => {
                                setSelected(source);
                                props.onOpenChange(true);
                            }}
                        >
                            <span className={styles.source}>{source}</span>
                            <Icon name="arrow-right" size="small" className={styles.arrow} />
                            Page {index + 1}
                        </button>
                    </li>
                ))}
            </ul>
            <Drawer {...props} open={selected != null} onOpenChange={handleOpenChange}>
                {selected != null && <RedirectForm key={selected} source={selected} />}
            </Drawer>
        </>
    );
}

const meta = {
    component: Drawer,
    title: "Building blocks/Modals & overlays/Drawer",
    decorators: [themeDecorator],
    parameters: { tokens: drawerTokens, closedOnDocsPage: true },
    render: (args) => <RedirectList key={String(args.open)} {...args} />,
    args: {
        open: false,
        onOpenChange: fn(),
        title: "Edit redirect",
        children: null,
        footer: (
            <>
                <Button variant="text" color="secondary">
                    Delete
                </Button>
                <Button>Save</Button>
            </>
        ),
    },
    argTypes: {
        width: {
            control: "radio",
            options: ["default", "large"],
        },
        children: { control: false },
        footer: { control: false },
        initialFocus: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Edits a row next to the list: the list stays visible and usable, so picking another row switches the drawer's content.
 * Escape or the close button close it.
 *
 * **Rules**
 *
 * - Prefer a drawer to a dialog when people need the context next to it.
 * - Focus moves to the first field on open and back to the row on close.
 * - On narrow screens the drawer takes the full width.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: /alt-2/ }));
        const drawer = await screen.findByRole("dialog", { name: "Edit redirect" });
        await waitFor(() => expect(screen.getByRole("textbox", { name: "Source" })).toHaveFocus());
        await expect(screen.getByRole("textbox", { name: "Source" })).toHaveValue("/alt-2");
        await userEvent.click(canvas.getByRole("button", { name: /alt-3/ }));
        await expect(screen.getByRole("textbox", { name: "Source" })).toHaveValue("/alt-3");
        await expect(drawer).toBeInTheDocument();
        await userEvent.click(screen.getByRole("button", { name: "Close" }));
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    },
};

export const Open: Story = {
    args: { open: true },
};

/**
 * `description` adds a sentence under the title.
 */
export const WithDescription: Story = {
    args: { open: true, description: "Visitors of the old address land on the new page." },
};

/**
 * `large` (560 px) for content that needs more room.
 */
export const Large: Story = {
    args: { open: true, width: "large" },
};

/**
 * `modal` dims and blocks the page; a click on the backdrop closes the drawer.
 */
export const Modal: Story = {
    args: { open: true, modal: true },
};
