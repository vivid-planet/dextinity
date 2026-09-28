import { FormSection, PrettyBytes, Table } from "@dextinity/admin";
import { Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { isDateString } from "class-validator";
import { FormattedDate, useIntl } from "react-intl";
import { v4 as uuid } from "uuid";

interface ImageInfos {
    width: number;
    height: number;
    fileSize: number;
    fileFormat: string;
    exif: { [key: string]: unknown } | null;
}

interface FileInfosProps {
    imageInfos: ImageInfos;
}

const TableLabel = styled(Typography)`
    font-size: 14px;
    color: ${({ theme }) => theme.palette.grey[300]};
`;

export const ImageInfos = ({ imageInfos: { width, height, fileSize, fileFormat, exif } }: FileInfosProps) => {
    const intl = useIntl();

    const exifRows =
        exif === null
            ? undefined
            : Object.entries(exif).map(([key, value]) => ({
                  id: uuid(),
                  label: key,
                  value,
              }));

    return (
        <>
            <FormSection
                title={intl.formatMessage({
                    id: "dextinity.dam.file.imageInfos",
                    defaultMessage: "Image infos",
                })}
            >
                <Table
                    hideTableHead
                    data={[
                        {
                            id: uuid(),
                            label: intl.formatMessage({ id: "dextinity.dam.file.widthAndHeight", defaultMessage: "Width and Height" }),
                            value: intl.formatMessage(
                                {
                                    id: "dextinity.dam.file.widthAndHeightValue",
                                    defaultMessage: "{width} x {height} px",
                                },
                                {
                                    width,
                                    height,
                                },
                            ),
                        },
                        {
                            id: uuid(),
                            label: intl.formatMessage({ id: "dextinity.dam.file.fileSize", defaultMessage: "File Size" }),
                            value: <PrettyBytes value={fileSize} />,
                        },
                        {
                            id: uuid(),
                            label: intl.formatMessage({ id: "dextinity.dam.file.format", defaultMessage: "Format" }),
                            value: fileFormat,
                        },
                    ]}
                    totalCount={3}
                    columns={[
                        {
                            name: "label",
                            render: (row) => <TableLabel>{row.label}</TableLabel>,
                        },
                        {
                            name: "value",
                            cellProps: {
                                style: {
                                    textAlign: "right",
                                },
                            },
                        },
                    ]}
                />
            </FormSection>
            {exifRows !== undefined && (
                <FormSection
                    title={intl.formatMessage({
                        id: "dextinity.dam.file.embeddedMetaInfos",
                        defaultMessage: "Embedded meta infos",
                    })}
                >
                    <Table
                        hideTableHead
                        data={exifRows}
                        totalCount={exifRows.length}
                        columns={[
                            {
                                name: "label",
                                render: (row) => <TableLabel>{row.label}</TableLabel>,
                            },
                            {
                                name: "value",
                                render: (row) => {
                                    if (typeof row.value === "object") {
                                        return JSON.stringify(row.value);
                                    } else if (typeof row.value === "string" && isDateString(row.value)) {
                                        return <FormattedDate value={row.value} dateStyle="medium" timeStyle="short" />;
                                    }

                                    return String(row.value);
                                },
                                cellProps: {
                                    style: {
                                        textAlign: "right",
                                    },
                                },
                            },
                        ]}
                    />
                </FormSection>
            )}
        </>
    );
};
