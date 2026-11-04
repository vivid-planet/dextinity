import ButtonGroup from "@mui/material/ButtonGroup";

import type { IControlProps } from "../types";

export default function BlockTypesControls(p: IControlProps) {
    const {
        options: { customToolbarButtons },
    } = p;

    if (!customToolbarButtons || customToolbarButtons.length < 1) {
        return null;
    }

    return (
        <ButtonGroup>
            {customToolbarButtons.map((comp, idx) => {
                const Comp = comp;
                return <Comp key={idx} {...p} />;
            })}
        </ButtonGroup>
    );
}
