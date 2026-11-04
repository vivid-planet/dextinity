import type { Decorator } from "@storybook/react-vite";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const DndProviderDecorator: Decorator = (Story) => (
    <DndProvider backend={HTML5Backend}>
        <Story />
    </DndProvider>
);
