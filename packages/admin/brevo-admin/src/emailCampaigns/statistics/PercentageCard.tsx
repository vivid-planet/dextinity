import { Paper, Skeleton as MuiSkeleton, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { FC, ReactNode } from "react";
import { FormattedNumber } from "react-intl";

interface Props {
    title: ReactNode;
    currentNumber?: number;
    targetNumber?: number;
    variant?: "normal" | "circle";
}

export const PercentageCard: FC<Props> = ({ title, currentNumber, targetNumber, variant = "normal" }) => {
    const percentage = currentNumber === undefined || targetNumber === undefined || targetNumber <= 0 ? null : (currentNumber / targetNumber) * 100;
    const renderSkeleton = currentNumber === undefined || targetNumber === undefined;

    const values = (
        <>
            <Typography variant="h1">
                {renderSkeleton ? (
                    <Skeleton variant="text" width={80} height={64} />
                ) : (
                    <>
                        {percentage === null ? (
                            "–"
                        ) : (
                            <>
                                <FormattedNumber value={percentage} style="decimal" minimumSignificantDigits={3} maximumSignificantDigits={3} />%
                            </>
                        )}
                    </>
                )}
            </Typography>
            <Typography variant="body2">
                {renderSkeleton ? (
                    <Skeleton variant="text" width={100} height={20} />
                ) : (
                    <>
                        <FormattedNumber value={currentNumber} /> / <FormattedNumber value={targetNumber} />
                    </>
                )}
            </Typography>
        </>
    );

    return (
        <Paper>
            <Content>
                <Typography variant="h6" mb={2}>
                    {title}
                </Typography>
                {variant === "normal" && values}
                {variant === "circle" && (
                    <CircleValueContainer>
                        <CircleContainer>
                            <Circle percentage={percentage ? Math.min(percentage, 100) : 0} />
                        </CircleContainer>
                        <CircleValue>{values}</CircleValue>
                    </CircleValueContainer>
                )}
            </Content>
        </Paper>
    );
};

const Content = styled("div")`
    padding: 60px 30px;
    text-align: center;
`;

const CircleValueContainer = styled("div")`
    position: relative;
    max-width: 250px;
    margin-left: auto;
    margin-right: auto;
`;

const CircleContainer = styled("div")`
    position: relative;
    padding-bottom: 100%;
`;

interface CircleProps {
    percentage: number;
}

const Circle = styled("div")<CircleProps>`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    display: flex;
    border: 5px solid ${({ theme }) => theme.palette.grey[100]};
    border-radius: 50%;

    :before {
        content: "";
        display: block;
        position: absolute;
        z-index: 2;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: white;
        border-radius: 50%;
    }

    :after {
        content: "";
        display: block;
        position: absolute;
        z-index: 1;
        top: -5px;
        right: -5px;
        bottom: -5px;
        left: -5px;
        border-radius: 50%;

        background: ${({ theme, percentage }) => {
            if (!percentage) {
                return theme.palette.grey[100];
            }

            const rotation = (18 / 5) * percentage - 90;
            return `
            linear-gradient(${rotation}deg, ${theme.palette.grey[100]} 50%, transparent 0) 0 / min(100%, (50 - ${percentage}) * 100%),
            linear-gradient(${rotation}deg, transparent 50%, ${theme.palette.primary.main} 0) 0 / min(100%, (${percentage} - 50) * 100%),
            linear-gradient(to right, ${theme.palette.grey[100]} 50%, ${theme.palette.primary.main} 0)`;
        }};
    }
`;

const CircleValue = styled("div")`
    position: absolute;
    z-index: 2;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const Skeleton = styled(MuiSkeleton)`
    margin-left: auto;
    margin-right: auto;
`;
