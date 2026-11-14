import { Button } from "../components/button/Button";
import { Icon } from "../components/icon/Icon";
import { Typography } from "../components/typography/Typography";
import styles from "./themeExampleContent.module.scss";

export function ThemeExampleContent() {
    return (
        <div className={styles.root}>
            <Typography variant="label">Structured content</Typography>
            <Typography variant="displayL">Job postings</Typography>
            <Typography>Body text follows the active brand, color scheme, and density.</Typography>
            <div className={styles.actions}>
                <Button startIcon={<Icon name="plus-circle" />}>Add</Button>
                <Button variant="outlined" color="secondary" startIcon={<Icon name="edit" />}>
                    Edit
                </Button>
                <Button variant="text">Cancel</Button>
            </div>
        </div>
    );
}
