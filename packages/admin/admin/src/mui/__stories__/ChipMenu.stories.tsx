import { ChevronDown, Cookie, Domain, Favorite } from "@dextinity/admin-icons";
import { Box, Card, CardContent, Chip, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from "@mui/material";
import { type MouseEvent, useState } from "react";

export default {
    title: "components/mui/ChipMenu",
};

export const ChipMenu = {
    render: () => {
        const [anchorEl, setAnchorEl] = useState<Element | null>(null);

        const handleChipClick = (event: MouseEvent) => {
            setAnchorEl(event.currentTarget);
        };

        const handleMenuClose = () => {
            setAnchorEl(null);
        };

        const handleMenuItemClick = () => {
            // do something
            window.alert("Menu item clicked");
            handleMenuClose();
        };

        const open = Boolean(anchorEl);

        return (
            <Stack spacing={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h3" mb={6}>
                            Chip Menu
                        </Typography>

                        <Box>
                            <Chip icon={<ChevronDown />} clickable label="Chip Menu" onClick={handleChipClick} />
                            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
                                <MenuItem disabled onClick={handleMenuItemClick}>
                                    <ListItemIcon>
                                        <Favorite />
                                    </ListItemIcon>
                                    <ListItemText>Option 1</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleMenuItemClick}>
                                    <ListItemIcon>
                                        <Domain />
                                    </ListItemIcon>
                                    <ListItemText>Option 2</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={handleMenuItemClick}>
                                    <ListItemIcon>
                                        <Cookie />
                                    </ListItemIcon>
                                    <ListItemText>Option 3</ListItemText>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </CardContent>
                </Card>
            </Stack>
        );
    },

    name: "ChipMenu",
};
