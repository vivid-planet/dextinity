import { ChevronDown } from "@dextinity/admin-icons";
import { useTheme } from "@mui/material";
import type { FunctionComponent } from "react";
import ReactDiffViewer, { DiffMethod, type ReactDiffViewerProps } from "react-diff-viewer-continued";
import { FormattedMessage } from "react-intl";

import { CodeFoldMessageContainer, createStyles, Root } from "./DiffViewer.sc";

export type DiffViewerProps = ReactDiffViewerProps;

export const DiffViewer: FunctionComponent<DiffViewerProps> = ({
    codeFoldMessageRenderer,
    compareMethod = DiffMethod.WORDS_WITH_SPACE,
    extraLinesSurroundingDiff = 0,
    ...restProps
}) => {
    const theme = useTheme();

    return (
        <Root>
            <ReactDiffViewer
                codeFoldMessageRenderer={
                    codeFoldMessageRenderer
                        ? codeFoldMessageRenderer
                        : (totalFoldedLines) => {
                              return (
                                  <CodeFoldMessageContainer>
                                      <ChevronDown />
                                      <FormattedMessage
                                          defaultMessage="Expand {foldedLines} {foldedLines, plural, =0 {lines} one {line} other {lines}}"
                                          id="dextinity.diffViewer.codeFoldMessage"
                                          values={{ foldedLines: totalFoldedLines }}
                                      />
                                  </CodeFoldMessageContainer>
                              );
                          }
                }
                compareMethod={compareMethod}
                extraLinesSurroundingDiff={extraLinesSurroundingDiff}
                hideLineNumbers
                {...restProps}
                styles={createStyles(theme)}
            />
        </Root>
    );
};
