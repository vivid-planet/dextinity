type FileUploadInput = Omit<Express.Multer.File, "buffer" | "stream">;

/**
 * @deprecated use `FileUploadInput` instead
 */
type FileUploadInterface = FileUploadInput;

export type { FileUploadInput, FileUploadInterface };
