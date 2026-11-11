import { Button } from "../components/button/Button";
import { Icon } from "../components/icon/Icon";
import { Typography } from "../components/typography/Typography";
import styles from "./themeExampleContent.module.scss";

export function ThemeExampleContent() {
    return (
        <div className={styles.root}>
            <Typography variant="displayL">Themed headline</Typography>
            <Typography variant="body">Body text follows the active theme.</Typography>
            <div className={styles.actions}>
                <Button startIcon={<Icon name="add" />}>Primary</Button>
                <Button color="secondary" startIcon={<Icon name="edit" />}>
                    Secondary
                </Button>
            </div>
        </div>
    );
}
