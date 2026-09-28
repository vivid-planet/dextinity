---
title: Writing Admin Component Docs
---

Each admin component should have a corresponding documentation page.

The page should be defined in Storybook (`storybook/src/admin-component-docs/`), it will then be used to generate the documentation page.

## Minimum requirements

Every docs page should include one `Default` story that shows the minimal usage of the component.

It should allow setting all props using `argTypes`. Default values should not be set unless they are required or commonly used.

### Basic example for `MyComponent`

- Create a story file, e.g. `MyComponent.stories.tsx`
- Define the story `meta` (configuration) as a default export
    - Set `component` to the component you want to document
    - Set `title` to the name of the component, prefixed with `Component Docs/`
    - Set the value of `decorators` and `parameters` as seen below to ensure the correct configuration of the page
    - Define the component's props using `argTypes`
    - For props that are necessary for the basic usage of the component, define the default values using `args`
- Create a story, named `Default` and add a concise description of the component in a comment above it

```tsx
import { MyComponent } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof MyComponent>;

const meta: Meta<typeof MyComponent> = {
    component: MyComponent,
    title: "Component Docs/MyComponent",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={Default} />,
        },
    },
    argTypes: {
        children: {
            control: "text",
        },
        variant: {
            control: "select",
            options: [undefined, "primary", "secondary"],
        },
        highlighted: {
            control: "boolean",
        },
    },
    args: {
        children: "Hello World",
    },
};

export default meta;

/**
 * This is a basic description of the component.
 * It's used to display a text in a certain way.
 */
export const Default: Story = {};
```

## All Variants story

The figma design of some components may define a "All Variants" or "Story Variants" screen, if that is the case, create an additional `AllVariants` story in the same file to implement that screen.

This is used as an overview of what the component can be used for and to easily compare the implementation and the design.

```tsx
// Imports, meta, Default, etc.

export const AllVariants: Story = {
    render: (props) => {
        return (
            <Stack spacing={4}>
                <MyComponent {...props} />
                <MyComponent {...props} variant="secondary" />
                <MyComponent {...props} highlighted />
                <MyComponent {...props} variant="secondary" highlighted />
            </Stack>
        );
    },
};
```

## Additional information for docs

If you want to add additional information to the docs, e.g., for a special feature or information that may only be relevant in specific use cases, you can create a separate story in the same docs file with its own description, in addition to the default story.

`MyComponent.stories.tsx`

```tsx
// Imports, meta, Default, etc.

/**
 * This explains what happens when using the `highlighted` prop.
 *
 * Something like this example should only be added if this use case
 * is not obvious or causes potentially unexpected behavior.
 */
export const HighlightedExample: Story = {
    render: (props) => {
        return <MyComponent {...props} highlighted />;
    },
};
```

## Structure for form components

If a component is created for usage inside forms and includes a separate variant for usage inside Final Form, it should mention the existence of the field component but document the field component separately.

Consider defining `argTypes` as a separate variable that can be imported by the docs page of the field variant of the component.
_Note that you then need to add `excludeStories: ["argTypes"]` to the meta object of the field component to avoid creating an unnecessary `argTypes` story._

`MyInputComponent.stories.tsx`

```tsx
import { MyInputComponent } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof MyInputComponent>;

export const argTypes = {
    variant: {
        control: "select",
        options: [undefined, "primary", "secondary"],
    },
    highlighted: {
        control: "boolean",
    },
} as const;

const meta: Meta<typeof MyInputComponent> = {
    component: MyInputComponent,
    title: "Component Docs/MyInputComponent",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={Default} />,
        },
    },
    argTypes,
    excludeStories: ["argTypes"],
};

export default meta;

/**
 * Used to input a certain type of value in a form.
 *
 * For usage inside Final Form, use the `MyInputComponentField` component.
 */
export const Default: Story = {};
```

## Structure for field components

Create a separate docs page for the field variant of a form component.  
Mention the non-field variant of the component in the default story's description.

Make sure to define the same props the non-field component would use (import it's `argTypes` variable) and also include the common props of field components (`commonFieldComponentArgTypes`).

Additionally, the default story must render a Final Form as a wrapper, as this is necessary for the component to function.

`MyInputComponentField.stories.tsx`

```tsx
import { MyInputComponentField } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { argTypes, args } from "./MyInputComponent.stories";
import { commonFieldComponentArgTypes } from "./utils/commonArgTypes";
import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof MyInputComponentField>;

const meta: Meta<typeof MyInputComponentField> = {
    component: MyInputComponentField,
    title: "Component Docs/MyInputComponentField",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={DefaultStory} />,
        },
    },
    argTypes: {
        ...argTypes,
        ...commonFieldComponentArgTypes,
    },
};

export default meta;

/**
 * Used to input a certain type of value in a Final Form.
 *
 * For usage outside of Final Form, use the `MyInputComponent` component.
 */
export const Default: Story = {
    render: (props) => {
        return (
            <FinalForm mode="edit" onSubmit={() => {}}>
                <MyInputComponentField {...props} />
            </FinalForm>
        );
    },
};
```
