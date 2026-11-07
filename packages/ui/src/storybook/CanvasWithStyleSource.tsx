import { Canvas, Source, useOf } from "@storybook/addon-docs/blocks";
import { type ComponentProps, type PropsWithChildren, useState } from "react";

import styles from "./canvasWithStyleSource.module.scss";

type CanvasProps = ComponentProps<typeof Canvas>;

/**
 * Replaces the `Canvas` docs block. For a story with a `styleSource` parameter, "Show code" shows its TSX and its styles in tabs.
 */
export function CanvasWithStyleSource(props: CanvasProps) {
    const { story } = useOf(props.of ?? "story", ["story"]);
    const styleSource: unknown = story.parameters.styleSource;

    if (typeof styleSource !== "string") {
        return <Canvas {...props} />;
    }
    return <CanvasWithCodeTabs canvasProps={props} storyExport={story.moduleExport} styleSource={styleSource} />;
}

type CanvasWithCodeTabsProps = {
    canvasProps: CanvasProps;
    storyExport: CanvasProps["of"];
    styleSource: string;
};

function CanvasWithCodeTabs({ canvasProps, storyExport, styleSource }: CanvasWithCodeTabsProps) {
    const [isCodeShown, setIsCodeShown] = useState(false);
    const [isStyleSourceSelected, setIsStyleSourceSelected] = useState(false);

    const toggleCodeAction = { title: isCodeShown ? "Hide code" : "Show code", onClick: () => setIsCodeShown(!isCodeShown) };

    return (
        <div className={styles.root}>
            <Canvas {...canvasProps} sourceState="none" additionalActions={[...(canvasProps.additionalActions ?? []), toggleCodeAction]} />
            {isCodeShown && (
                <div className={styles.codePanel}>
                    <div role="group" aria-label="Code" className={styles.tabList}>
                        <CodeTab isSelected={!isStyleSourceSelected} onSelect={() => setIsStyleSourceSelected(false)}>
                            TSX
                        </CodeTab>
                        <CodeTab isSelected={isStyleSourceSelected} onSelect={() => setIsStyleSourceSelected(true)}>
                            SCSS
                        </CodeTab>
                    </div>
                    {isStyleSourceSelected ? (
                        <Source code={styleSource} language="css" dark />
                    ) : (
                        <Source {...canvasProps.source} of={storyExport} language="tsx" dark />
                    )}
                </div>
            )}
        </div>
    );
}

type CodeTabProps = PropsWithChildren<{ isSelected: boolean; onSelect: () => void }>;

function CodeTab({ isSelected, onSelect, children }: CodeTabProps) {
    return (
        <button type="button" aria-pressed={isSelected} className={styles.tab} onClick={onSelect}>
            {children}
        </button>
    );
}
