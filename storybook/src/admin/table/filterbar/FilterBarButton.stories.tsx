import { FilterBarButton } from "@dextinity/admin";
import { ChevronDown } from "@dextinity/admin-icons";
import { List, ListItem } from "@mui/material";

function Story() {
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

export default {
    title: "@dextinity/admin/table/filterbar",
};

export const _FilterBarButton = () => {
    return <Story />;
};
