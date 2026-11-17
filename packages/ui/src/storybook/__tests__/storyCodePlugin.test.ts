import { expect, it } from "vitest";

import { storyCodesOf } from "../../../.storybook/storyCodePlugin";
import { parseStoryFile } from "../../../.storybook/storyFile";
import { renderSourceWithArgs } from "../renderSourceWithArgs";

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

    const source = renderSourceWithArgs("", { parameters: storyCode, args: { variant: "outlined", children: "Save" }, argTypes: {} });

    expect(source).toBe('<Button variant="outlined">Save</Button>');
});
