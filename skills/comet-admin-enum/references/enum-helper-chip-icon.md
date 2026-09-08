# Helper: ChipIcon

Icon component for enum chips showing loading/dropdown state. Search for it in the project.

Create this file if it does not exist.

```tsx
import { ChevronDown, ThreeDotSaving } from "@comet/admin-icons";
import { type ChipProps } from "@mui/material";
import { type FunctionComponent } from "react";

type ChipIconProps = {
    loading: boolean;
    onClick?: ChipProps["onClick"];
};

export const ChipIcon: FunctionComponent<ChipIconProps> = ({ loading, onClick }) => {
    if (loading) {
        return <ThreeDotSaving />;
    }
    if (onClick) {
        return <ChevronDown />;
    }

    return null;
};
```
