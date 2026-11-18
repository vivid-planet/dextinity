import type { Decorator } from "@storybook/react-vite";
import { type ReactNode, useEffect, useState } from "react";
import { UPDATE_STORY_ARGS } from "storybook/internal/core-events";
import type { Args } from "storybook/internal/types";
import { addons } from "storybook/preview-api";

interface StoryArgsUpdate {
    storyId: string;
    updatedArgs: Args;
}

function ArgsUpdatesFromChannel({ storyId, args, children }: { storyId: string; args: Args; children: (args: Args) => ReactNode }) {
    const [updatedArgs, setUpdatedArgs] = useState<Args>({});
    useEffect(() => {
        const channel = addons.getChannel();
        const onUpdateStoryArgs = (update: StoryArgsUpdate) => {
            if (update.storyId === storyId) {
                setUpdatedArgs((current) => ({ ...current, ...update.updatedArgs }));
            }
        };
        channel.on(UPDATE_STORY_ARGS, onUpdateStoryArgs);
        return () => channel.off(UPDATE_STORY_ARGS, onUpdateStoryArgs);
    }, [storyId]);
    return children({ ...args, ...updatedArgs });
}

/**
 * Applies arg updates — from `useArgs` or the Controls panel — in the story tests, where no Storybook UI listens for them, so that a
 * play function can check that a controlled story follows its args. In Storybook itself, the preview applies them and the decorator
 * does nothing.
 */
export const argsUpdatesInTestsDecorator: Decorator = (Story, { id, args, parameters }) => {
    if (parameters.__isPortableStory !== true) {
        return <Story />;
    }
    return (
        <ArgsUpdatesFromChannel storyId={id} args={args}>
            {(updatedArgs) => <Story args={updatedArgs} />}
        </ArgsUpdatesFromChannel>
    );
};
