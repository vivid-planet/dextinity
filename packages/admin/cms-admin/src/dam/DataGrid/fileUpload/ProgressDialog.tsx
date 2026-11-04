import { PrettyBytes } from "@dextinity/admin";
import { BallTriangle } from "@dextinity/admin-icons";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    LinearProgress,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

const ProgressDialogContent = styled("div")`
    min-width: 300px;
    min-height: 165px;
    padding: 30px 20px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
`;

const StyledBallTriangle = styled(BallTriangle)`
    font-size: 55px;
    margin-bottom: 30px;
`;

const StyledLinearProgress = styled(LinearProgress)`
    width: 100%;
    margin-top: 30px;
`;

interface ProgressDialogProps {
    open: boolean;
    totalSize?: number;
    loadedSize?: number;
}

export const ProgressDialog = ({ open, totalSize, loadedSize }: ProgressDialogProps) => {
    return (
        <Dialog open={open}>
            <ProgressDialogContent>
                <StyledBallTriangle />

                {totalSize === undefined ? (
                    <Typography>
                        <FormattedMessage id="dextinity.dam.file.loading" defaultMessage="Loading ..." />
                    </Typography>
                ) : (
                    <Typography>
                        <FormattedMessage
                            id="dextinity.dam.file.totalLoadedUpload"
                            defaultMessage="{loaded} / {total}"
                            values={{
                                loaded: loadedSize ? <PrettyBytes value={loadedSize > totalSize ? totalSize : loadedSize} /> : 0,
                                total: <PrettyBytes value={totalSize} />,
                            }}
                        />
                    </Typography>
                )}
                <StyledLinearProgress variant="determinate" value={loadedSize && totalSize ? (loadedSize / totalSize) * 100 : 0} />
            </ProgressDialogContent>
        </Dialog>
    );
};
