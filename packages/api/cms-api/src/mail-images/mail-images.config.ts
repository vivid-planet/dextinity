export interface MailImageLimits {
    /**
     * A DAM image variant that stays larger than this after resizing is left out. Files from `staticFilesDirectory` are not checked.
     * @default 2 MB
     */
    maxBytesPerImage: number;
    /**
     * A mail attaches at most this many images, in the order it renders them.
     * @default 50
     */
    maxImagesPerMail: number;
    /**
     * Base64 adds about 37 % on the wire. The default of 7 MB (about 9.6 MB encoded) leaves room for the html below the 10 MB that mail
     * servers commonly accept at least.
     * @default 7 MB
     */
    maxTotalBytesPerMail: number;
    /**
     * Only this many images of a mail are fetched at a time.
     * @default 4
     */
    fetchConcurrency: number;
    /**
     * A fetch of a DAM image variant from imgproxy that takes longer is aborted.
     * @default 10 seconds
     */
    fetchTimeoutMs: number;
}

export interface MailImagesModuleConfig {
    /**
     * The URL that the DAM image URLs of the mails start with, e.g. the `pixelImageBlock.baseUrl` of the mail config.
     */
    baseUrl: string;
    /**
     * The directory that a relative image `src` is read from, e.g. the API's `public` directory. Without it, a relative `src` stays
     * unchanged.
     */
    staticFilesDirectory?: string;
    limits?: Partial<MailImageLimits>;
}

export const defaultMailImageLimits: MailImageLimits = {
    maxBytesPerImage: 2 * 1024 * 1024,
    maxImagesPerMail: 50,
    maxTotalBytesPerMail: 7 * 1024 * 1024,
    fetchConcurrency: 4,
    fetchTimeoutMs: 10_000,
};
