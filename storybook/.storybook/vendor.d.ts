declare module "*.svg" {
    const content: any;
    export = content;
}

interface ImportMetaEnv {
    readonly MUI_LICENSE_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
