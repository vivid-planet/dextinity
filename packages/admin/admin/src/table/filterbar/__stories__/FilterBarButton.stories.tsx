import { ChevronDown } from "@dextinity/admin-icons";
import { List, ListItem } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { FilterBarButton } from "../filterBarButton/FilterBarButton";

function Example() {
    return (
        <List>
            <ListItem>
                <div>
                    <strong>Resting</strong> <br />
                    <FilterBarButton openPopover={false} endIcon={<ChevronDown />}>
                        Filter Button
                    </FilterBarButton>
                </div>
            </ListItem>
            <ListItem>
                <div>
                    <strong>Disabled</strong> <br />
                    <FilterBarButton openPopover={false} endIcon={<ChevronDown />} disabled>
                        Filter Button
                    </FilterBarButton>
                </div>
            </ListItem>
            <ListItem>
                <div>
                    <strong>Open Dropdown</strong> <br />
                    <FilterBarButton openPopover={true} endIcon={<ChevronDown />}>
                        Filter Button
                    </FilterBarButton>
                </div>
            </ListItem>
            <ListItem>
                <div>
                    <strong>Selected</strong> <br />
                    <FilterBarButton openPopover={false} numberDirtyFields={3} endIcon={<ChevronDown />}>
                        Filter Button
                    </FilterBarButton>
                </div>
            </ListItem>
            <ListItem>
                <div>
                    <strong>Selected Disabled</strong> <br />
                    <FilterBarButton openPopover={false} numberDirtyFields={3} endIcon={<ChevronDown />} disabled>
                        Filter Button
                    </FilterBarButton>
                </div>
            </ListItem>
        </List>
    );
}

const meta: Meta = {
    title: "components/table/filterbar/FilterBarButton",
};

export default meta;

type Story = StoryObj;

export const _FilterBarButton: Story = {
    render: () => {
        return <Example />;
    },
};
