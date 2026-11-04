import type { Breakpoint } from "@mui/material";

type BreakpointKey = `'${Breakpoint}'` | number;

type SingleValueBrakpointTypes = "up" | "down" | "only" | "not";
type MultiValueBrakpointTypes = "between";

export type ColumnVisibleOption =
    `${SingleValueBrakpointTypes}(${BreakpointKey})` | `${MultiValueBrakpointTypes}(${BreakpointKey}, ${BreakpointKey})` | false;
