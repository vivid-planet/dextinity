export { AnchorBlock } from "./blocks/AnchorBlock";
export { BlockAdminComponentButton } from "./blocks/common/BlockAdminComponentButton";
export { BlockAdminComponentNestedButton } from "./blocks/common/BlockAdminComponentNestedButton";
export { BlockAdminComponentPaper, useBlockAdminComponentPaper } from "./blocks/common/BlockAdminComponentPaper";
export { BlockAdminComponentRoot } from "./blocks/common/BlockAdminComponentRoot";
export { BlockAdminComponentSection } from "./blocks/common/BlockAdminComponentSection";
export { BlockAdminComponentSectionGroup } from "./blocks/common/BlockAdminComponentSectionGroup";
export { BlockAdminTabLabel } from "./blocks/common/BlockAdminTabLabel";
export type { BlockAdminTabsProps } from "./blocks/common/BlockAdminTabs";
export { BlockAdminTabs } from "./blocks/common/BlockAdminTabs";
export { BlockPreviewContent } from "./blocks/common/blockRow/BlockPreviewContent";
export { BlockRow } from "./blocks/common/blockRow/BlockRow";
export { HiddenInSubroute } from "./blocks/common/HiddenInSubroute";
export { type BlocksConfig, BlocksConfigProvider, useBlocksConfig } from "./blocks/config/BlocksConfigContext";
export { type BlockContext } from "./blocks/context/BlockContext";
export { BlockContextProvider } from "./blocks/context/BlockContextProvider";
export { useBlockContext } from "./blocks/context/useBlockContext";
export { createDamVideoBlock } from "./blocks/createDamVideoBlock";
export { createExternalLinkBlock, type ExternalLinkBlockState } from "./blocks/createExternalLinkBlock";
export { createImageLinkBlock } from "./blocks/createImageLinkBlock";
export { createLinkBlock } from "./blocks/createLinkBlock";
export type { RichTextBlockFactoryOptions } from "./blocks/createRichTextBlock";
export { createRichTextBlock, isRichTextEmpty, isRichTextEqual } from "./blocks/createRichTextBlock";
export { createSeoBlock } from "./blocks/createSeoBlock";
export { createTableBlock, type TableBlockFactoryOptions } from "./blocks/createTableBlock";
export type { TextImageBlockFactoryOptions } from "./blocks/createTextImageBlock";
export { createTextImageBlock } from "./blocks/createTextImageBlock";
export { createTextLinkBlock } from "./blocks/createTextLinkBlock";
export { DamVideoBlock } from "./blocks/DamVideoBlock";
export { EmailLinkBlock } from "./blocks/EmailLinkBlock";
export { ExternalLinkBlock } from "./blocks/ExternalLinkBlock";
export { ColumnsLayoutPreview, ColumnsLayoutPreviewContent, ColumnsLayoutPreviewSpacing } from "./blocks/factories/columnsBlock/ColumnsLayoutPreview";
export { FinalFormLayoutSelect } from "./blocks/factories/columnsBlock/FinalFormLayoutSelect";
export type { BlocksBlockFragment, BlocksBlockState } from "./blocks/factories/createBlocksBlock";
export type { BlocksBlockOutput } from "./blocks/factories/createBlocksBlock";
export { createBlocksBlock } from "./blocks/factories/createBlocksBlock";
export type { ColumnsBlockLayout } from "./blocks/factories/createColumnsBlock";
export { createColumnsBlock } from "./blocks/factories/createColumnsBlock";
export { createCompositeBlock } from "./blocks/factories/createCompositeBlock";
export type { ListBlockFragment, ListBlockState } from "./blocks/factories/createListBlock";
export type { ListBlockOutput } from "./blocks/factories/createListBlock";
export { createListBlock } from "./blocks/factories/createListBlock";
export type { CreateOneOfBlockOptions, OneOfBlockFragment, OneOfBlockState } from "./blocks/factories/createOneOfBlock";
export type { OneOfBlockOutput } from "./blocks/factories/createOneOfBlock";
export type { OneOfBlockPreviewState } from "./blocks/factories/createOneOfBlock";
export { createOneOfBlock } from "./blocks/factories/createOneOfBlock";
export type { OptionalBlockDecoratorFragment, OptionalBlockState } from "./blocks/factories/createOptionalBlock";
export type { OptionalBlockOutput } from "./blocks/factories/createOptionalBlock";
export { createOptionalBlock } from "./blocks/factories/createOptionalBlock";
export { createSpaceBlock } from "./blocks/factories/spaceBlock/createSpaceBlock";
export { AutosaveFinalForm } from "./blocks/form/AutosaveFinalForm";
export { BlocksFinalForm } from "./blocks/form/BlocksFinalForm";
export { createFinalFormBlock } from "./blocks/form/createFinalFormBlock";
export { composeBlocks } from "./blocks/helpers/composeBlocks/composeBlocks";
export { createCompositeBlockField } from "./blocks/helpers/composeBlocks/createCompositeBlockField";
export { createCompositeBlockFields } from "./blocks/helpers/composeBlocks/createCompositeBlockFields";
export { createBlockSkeleton } from "./blocks/helpers/createBlockSkeleton";
export { createCompositeBlockSelectField } from "./blocks/helpers/createCompositeBlockSelectField";
export { createCompositeBlockSwitchField } from "./blocks/helpers/createCompositeBlockSwitchField";
export { createCompositeBlockTextField } from "./blocks/helpers/createCompositeBlockTextField";
export { decomposeUpdateStateAction } from "./blocks/helpers/decomposeUpdateStateAction";
export { withAdditionalBlockAttributes } from "./blocks/helpers/withAdditionalBlockAttributes";
export { HoverPreviewComponent } from "./blocks/iframebridge/HoverPreviewComponent";
export { IFrameBridgeContext, IFrameBridgeProvider } from "./blocks/iframebridge/IFrameBridge";
export type {
    AdminMessage,
    AdminMessageType,
    IAdminBlockMessage,
    IAdminHoverComponentMessage,
    IAdminSelectComponentMessage,
    IFrameLocationMessage,
    IFrameMessage,
    IFrameSelectComponentMessage,
    IReadyIFrameMessage,
} from "./blocks/iframebridge/IFrameMessage";
export { IFrameMessageType } from "./blocks/iframebridge/IFrameMessage";
export { SelectPreviewComponent } from "./blocks/iframebridge/SelectPreviewComponent";
export { useIFrameBridge } from "./blocks/iframebridge/useIFrameBridge";
export { EditImageDialog } from "./blocks/image/EditImageDialog";
export { InternalLinkBlock } from "./blocks/InternalLinkBlock";
export { PhoneLinkBlock } from "./blocks/PhoneLinkBlock";
export { PixelImageBlock } from "./blocks/PixelImageBlock";
export { SpaceBlock } from "./blocks/SpaceBlock";
export { SvgImageBlock } from "./blocks/SvgImageBlock";
export type {
    TipTapInlineStyle,
    TipTapPlaceholder,
    TipTapRichTextBlockContent,
    TipTapTextBlockStyle,
    TipTapTextBlockType,
} from "./blocks/tipTap/createTipTapRichTextBlock";
export { createTipTapRichTextBlock } from "./blocks/tipTap/createTipTapRichTextBlock";
export type {
    AnonymousBlockInterface,
    BlockAdminComponent,
    BlockAdminComponentPart,
    BlockDependency,
    BlockInputApi,
    BlockInterface,
    BlockMethods,
    BlockOutputApi,
    BlockPreviewContext,
    BlockPreviewStateInterface,
    BlockState,
    LinkBlockInterface,
    ReadOnlyBlockRenderInterface,
    ReplaceDependencyObject,
    RootBlockInterface,
} from "./blocks/types";
export type { CustomBlockCategory } from "./blocks/types";
export { BlockCategory, blockCategoryLabels } from "./blocks/types";
export { resolveNewState } from "./blocks/utils";
export { parallelAsyncEvery } from "./blocks/utils/parallelAsyncEvery";
export { isValidUrl } from "./blocks/validators/isValidUrl";
export { VimeoVideoBlock } from "./blocks/VimeoVideoBlock";
export { YouTubeVideoBlock } from "./blocks/YouTubeVideoBlock";
export { BuildEntry } from "./builds/BuildEntry";
export { PublisherPage } from "./builds/PublisherPage";
export { includeInvisibleContentContext } from "./common/apollo/links/includeInvisibleContentContext";
export { DropdownMenuItem } from "./common/DropdownMenuItem";
export { useBuildInformation } from "./common/header/about/build-information/useBuildInformation";
export { Header } from "./common/header/Header";
export { UserHeaderItem } from "./common/header/UserHeaderItem";
export type { TextMatch } from "./common/MarkedMatches";
export { MarkedMatches } from "./common/MarkedMatches";
export { findTextMatches } from "./common/MarkedMatches";
export type { MasterMenuData, MasterMenuProps } from "./common/MasterMenu";
export { MasterMenu, useMenuFromMasterMenuData } from "./common/MasterMenu";
export type { MasterMenuRoutesProps } from "./common/MasterMenuRoutes";
export { MasterMenuRoutes, useRoutePropsFromMasterMenuData } from "./common/MasterMenuRoutes";
export type { PageListItem } from "./common/PageList";
export { PageList } from "./common/PageList";
export { PageName } from "./common/PageName";
export { SignOutButton } from "./common/signOutButton/SignOutButton";
export { useEditState } from "./common/useEditState";
export { useSaveState } from "./common/useSaveState";
export type { DextinityConfig } from "./config/DextinityConfigContext";
export { DextinityConfigProvider, useDextinityConfig } from "./config/DextinityConfigContext";
export { useContentLanguage } from "./contentLanguage/useContentLanguage";
export { ContentScopeIndicator } from "./contentScope/ContentScopeIndicator";
export { ContentScopeSelect } from "./contentScope/ContentScopeSelect";
export { ContentScopeControls } from "./contentScope/Controls";
export { NoContentScopeFallback } from "./contentScope/noContentScopeFallback/NoContentScopeFallback";
export type { ContentScope, ContentScopeProviderProps, ContentScopeValues, UseContentScopeApi } from "./contentScope/Provider";
export { ContentScopeProvider, useContentScope } from "./contentScope/Provider";
export type { ContentScopeConfigProps } from "./contentScope/useContentScopeConfig";
export { useContentScopeConfig } from "./contentScope/useContentScopeConfig";
export { CronJobsPage } from "./cronJobs/CronJobsPage";
export { JobRuntime } from "./cronJobs/JobRuntime";
export { DamFileDownloadLinkBlock } from "./dam/blocks/DamFileDownloadLinkBlock";
export { DamImageBlock } from "./dam/blocks/DamImageBlock";
export { damDefaultAcceptedMimeTypes } from "./dam/config/damDefaultAcceptedMimeTypes";
export { type DamFileCategory, getDamFileCategory } from "./dam/config/damFileCategory";
export { useDamAcceptedMimeTypes } from "./dam/config/useDamAcceptedMimeTypes";
export { useDamScope } from "./dam/config/useDamScope";
export { useCurrentDamFolder } from "./dam/CurrentDamFolderProvider";
export { DamPage } from "./dam/DamPage";
export type { FileWithDamUploadMetadata } from "./dam/DataGrid/fileUpload/useDamFileUpload";
export { useDamFileUpload } from "./dam/DataGrid/fileUpload/useDamFileUpload";
export { createDamFileDependency } from "./dam/dependencies/createDamFileDependency";
export { DashboardHeader, type DashboardHeaderProps } from "./dashboard/DashboardHeader";
export { DashboardWidgetRoot, type DashboardWidgetRootProps } from "./dashboard/widgets/DashboardWidgetRoot";
export { LatestBuildsDashboardWidget } from "./dashboard/widgets/LatestBuildsDashboardWidget";
export {
    LatestContentUpdatesDashboardWidget,
    type LatestContentUpdatesDashboardWidgetProps,
} from "./dashboard/widgets/LatestContentUpdatesDashboardWidget";
export { createDependencyMethods } from "./dependencies/createDependencyMethods";
export { createDocumentDependencyMethods } from "./dependencies/createDocumentDependencyMethods";
export { DependenciesList, type DependenciesListProps } from "./dependencies/DependenciesList";
export { DependentsList, type DependentsListProps } from "./dependencies/DependentsList";
export type { DependencyInterface } from "./dependencies/types";
export {
    type ContentGenerationConfig,
    ContentGenerationConfigProvider,
    useContentGenerationConfig,
} from "./documents/ContentGenerationConfigContext";
export { createDocumentRootBlocksMethods } from "./documents/createDocumentRootBlocksMethods";
export type { DocumentInterface, DocumentType, InfoTagProps, SitePreviewActionProps } from "./documents/types";
export { ChooseDamFileDialog } from "./form/file/chooseFile/ChooseDamFileDialog";
export { SearchHeaderItem } from "./fullTextSearch/SearchHeaderItem";
/** @deprecated Use `ChooseDamFileDialog` instead. */
export { ChooseDamFileDialog as ChooseFileDialog } from "./form/file/chooseFile/ChooseDamFileDialog";
export { ChooseDamFilesDialog } from "./form/file/chooseFile/ChooseDamFilesDialog";
export { FileField, type GQLDamFileFieldFileFragment } from "./form/file/FileField";
export { damFileFieldFragment } from "./form/file/FileField.gql";
export { FileUploadField, type FileUploadFieldProps } from "./form/file/FileUploadField";
export {
    FinalFormFileUpload,
    finalFormFileUploadDownloadableFragment,
    finalFormFileUploadFragment,
    type FinalFormFileUploadProps,
} from "./form/file/FinalFormFileUpload";
export type { GQLFinalFormFileUploadDownloadableFragment, GQLFinalFormFileUploadFragment } from "./form/file/FinalFormFileUpload.generated";
export { queryUpdatedAt } from "./form/queryUpdatedAt";
export { serializeInitialValues } from "./form/serializeInitialValues";
export { SyncFields } from "./form/SyncFields";
export { useFormSaveConflict } from "./form/useFormSaveConflict";
export { createEditPageNode } from "./pages/createEditPageNode";
export { createUsePage } from "./pages/createUsePage";
export { PagesPage } from "./pages/pagesPage/PagesPage";
export type { AllCategories } from "./pages/pageTree/PageTreeContext";
export { useCopyPastePages } from "./pages/pageTree/useCopyPastePages";
export { PageTreeSelect } from "./pages/pageTreeSelect/PageTreeSelect";
export { resolveHasSaveConflict } from "./pages/resolveHasSaveConflict";
export { useSaveConflict } from "./pages/useSaveConflict";
export { useSaveConflictQuery } from "./pages/useSaveConflictQuery";
export { BlockPreview } from "./preview/block/BlockPreview";
export { BlockPreviewWithTabs } from "./preview/block/BlockPreviewWithTabs";
export { SplitPreview } from "./preview/block/SplitPreview";
export type { BlockPreviewApi } from "./preview/block/useBlockPreview";
export { useBlockPreview } from "./preview/block/useBlockPreview";
export { openPreviewWindow, openSitePreviewWindow } from "./preview/openSitePreviewWindow";
export { SitePreview } from "./preview/site/SitePreview";
export { createRedirectsLinkBlock, createRedirectsPage } from "./redirects/createRedirectsPage";
export type { SiteConfig } from "./siteConfigs/siteConfigsConfig";
export { useSiteConfig } from "./siteConfigs/useSiteConfig";
export { useSiteConfigs } from "./siteConfigs/useSiteConfigs";
export { AzureAiTranslatorProvider } from "./translation/AzureAiTranslatorProvider";
export { createDocumentTranslationMethods } from "./translation/createDocumentTranslationMethods";
export type { TranslatableInterface } from "./translation/TranslatableInterface";
export { TranslateContentMenuItem } from "./translation/TranslateContentMenuItem";
export {
    CurrentUserContext,
    type CurrentUserInterface,
    CurrentUserProvider,
    type Permission,
    type PermissionOverrides,
    useCurrentUser,
    useUserPermissionCheck,
} from "./userPermissions/hooks/currentUser";
export { UserPermissionsUserPageBasicDataPanel } from "./userPermissions/user/basicData/UserBasicData";
export { StartImpersonationButton, StopImpersonationButton } from "./userPermissions/user/ImpersonationButtons";
export { UserPermissionsUserPagePermissionsPanel } from "./userPermissions/user/permissions/PermissionsPanel";
export { UserPermissionsUserPageToolbar } from "./userPermissions/user/UserPageToolbar";
export { UserPermissionsUserGrid } from "./userPermissions/UserGrid";
export { UserPermissionsPage } from "./userPermissions/UserPermissionsPage";
export { isLinkTarget } from "./validation/isLinkTarget";
export { validateLinkTarget } from "./validation/validateLinkTarget";
export { LatestWarningsDashboardWidget } from "./warnings/LatestWarningsDashboardWidget";
export { WarningsPage } from "./warnings/WarningsPage";
import packageJson from "../package.json";

export const version = packageJson.version;
