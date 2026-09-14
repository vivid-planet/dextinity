import { SplitButton } from "@dextinity/admin";
import { Home } from "@dextinity/admin-icons";
// eslint-disable-next-line no-restricted-imports
import { Button, Typography } from "@mui/material";
import { useState } from "react";

export default {
    title: "Docs/Components/SplitButton",
};

export const Uncontrolled = {
    render: () => {
        return (
            <SplitButton>
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Primary Action
                </Button>
                <Button
                    onClick={() => {
                        alert("secondary clicked");
                    }}
                >
                    Secondary Action
                </Button>
            </SplitButton>
        );
    },
};

export const Controlled = {
    render: () => {
        const [selectedIndex, setSelectedIndex] = useState(1);
        return (
            <SplitButton
                selectedIndex={selectedIndex}
                onSelectIndex={(index: number) => {
                    setSelectedIndex(index);
                }}
            >
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Primary Action
                </Button>
                <Button
                    onClick={() => {
                        alert("secondary clicked");
                    }}
                >
                    Secondary Action
                </Button>
            </SplitButton>
        );
    },
};

export const LocalStorageIndex = {
    render: () => {
        return (
            <SplitButton variant="contained" color="secondary" localStorageKey="StorylocalStorageIndexSplitButton">
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Local Storage - Primary Action
                </Button>
                <Button
                    onClick={() => {
                        alert("secondary clicked");
                    }}
                >
                    Local Storage - Secondary Action
                </Button>
                <Button
                    onClick={() => {
                        alert("tertiary clicked");
                    }}
                >
                    Local Storage - Tertiary Action
                </Button>
            </SplitButton>
        );
    },
};

export const SessionStorageIndex = {
    render: () => {
        return (
            <SplitButton localStorageKey="StorySessionStorageIndexSplitButton" storage={window.sessionStorage} variant="contained" color="secondary">
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Session Storage - Primary Action
                </Button>
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Session Storage - Secondary Action
                </Button>
                <Button
                    onClick={() => {
                        alert("tertiary clicked");
                    }}
                >
                    Session Storage - Tertiary Action
                </Button>
            </SplitButton>
        );
    },
};

export const OneChild = {
    render: () => {
        return (
            <SplitButton variant="contained" color="primary">
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Primary Action
                </Button>
            </SplitButton>
        );
    },
    name: "One child",
};

export const OneChildWithSelect = {
    render: () => {
        return (
            <SplitButton showSelectButton={true} variant="contained" color="primary">
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Primary Action
                </Button>
            </SplitButton>
        );
    },
    name: "One child with select",
};

export const OneChildDisabled = {
    render: () => {
        return (
            <SplitButton disabled={true} variant="contained" color="primary">
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Primary Action
                </Button>
            </SplitButton>
        );
    },
    name: "One child disabled",
};

export const ColorChange = {
    render: () => {
        return (
            <SplitButton variant="contained">
                <Button
                    color="primary"
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Primary Action
                </Button>
                <Button
                    color="secondary"
                    onClick={() => {
                        alert("secondary clicked");
                    }}
                >
                    Secondary Action
                </Button>
                <Button
                    onClick={() => {
                        alert("tertiary clicked");
                    }}
                >
                    Tertiary Action
                </Button>
            </SplitButton>
        );
    },
    name: "Color change",
};

export const VariantChange = {
    render: () => {
        return (
            <SplitButton color="primary">
                <Button
                    variant="contained"
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Primary Action
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => {
                        alert("secondary clicked");
                    }}
                >
                    Secondary Action
                </Button>
                <Button
                    variant="text"
                    onClick={() => {
                        alert("tertiary clicked");
                    }}
                >
                    Tertiary Action
                </Button>
            </SplitButton>
        );
    },
    name: "Variant change",
};

export const CustomComponent = {
    render: () => {
        return (
            <div>
                <div style={{ marginBottom: 20 }}>
                    <SplitButton>
                        <div
                            style={{ cursor: "pointer", borderBottomLeftRadius: 20, borderTopLeftRadius: 20, background: "orangered", padding: 10 }}
                            onClick={() => {
                                alert("Pressed");
                            }}
                        >
                            <Typography color="initial">
                                <Home /> Home
                            </Typography>
                        </div>
                        <Button variant="contained" color="primary">
                            Primary Action
                        </Button>
                    </SplitButton>
                </div>
                <div>
                    <SplitButton>
                        <div
                            style={{ cursor: "pointer", background: "teal", padding: 10 }}
                            onClick={() => {
                                alert("Pressed");
                            }}
                        >
                            <Typography color="initial">
                                <Home /> Home
                            </Typography>
                        </div>
                        <Button variant="contained" color="primary">
                            Primary Action
                        </Button>
                    </SplitButton>
                </div>
            </div>
        );
    },
};

export const OverridePopoverProps = {
    render: () => {
        return (
            <SplitButton
                variant="contained"
                popoverProps={{
                    anchorOrigin: {
                        vertical: "top",
                        horizontal: "right",
                    },
                    transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                    },
                }}
            >
                <Button
                    onClick={() => {
                        alert("primary clicked");
                    }}
                >
                    Primary Action
                </Button>
                <Button
                    onClick={() => {
                        alert("secondary clicked");
                    }}
                >
                    Secondary Action
                </Button>
            </SplitButton>
        );
    },
};
