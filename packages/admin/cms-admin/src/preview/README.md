Dextinity has two different previews:

## Block Preview

Live preview of unsaved content shown while editing blocks, iframe that embends fixed site url, admin sends using iframebridge block preview data.

### iframe messages: admin -> site

    - `Block`: update block contents (previewState from blocks)
    - `SelectComponent`: Block is selected in admin and block preview should scroll it into view
    - `HoverComponent`: Block is hovered in admin and block preview should highlight it
    - `AccessToken`: inject the AccessToken, done on Ready message

### iframe messages: site -> admin

    - `Ready`: preview is up and running
    - `SelectComponent`: Block is selected in block preview and admin should open the block for editing
    - `HoverComponent` Block is hovered in block preview and admin should highlight it

### Admin: States, Contexts and Components

```
EditPage: previewApi, created with useBlockPreview: State containing showOnlyVisible (and admin only device/minimized)
          previewState, created using RootBlock.createPreviewState from pageState (uses showOnlyVisible)
  BlockPreviewWithTabs (prop drilling: previewApi, previewState)
    IFrameBridgeProvider
         - creates context containing:
                - iFrameRef: used to attach the context to the actual iframe, done by BlockPreview
                - sendBlockState: sends the current block preview state, done by BlockPreview
                - iFrameReady
                - hoveredSiteRoute: used by block admin to highlight block
                - sendSelectComponent: used by block admin (SelectPreviewComponent)
                - sendHoverComponent: used by block admin (HoverPreviewComponent)
                - sendAccessToken: sends the AccessToken, done by BlockPreview (not possible in IFrameBridgeProvider direclty because it's in block-admin)
         - has hoveredSiteRoute state
         - handles messages coming from iframe (SelectComponent, HoverComponent)
    SplitPreview (prop drilling: previewApi, previewState)
       BlockPreview (prop drilling: previewApi, previewState)
            - messages previewState to iframe (with useIFrameBridge)
            - messages AccessToken (with useIFrameBridge)
            - has controls for managing previewApi (showOnlyVisible, device, minimized)
            - sets the iframe ref to inject it into IFrameBrdige (with useIFrameBridge)
         IFrameViewer[common] (prop drilling: device (from previewApi))
              - does scale the iframe according to device (+the device around the iframe)
              - renders the actual iframe
    RootBlockAdmin
        - highlights blocks with matching hoveredSiteRoute (with useIFrameBridge)
        - sends SelectComponent on block admin render (using SelectPreviewComponent with useIFrameBridge)
        - sends HoverComponent on block preview hover (using HoverPreviewComponent with useIFrameBridge)

```

### Site: States, Contexts and Components

```
IFrameBridgePreviewPage (src/pages/preview/admin/page.tsx)
  IFrameBridgeProvider
      - receives messages
      - creates context containing:
          - hasBridge: true
          - showOutlines: used for hovering
          - block
          - selectedAdminRoute
          - hoveredAdminRoute
          - sendSelectComponent
          - sendHoverComponent
    BlockPreviewProvider
      - creates PreviewContext[common] containing:
          - previewType: "BlockPreview",
          - showPreviewSkeletons: true,
        PreviewPage
          PageContentBlock
```

## Site Preview

Uses Next.js Preview Mode to live render pages (SSR), optionally with invisible blocks shown.

### iframe messages: admin -> site

    - *none*

### URL: admin -> site

Admin opens I-Frame with {previewSiteUrl}/api/preview to enter Next.js Preview Mode and passes the following parameters:

- path: which pathname to be shown
- includeInvisibleBlocks
- timestamp & hash: is validated to activate Preview Mode -

### iframe messages: site -> admin

    - OpenLink: user clicked an external link and admin should ask the user if it should be opened in a new tab
    - SitePreviewLocation: user navigated in the page and the url changed, admin should update the current url

### Admin: States, Contexts and Components

```
SitePreview: state from Url (get params): path, device, showOnlyVisible
    - has controls for managing path, device, showOnlyVisible
    - handles messages coming from iframe (OpenLink, SitePreviewLocation)
    - handles incoming messages (with useSitePreviewIFrameBridge)
  IFrameViewer[common] (prop drilling: device)
    - does scale the iframe according to device (+the device around the iframe)
    - renders the actual iframe
```

### Site: States, Contexts and Components

```
SitePreviewProvider (only active in Preview Mode)
    - messages SitePreviewLocation on location change (sends message directly using sendSitePreviewIFrameMessage helper)
    - creates PreviewContext containing
        - previewType: "SitePreview",
        - showPreviewSkeletons: false,
    Page (src/pages/[...path]].tsx)
        - ExternalLinkBlock messages OpenLink (sends message directly using sendSitePreviewIFrameMessage helper)
```
