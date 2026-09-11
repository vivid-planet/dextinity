---
title: Creating customizable Admin components
---

MUI components support multiple ways of customization.
You can override the styles of individual component instances or style them globally using the theme.
You can also use the theme to override those components' default props.

All Dextinity Admin components should also support these features.

Those features should be usable as described in [Customization and Styling](/docs/admin-components/customization-and-styling).

## Basics

Generally, a Dextinity Admin component should export the following in the `index.ts` file:

- The component itself, with a unique name
- The props type, named as the component, followed by `Props`
- The class key type, named as the component, followed by `ClassKey`

```tsx
export { MyComponent, MyComponentProps, MyComponentClassKey } from "./src/MyComponent";
```

## Class keys

A component's `ClassKey` type defines all the individual elements (or slots) of a component and all modifiers/alternative styles of a component.

The outermost slot of a component is generally called `root`.

```tsx
export type MyComponentClassKey = "root" | "title";
```

## Slots

Each element or subcomponent of a Dextinity Admin component is defined as a slot.

A slot is created and styled by using `createComponentSlot()` and passing in the HTML element or component you want to base your slot on.

Additionally, the component's name must be passed in, as well as the slot's name, as defined in the class key type.

```tsx
const Root = createComponentSlot("div")<MyComponentClassKey>({
    componentName: "MyComponent",
    slotName: "root",
})(
    ({ theme }) => css`
        background-color: ${theme.palette.primary.main};
    `,
);

const Title = createComponentSlot(Typography)<MyComponentClassKey>({
    componentName: "MyComponent",
    slotName: "title",
})(css`
    color: lime;
`);
```

## Defining the props type

The props type of Dextinity Admin components must extend `ThemedComponentBaseProps`.
As a generic, an object must be passed in with the slot's name as the keys and the type of their base element or component as values.

```tsx
export interface MyComponentProps
    extends ThemedComponentBaseProps<{
        root: "div";
        title: typeof Typography;
    }> {
    variant?: "primary" | "secondary";
    children?: React.ReactNode;
}
```

## Using props

Props should not be used directly but through the `useThemeProps` hook instead.
This ensures that the component's `defaultProps` from the theme are merged with the passed-in props.

Note that the name passed to the `useThemeProps` hook must be the same as the component's name, prefixed with `DextinityAdmin`.

```tsx
export function MyComponent(inProps: MyComponentProps) {
    const { children, variant } = useThemeProps({ props: inProps, name: "DextinityAdminMyComponent" });
    return (
        // ...
    )
}
```

## `slotProps` and `restProps`

To allow overriding the props of each slot, the `slotProps` object should be spread into each slot.
Additionally, the `sx` and `className` props should be passed into the root slot, for example with `...restProps`.

`slotProps` and `restProps` should typically be spread after other props to allow overriding of the slot's hardcoded props.
Exceptions would be for props that should never be overridden.

```tsx
export function MyComponent(inProps: MyComponentProps) {
    const { slotProps, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminMyComponent",
    });
    return (
        <Root {...slotProps?.root} {...restProps}>
            <Title {...slotProps?.title} />
        </Root>
    );
}
```

## Owner state

The `ownerState` is an object that includes all values that can impact the component's styling.
It is passed into every slot that requires any of these values for its styling.

```tsx
type OwnerState = {
    highlighted: boolean;
};

const Root = createComponentSlot("div")<MyComponentClassKey, OwnerState>({
    componentName: "MyComponent",
    slotName: "root",
})(
    ({ theme, ownerState }) => css`
        ${ownerState.highlighted &&
        css`
            background-color: ${theme.palette.primary.main};
        `}
    `,
);

export function MyComponent(inProps: MyComponentProps) {
    // ...
    const ownerState: OwnerState = {
        highlighted: getHighlightedState(),
    };

    return <Root ownerState={ownerState} {...slotProps?.root} {...restProps} />;
}
```

## A slot's `classesResolver`

By default, a slot's class name consists of the component and slot names, prefixed with `DextinityAdmin`.
For example, the `root` slot of `MyComponent` would have the class name `DextinityAdminMyComponent-root`, while the `title` slot would have the class name `DextinityAdminMyComponent-title`.

Additional class names can be added to a slot by returning an array of class keys in `classesResolver()`.
This allows easy customization using the resulting class name in a selector outside the component.

In the following example, a component has a conditional `highlighted` state.
If `true`, the class name `DextinityAdminMyComponent-highlighted` is added to the `root` slot by returning the `highlighted` class key in `classesResolver`.
If `false`, the `classesResolver` does not return the class key, so no additional class name is added.

```tsx
export type MyComponentClassKey = "root" | "highlighted";

type OwnerState = {
    highlighted: boolean;
};

const Root = createComponentSlot("div")<MyComponentClassKey, OwnerState>({
    componentName: "MyComponent",
    slotName: "root",
    classesResolver(ownerState) {
        return [ownerState.highlighted && "highlighted"];
    },
})(css`
    // ...
`);
```

## Overridable icons

When using icons inside a component, make sure they can be replaced by custom icons when using the component.
Generally, this is done by defining an `iconMapping` prop as an object, for which the key clearly defines what the icon is used for.

```tsx
export interface MyComponentProps {
    // ...
    iconMapping?: {
        fullscreenButton?: React.ReactNode;
        closeDialog?: React.ReactNode;
    };
}
```

The icons can then be used by destructuring them, renaming them with `Icon` as a suffix, and setting a default icon.

```tsx
export function MyComponent(inProps: MyComponentProps) {
    const { iconMapping = {}, ...restProps } = useThemeProps({
        props: inProps,
        name: "DextinityAdminMyComponent",
    });
    const {
        fullscreenButton: fullscreenButtonIcon = <Expand />,
        closeDialog: closeDialogIcon = <Close color="inherit" />,
     } = iconMapping;

    return (
        <>
            <Button startIcon={fullscreenButtonIcon}>Fullscreen</Button>
            <Dialog {...}>
                <IconButton>{closeDialogIcon}</IconButton>
                {/* ... */}
            </Dialog>
        </>
    );
}
```

## Adding the component to MUI's theme type

To allow setting the components `defaultProps` and `styleOverrides` in the theme, the component must be added to the `ComponentsPropsList`, `ComponentNameToClassKey`, and `Components` interfaces.
The key should be the component name, prefixed with `DextinityAdmin`.

Note that the `defaultProps` inside the `Components` interface should be a `Partial<>` of the `ComponentsPropsList` type.
This is because `defaultProps` are optional changes to the component's props, so nothing is required to be passed in.

```tsx
declare module "@mui/material/styles" {
    interface ComponentsPropsList {
        DextinityAdminMyComponent: MyComponentProps;
    }

    interface ComponentNameToClassKey {
        DextinityAdminMyComponent: MyComponentClassKey;
    }

    interface Components {
        DextinityAdminMyComponent?: {
            defaultProps?: Partial<ComponentsPropsList["DextinityAdminMyComponent"]>;
            styleOverrides?: ComponentsOverrides<Theme>["DextinityAdminMyComponent"];
        };
    }
}
```
