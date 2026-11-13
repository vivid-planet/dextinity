import { useState } from "react";
import { UPDATE_STORY_ARGS } from "storybook/internal/core-events";
import { addons } from "storybook/preview-api";

/**
 * Changes a story's args the way the Controls panel does. Storybook re-renders the story with the new args and shows them in the
 * Controls panel. A play function uses it to check that a story follows its args.
 */
export function updateStoryArgs(storyId: string, updatedArgs: Record<string, unknown>) {
    addons.getChannel().emit(UPDATE_STORY_ARGS, { storyId, updatedArgs });
}

/**
 * Binds a controlled component's value to a story arg in both directions: the component shows the arg, so the Controls panel
 * drives it, and a change on the canvas writes the new value back to the arg. Call it in a story's `render` function with the
 * arguments `render` receives, and keep calling the arg's `fn()` callback, so the Actions panel still logs the change.
 *
 * A change on the canvas shows right away, like with `useState`, although Storybook re-renders with the written arg only later. Unlike
 * `useArgs`, it also works in a `render` function that uses React's hooks.
 */
export function useControlledArg<Args extends object, Key extends keyof Args & string>(
    args: Args,
    key: Key,
    { id }: { id: string },
): [value: Args[Key], setValue: (value: Args[Key]) => void] {
    const argValue = args[key];
    const [value, setValue] = useState(argValue);
    const [renderedArgValue, setRenderedArgValue] = useState(argValue);
    const [writtenValues, setWrittenValues] = useState<Args[Key][]>([]);

    if (!Object.is(argValue, renderedArgValue)) {
        setRenderedArgValue(argValue);
        const writtenIndex = writtenValues.findIndex((writtenValue) => Object.is(writtenValue, argValue));
        if (writtenIndex === -1) {
            // Changed outside the canvas, e.g. in the Controls panel
            setValue(argValue);
            setWrittenValues([]);
        } else {
            // A value written from the canvas arrived; a newer one may already show
            setWrittenValues(writtenValues.slice(writtenIndex + 1));
        }
    }

    return [
        value,
        (nextValue) => {
            setValue(nextValue);
            setWrittenValues((current) => [...current, nextValue]);
            updateStoryArgs(id, { [key]: nextValue });
        },
    ];
}
