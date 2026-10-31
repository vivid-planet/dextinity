import { SvgUse } from "@src/common/helpers/SvgUse";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import styles from "./ChooseFilesButton.module.scss";

type ChooseFilesButtonProps = {
    label?: ReactNode;
    onClick: () => void;
};

export const ChooseFilesButton = ({ label, onClick }: ChooseFilesButtonProps) => (
    <button type="button" className={styles.chooseFilesButton} onClick={onClick}>
        <SvgUse href="/assets/icons/add-file.svg#root" width={16} height={16} />
        {label ?? <FormattedMessage id="fileUploadField.chooseFiles" defaultMessage="Choose files" />}
    </button>
);
