import type { Decorator } from "@storybook/react-vite";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { DndProvider } from "react-dnd-multi-backend";

export const DndProviderDecorator: Decorator = (Story) => (
    <DndProvider options={HTML5toTouch}>
        <Story />
    </DndProvider>
);
