import { Button, readClipboardText, writeClipboardText } from "@dextinity/admin";

export default {
    title: "Docs/Helper/Clipboard",
};

export const Write = () => {
    return (
        <Button
            variant="primary"
            onClick={async () => {
                await writeClipboardText("Hello World");
            }}
        >
            Write clipboard
        </Button>
    );
};

export const Read = () => {
    return (
        <Button
            variant="primary"
            onClick={async () => {
                const text = await readClipboardText();
                alert(text);
            }}
        >
            Read clipboard
        </Button>
    );
};
