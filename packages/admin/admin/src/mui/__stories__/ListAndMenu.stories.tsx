import { Add } from "@dextinity/admin-icons";
import { Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Paper } from "@mui/material";
import { useRef, useState } from "react";

import { Button } from "../../common/buttons/Button";

export default {
    title: "components/mui/ListAndMenu",
};

export const ListAndMenu = {
    render: () => {
        const buttonRef = useRef<HTMLButtonElement>(null);
        const [open, setOpen] = useState(false);

        return (
            <div>
                <Paper sx={{ mb: 4 }}>
                    <List>
                        <ListItem>Simple list item</ListItem>
                        <ListItem>
                            <ListItemText primary="Using ListItemText" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <Add />
                            </ListItemIcon>
                            <ListItemText primary="List item with icon" />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon>
                                <Add />
                            </ListItemIcon>
                            <ListItemText primary="List item with icon" secondary="And secondary text" />
                        </ListItem>
                    </List>
                </Paper>
                <Paper sx={{ mb: 4 }}>
                    <List>
                        <ListItemButton>Simple list item button</ListItemButton>
                        <ListItemButton>
                            <ListItemText primary="Using ListItemText" />
                        </ListItemButton>
                        <ListItemButton>
                            <ListItemIcon>
                                <Add />
                            </ListItemIcon>
                            <ListItemText primary="List item button with icon" />
                        </ListItemButton>
                        <Divider />
                        <ListItemButton>
                            <ListItemIcon>
                                <Add />
                            </ListItemIcon>
                            <ListItemText primary="List item button with icon" secondary="And secondary text" />
                        </ListItemButton>
                    </List>
                </Paper>
                <Button ref={buttonRef} onClick={() => setOpen(true)}>
                    Open menu
                </Button>
                <Menu open={open} onClose={() => setOpen(false)} anchorEl={buttonRef.current}>
                    <MenuItem>Simple menu item</MenuItem>
                    <MenuItem>
                        <ListItemText primary="Using ListItemText" />
                    </MenuItem>
                    <MenuItem>
                        <ListItemIcon>
                            <Add />
                        </ListItemIcon>
                        <ListItemText primary="Menu item with icon" />
                    </MenuItem>
                    <Divider />
                    <MenuItem>
                        <ListItemIcon>
                            <Add />
                        </ListItemIcon>
                        <ListItemText primary="Menu item with icon" secondary="And secondary text" />
                    </MenuItem>
                </Menu>
            </div>
        );
    },
};
