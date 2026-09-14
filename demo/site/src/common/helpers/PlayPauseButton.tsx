import type { PlayPauseButtonProps } from "@dextinity/site-nextjs";
import clsx from "clsx";
import { useIntl } from "react-intl";

import styles from "./PlayPauseButton.module.scss";

export const PlayPauseButton = ({ isPlaying, onClick }: PlayPauseButtonProps) => {
    const intl = useIntl();
    return (
        <button
            className={clsx(styles.button)}
            onClick={onClick}
            aria-label={
                isPlaying
                    ? intl.formatMessage({ id: "playPauseButton.pause", defaultMessage: "Pause" })
                    : intl.formatMessage({ id: "playPauseButton.play", defaultMessage: "Play" })
            }
        >
            <div className={clsx(styles.animatedPlayPause, isPlaying && styles.animatedPlayPausePaused)} />
        </button>
    );
};
