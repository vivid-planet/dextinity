import { BlobStorageConfig, IsUndefinable } from "@dextinity/cms-api";
import { PrivateSiteConfig } from "@src/site-configs";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, IsUrl, Length, MinLength, ValidateIf } from "class-validator";

export class EnvironmentVariables {
    @IsIn(["development", "production", "test"])
    NODE_ENV: "development" | "production" | "test";

    @IsString()
    @ValidateIf(() => process.env.NODE_ENV === "production")
    HELM_RELEASE: string;

    @IsString()
    POSTGRESQL_HOST: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true")
    POSTGRESQL_USE_SSL: boolean;

    @Type(() => Number)
    @IsInt()
    POSTGRESQL_PORT: number;

    @IsString()
    POSTGRESQL_DB: string;

    @IsString()
    POSTGRESQL_USER: string;

    @IsString()
    POSTGRESQL_PWD: string;

    @IsString()
    API_URL: string;

    @IsString()
    IDP_CLIENT_ID: string;

    @IsString()
    IDP_JWKS_URI: string;

    @IsString()
    IDP_END_SESSION_ENDPOINT: string;

    @IsString()
    POST_LOGOUT_REDIRECT_URI: string;

    @IsString()
    @MinLength(16)
    BASIC_AUTH_SYSTEM_USER_PASSWORD: string;

    @IsString()
    ADMIN_URL: string;

    @IsString()
    @IsUndefinable()
    SERVER_HOST?: string;

    @Type(() => Number)
    @IsInt()
    API_PORT: number;

    @IsString()
    CORS_ALLOWED_ORIGIN: string;

    @IsString()
    IMGPROXY_SALT: string;

    @IsString()
    IMGPROXY_URL: string;

    @IsString()
    IMGPROXY_KEY: string;

    @IsString()
    @MinLength(16)
    DAM_SECRET: string;

    @IsString()
    BLOB_STORAGE_DRIVER: BlobStorageConfig["backend"]["driver"];

    @ValidateIf((variables: EnvironmentVariables) => variables.BLOB_STORAGE_DRIVER === "file")
    @IsString()
    FILE_STORAGE_PATH: string;

    @ValidateIf((variables: EnvironmentVariables) => variables.BLOB_STORAGE_DRIVER === "azure")
    @IsString()
    AZURE_ACCOUNT_NAME: string;

    @ValidateIf((variables: EnvironmentVariables) => variables.BLOB_STORAGE_DRIVER === "azure")
    @IsString()
    AZURE_ACCOUNT_KEY: string;

    @IsString()
    BLOB_STORAGE_DIRECTORY_PREFIX: string;

    @ValidateIf((variables: EnvironmentVariables) => variables.BLOB_STORAGE_DRIVER === "s3")
    @IsString()
    S3_REGION: string;

    @ValidateIf((variables: EnvironmentVariables) => variables.BLOB_STORAGE_DRIVER === "s3")
    @IsString()
    S3_ENDPOINT: string;

    @ValidateIf((variables: EnvironmentVariables) => variables.BLOB_STORAGE_DRIVER === "s3")
    @IsString()
    S3_ACCESS_KEY_ID: string;

    @ValidateIf((variables: EnvironmentVariables) => variables.BLOB_STORAGE_DRIVER === "s3")
    @IsString()
    S3_SECRET_ACCESS_KEY: string;

    @ValidateIf((variables: EnvironmentVariables) => variables.BLOB_STORAGE_DRIVER === "s3")
    @IsString()
    S3_BUCKET: string;

    @IsString()
    MAILER_HOST: string;

    @Type(() => Number)
    @IsInt()
    MAILER_PORT: number;

    @IsUndefinable()
    @IsArray()
    @Transform(({ value }) => value.split(","))
    @IsEmail({}, { each: true })
    MAILER_SEND_ALL_MAILS_TO?: string[];

    @IsUndefinable()
    @IsArray()
    @Transform(({ value }) => value.split(","))
    @IsEmail({}, { each: true })
    MAILER_SEND_ALL_MAILS_BCC?: string[];

    @IsString()
    @ValidateIf(() => process.env.NODE_ENV === "production")
    CDN_ORIGIN_CHECK_SECRET: string;

    @ValidateIf((variables: EnvironmentVariables) => Boolean(variables.AZURE_AI_TRANSLATOR_KEY || variables.AZURE_AI_TRANSLATOR_REGION))
    @IsUrl()
    AZURE_AI_TRANSLATOR_ENDPOINT?: string;

    @ValidateIf((variables: EnvironmentVariables) => Boolean(variables.AZURE_AI_TRANSLATOR_ENDPOINT || variables.AZURE_AI_TRANSLATOR_REGION))
    @IsString()
    AZURE_AI_TRANSLATOR_KEY?: string;

    @ValidateIf((variables: EnvironmentVariables) => Boolean(variables.AZURE_AI_TRANSLATOR_ENDPOINT || variables.AZURE_AI_TRANSLATOR_KEY))
    @IsString()
    AZURE_AI_TRANSLATOR_REGION?: string;

    @ValidateIf((variables: EnvironmentVariables) =>
        Boolean(variables.AZURE_OPEN_AI_CONTENT_GENERATION_API_KEY || variables.AZURE_OPEN_AI_CONTENT_GENERATION_DEPLOYMENT_ID),
    )
    @IsString()
    AZURE_OPEN_AI_CONTENT_GENERATION_API_URL?: string;

    @ValidateIf((variables: EnvironmentVariables) =>
        Boolean(variables.AZURE_OPEN_AI_CONTENT_GENERATION_API_URL || variables.AZURE_OPEN_AI_CONTENT_GENERATION_DEPLOYMENT_ID),
    )
    @IsString()
    AZURE_OPEN_AI_CONTENT_GENERATION_API_KEY?: string;

    @ValidateIf((variables: EnvironmentVariables) =>
        Boolean(variables.AZURE_OPEN_AI_CONTENT_GENERATION_API_URL || variables.AZURE_OPEN_AI_CONTENT_GENERATION_API_KEY),
    )
    @IsString()
    AZURE_OPEN_AI_CONTENT_GENERATION_DEPLOYMENT_ID?: string;

    @IsOptional()
    @IsUrl()
    SENTRY_DSN?: string;

    @ValidateIf((variables: EnvironmentVariables) => Boolean(variables.SENTRY_DSN))
    @IsString()
    SENTRY_ENVIRONMENT?: string;

    @IsString()
    @MinLength(16)
    FILE_UPLOADS_DOWNLOAD_SECRET: string;

    @IsString()
    @MinLength(16)
    SITE_PREVIEW_SECRET: string;

    @IsArray()
    @Transform(({ value }) => JSON.parse(Buffer.from(value, "base64").toString()))
    PRIVATE_SITE_CONFIGS: PrivateSiteConfig[];

    @IsString()
    BREVO_API_KEY: string;

    @IsString()
    BREVO_ECG_RTR_LIST_API_KEY: string;

    @IsString()
    BREVO_CAMPAIGN_BASIC_AUTH_USERNAME: string;

    @IsString()
    BREVO_CAMPAIGN_BASIC_AUTH_PASSWORD: string;

    @IsString()
    @IsUndefinable()
    @Length(64)
    BREVO_EMAIL_HASH_KEY?: string;

    @IsBoolean()
    @IsUndefinable()
    @Transform(({ value }) => value === "true")
    BREVO_ALLOW_ADDING_CONTACTS_WITHOUT_DOI?: boolean;
}
