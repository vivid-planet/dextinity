import { Selection, SelectionRoute, useSelection, useSelectionRoute } from "@dextinity/admin";
import { Add } from "@dextinity/admin-icons";
import { List, ListItemButton, ListItemIcon, ListItemText, Paper } from "@mui/material";
import { Redirect, Route, useLocation } from "react-router";

import { storyRouterDecorator } from "../../../story-router.decorator";

export default {
    title: "Docs/Components/Selection",
    decorators: [storyRouterDecorator()],
};

export const UseSelectionHook = {
    render: () => {
        const [selection, selectionApi] = useSelection();

        return (
            <Paper style={{ padding: "10px" }}>
                <h2>useSelection Hook:</h2>
                <div>
                    <p>id: {selection.id}</p>
                    <p>mode: {selection.mode}</p>
                    <List>
                        {["1", "2", "3"].map((id) => {
                            return (
                                <ListItemButton key={id} onClick={() => selectionApi.handleSelectId(id)}>
                                    <ListItemText primary={`Item ${id}`} />
                                </ListItemButton>
                            );
                        })}
                        <ListItemButton onClick={() => selectionApi.handleAdd()}>
                            <ListItemIcon>
                                <Add />
                            </ListItemIcon>
                            <ListItemText primary="Add Item" />
                        </ListItemButton>
                    </List>
                </div>
            </Paper>
        );
    },
    name: "useSelection Hook",
};

export const SelectionComponent = {
    render: () => {
        return (
            <Paper style={{ padding: "10px" }}>
                <h2>Selection Component:</h2>
                <Selection>
                    {({ selectedId, selectionApi, selectionMode }) => (
                        <div>
                            <p>selectedId: {selectedId}</p>
                            <p>selectionMode: {selectionMode}</p>
                            <List>
                                {["1", "2", "3"].map((id) => {
                                    return (
                                        <ListItemButton key={id} onClick={() => selectionApi.handleSelectId(id)}>
                                            <ListItemText primary={`Item ${id}`} />
                                        </ListItemButton>
                                    );
                                })}
                                <ListItemButton onClick={() => selectionApi.handleAdd()}>
                                    <ListItemIcon>
                                        <Add />
                                    </ListItemIcon>
                                    <ListItemText primary="Add Item" />
                                </ListItemButton>
                            </List>
                        </div>
                    )}
                </Selection>
            </Paper>
        );
    },
};

export const UseSelectionRouteHook = {
    render: () => {
        const SelectionList = () => {
            const [SelectionRoute, selection, selectionApi] = useSelectionRoute();

            return (
                <SelectionRoute>
                    <div>
                        <p>id: {selection.id}</p>
                        <p>mode: {selection.mode}</p>
                        <List>
                            {["1", "2", "3"].map((id) => {
                                return (
                                    <ListItemButton key={id} onClick={() => selectionApi.handleSelectId(id)}>
                                        <ListItemText primary={`Item ${id}`} />
                                    </ListItemButton>
                                );
                            })}
                            <ListItemButton onClick={() => selectionApi.handleAdd()}>
                                <ListItemIcon>
                                    <Add />
                                </ListItemIcon>
                                <ListItemText primary="Add Item" />
                            </ListItemButton>
                        </List>
                    </div>
                </SelectionRoute>
            );
        };

        const location = useLocation();

        return (
            <Paper style={{ padding: "10px" }}>
                <h2>useSelectionRoute Hook:</h2>
                <p>
                    <strong>Current URL: </strong> {location.pathname}
                </p>
                <Route exact path="/">
                    <Redirect to="/example" />
                </Route>
                <Route path="/example">
                    <SelectionList />
                </Route>
            </Paper>
        );
    },
    name: "useSelectionRoute Hook",
};

export const SelectionRouteComponent = {
    render: () => {
        const SelectionList = () => {
            return (
                <SelectionRoute>
                    {({ selectedId, selectionApi, selectionMode }) => {
                        return (
                            <div>
                                <p>selectedId: {selectedId}</p>
                                <p>selectionMode: {selectionMode}</p>
                                <List>
                                    {["1", "2", "3"].map((id) => {
                                        return (
                                            <ListItemButton key={id} onClick={() => selectionApi.handleSelectId(id)}>
                                                <ListItemText primary={`Item ${id}`} />
                                            </ListItemButton>
                                        );
                                    })}
                                    <ListItemButton onClick={() => selectionApi.handleAdd()}>
                                        <ListItemIcon>
                                            <Add />
                                        </ListItemIcon>
                                        <ListItemText primary="Add Item" />
                                    </ListItemButton>
                                </List>
                            </div>
                        );
                    }}
                </SelectionRoute>
            );
        };

        const location = useLocation();

        return (
            <Paper style={{ padding: "10px" }}>
                <h2>SelectionRoute Component:</h2>
                <p>
                    <strong>Current URL: </strong> {location.pathname}
                </p>
                <Route exact path="/">
                    <Redirect to="/example" />
                </Route>
                <Route path="/example">
                    <SelectionList />
                </Route>
            </Paper>
        );
    },
    name: "SelectionRoute Component",
};
