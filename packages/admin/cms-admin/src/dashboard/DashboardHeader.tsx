import { Typography } from "@mui/material";
import { css, styled } from "@mui/material/styles";
import type { ReactNode } from "react";

import { DateTime } from "./DateTime";
import { DefaultGreeting } from "./DefaultGreeting";

export type DashboardHeaderProps = {
    backgroundImageUrl?: {
        "1x": string;
        "2x": string;
    };
    textColor?: "light" | "dark" | "inherit";
    greeting?: ReactNode;
};

export const DashboardHeader = ({ backgroundImageUrl, textColor = "light", greeting = <DefaultGreeting /> }: DashboardHeaderProps) => {
    return (
        <Root backgroundImageUrl={backgroundImageUrl} textColor={textColor}>
            <DateTime />
            <Greeting variant="h1">{greeting}</Greeting>
        </Root>
    );
};

type RootProps = {
    backgroundImageUrl?: DashboardHeaderProps["backgroundImageUrl"];
    textColor: DashboardHeaderProps["textColor"];
};

const Root = styled("div")<RootProps>`
    position: relative;
    height: 230px;
    color: ${({ textColor }) => (textColor === "light" ? "white" : textColor === "dark" ? "black" : "inherit")};
    background-color: ${({ theme }) => theme.palette.grey[700]};

    ${({ backgroundImageUrl }) =>
        backgroundImageUrl !== undefined &&
        css`
            background-image: url(${backgroundImageUrl["1x"]});
            background-size: cover;
            background-position: center;

            @media (min-device-pixel-ratio: 1.5) {
                background-image: url(${backgroundImageUrl["2x"]});
            }
        `}

    ${({ theme }) => theme.breakpoints.up("sm")} {
        height: 300px;
    }
`;

const Greeting = styled(Typography)`
    position: absolute;
    left: ${({ theme }) => theme.spacing(4)};
    bottom: 12px;
    font-size: 30px;
    line-height: 38px;
    font-weight: 160;

    ${({ theme }) => theme.breakpoints.up("sm")} {
        left: ${({ theme }) => theme.spacing(8)};
        bottom: ${({ theme }) => theme.spacing(8)};
        font-size: 55px;
        line-height: 64px;
        font-weight: 200;
    }
`;
