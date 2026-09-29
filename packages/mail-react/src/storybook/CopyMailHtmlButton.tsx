/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "storybook/internal/components";
import { useChannel } from "storybook/manager-api";

const RENDER_RESULT_EVENT = "dextinity-mail-render-result";

export function CopyMailHtmlButton() {
    const htmlRef = useRef<string>("");
    const [copied, setCopied] = useState(false);
    const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useChannel({
        [RENDER_RESULT_EVENT]: ({ html }: { html: string }) => {
            htmlRef.current = html;
            setCopied(false);
        },
    });

    useEffect(() => {
        return () => {
            if (copiedTimeoutRef.current) {
                clearTimeout(copiedTimeoutRef.current);
            }
        };
    }, []);

    const handleClick = useCallback(async () => {
        await navigator.clipboard.writeText(htmlRef.current);
        setCopied(true);
        if (copiedTimeoutRef.current) {
            clearTimeout(copiedTimeoutRef.current);
        }
        copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    }, []);

    return (
        <Button size="small" onClick={handleClick}>
            {copied ? "Copied to clipboard!" : "Copy Mail HTML"}
        </Button>
    );
}
