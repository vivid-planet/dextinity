import type { Decorator } from "@storybook/react-vite";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export function dndProviderDecorator(): Decorator {
    return (Story) => {
        return (
            <DndProvider backend={HTML5Backend}>
                <Story />
            </DndProvider>
        );
    };
}
