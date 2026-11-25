import { createElement } from "react";
import { expect, it } from "vitest";

import { storyCodesOf } from "../../../.storybook/storyCodePlugin";
import { parseStoryFile } from "../../../.storybook/storyFile";
import { renderSourceWithArgs, renderSourceWithWrittenArgs } from "../renderSourceWithArgs";

it("shows `meta.component` with the args for a story without a `render` function", () => {
    const [storyCode] = storyCodesOf(
        parseStoryFile(
            `
const meta = { component: Button } satisfies Meta<typeof Button>;

export default meta;

export const Outlined: Story = { args: { variant: "outlined" } };
`,
            "Button.stories.tsx",
        ),
    );

    const args = { variant: "outlined", children: "Save" };

    const source = renderSourceWithArgs("", { parameters: storyCode, args, initialArgs: args, argTypes: {} });

    expect(source).toBe('<Button variant="outlined">Save</Button>');
});

it("writes the args as written in the story file, without the `fn()` handlers, and the args that the reader changes as their values", () => {
    const [storyCode] = storyCodesOf(
        parseStoryFile(
            `
const iconOptions = { None: undefined, Trash: <Icon name="trash" /> };

const meta = {
    component: Banner,
    args: { action: <Button>Undo</Button>, items: [{ label: "Page", onClick: openPage }], onClick: fn(), size: "small" },
    argTypes: { icon: { options: Object.keys(iconOptions), mapping: iconOptions } },
} satisfies Meta<typeof Banner>;

export default meta;

export const Default: Story = {};
`,
            "Banner.stories.tsx",
        ),
    );
    const initialArgs = { action: createElement("button"), items: [{ label: "Page", onClick: () => {} }], onClick: () => {}, size: "small" };
    const args = { ...initialArgs, size: "large", icon: "Trash" };
    const argTypes = { icon: { mapping: { None: undefined, Trash: createElement("svg") } } };

    const source = renderSourceWithArgs("", { parameters: storyCode, args, initialArgs, argTypes });

    expect(source).toBe(
        '<Banner action={<Button>Undo</Button>} items={[{ label: "Page", onClick: openPage }]} size="large" icon={<Icon name="trash" />} />',
    );
});

it("takes the args and the `render` function of the story that a story spreads or names", () => {
    const [outlined, error, large] = storyCodesOf(
        parseStoryFile(
            `
const meta = { component: Button } satisfies Meta<typeof Button>;

export default meta;

export const Outlined: Story = {
    args: { variant: "outlined", size: "small" },
    render: (args) => <Button {...args}>Save</Button>,
};

export const Error: Story = { ...Outlined, args: { color: "error" } };

export const Large: Story = { args: { ...Outlined.args, size: "large" }, render: Outlined.render };
`,
            "Button.stories.tsx",
        ),
    );

    expect([outlined.writtenArgs, error.writtenArgs, large.writtenArgs]).toEqual([
        { variant: { value: "outlined" }, size: { value: "small" } },
        { color: { value: "error" } },
        { variant: { value: "outlined" }, size: { value: "large" } },
    ]);
    expect([error.renderSource, large.renderSource]).toEqual([outlined.renderSource, outlined.renderSource]);
});

it("shows the stylesheets that the args use, and no other", () => {
    const [storyCode] = storyCodesOf(
        parseStoryFile(
            `
import cardStyles from "./Card.stories.module.scss";
import pageStyles from "./Page.stories.module.scss";

const meta = { component: Card, args: { className: cardStyles.card } } satisfies Meta<typeof Card>;

export default meta;

export const Default: Story = {};
`,
            "Card.stories.tsx",
        ),
    );

    expect(storyCode.usedStyleImports).toEqual([{ importName: "cardStyles", modulePath: "./Card.stories.module.scss" }]);
});

it("leaves out of `{...args}` the args that a later attribute sets", () => {
    const [storyCode] = storyCodesOf(
        parseStoryFile(
            `
const meta = {
    component: ToolbarButton,
    render: (args) => {
        const [selected, setSelected] = useState(false);
        return <ToolbarButton {...args} selected={selected} onSelectedChange={setSelected} />;
    },
} satisfies Meta<typeof ToolbarButton>;

export default meta;

export const Default: Story = {};
`,
            "ToolbarButton.stories.tsx",
        ),
    );
    const args = { "aria-label": "Bold", selected: false };

    const source = renderSourceWithArgs("", { parameters: storyCode, args, initialArgs: args, argTypes: {} });

    expect(source).toBe(`const [selected, setSelected] = useState(false);

<ToolbarButton aria-label="Bold" selected={selected} onSelectedChange={setSelected} />`);
});

it("unwraps `fn(handler)` and writes `() => {}` for a bare `fn()` in the `render` function", () => {
    const [storyCode] = storyCodesOf(
        parseStoryFile(
            `
const meta = {
    component: Menu,
    args: { onSelect: fn((id) => select(id)) },
    render: (args) => (
        <Menu {...args}>
            <MenuItem label="Duplicate" onClick={fn()} />
        </Menu>
    ),
} satisfies Meta<typeof Menu>;

export default meta;

export const Default: Story = {};
`,
            "Menu.stories.tsx",
        ),
    );
    const args = { onSelect: () => {} };

    const source = renderSourceWithArgs("", { parameters: storyCode, args, initialArgs: args, argTypes: {} });

    expect(source).toBe(`<Menu onSelect={(id) => select(id)}>
    <MenuItem label="Duplicate" onClick={() => {}} />
</Menu>`);
});

it("writes a picked `mapping` option and no `null` children into the code for the components manifest", () => {
    const [storyCode] = storyCodesOf(
        parseStoryFile(
            `
const meta = {
    component: Toolbar,
    args: { children: null, icon: "Undo" },
    argTypes: { icon: { mapping: { Undo: <Icon name="history" /> } } },
} satisfies Meta<typeof Toolbar>;

export default meta;

export const Default: Story = {};
`,
            "Toolbar.stories.tsx",
        ),
    );

    expect(renderSourceWithWrittenArgs(storyCode)).toBe('<Toolbar icon={<Icon name="history" />} />');
});
