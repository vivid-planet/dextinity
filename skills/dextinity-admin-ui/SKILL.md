---
name: dextinity-admin-ui
description: Building or editing admin UI in a project that uses @dextinity/admin and its sibling packages — pages, dashboards, forms and form fields, data grids, toolbars, dialogs, buttons, alerts and snackbars, widgets, layouts, component styling, and icons. Also for translating admin text, formatting numbers and dates with react-intl, deciding where a component's styled parts live, and changing how a Dextinity component looks or behaves through slotProps or the theme. Use even for small UI changes, to build with Dextinity's theme, components, and helpers instead of custom sx/styled CSS, hard-coded values, or Box layouts.
---

# Building admin UIs with @dextinity/admin

`@dextinity/admin` and its sibling packages ship a design system: a theme (spacing,
colors, shadows, typography, breakpoints) and a library of ready-made components. The components
and types are available in the consuming project through the installed packages — import them
directly (e.g. `import { Button, MainContent } from "@dextinity/admin"`).

## Core principle

**Prefer Dextinity's theme values, components, and helpers over custom styling.** Three reasons:

1. **Reviewability.** When styling lives in the theme and in components, the markup stays
   declarative and diffs stay small.
2. **Automatic upgrades.** A project's visual design is often built against a _future_ version of
   the design system. It will not fully match what the installed components and theme produce.
   Expect that difference; it is not a reason to add custom styling to force the match. Use
   the current Dextinity components and tokens as they are: a later library upgrade removes the
   difference on its own, and leaves no hand-written CSS to find and rework.
3. **Consistency.** Every screen built from the same components and tokens looks and behaves the
   same way.

This holds **even when a project's design deliberately differs** from the current library defaults.
Such a difference is a permanent design decision, and no later upgrade removes it. Apply it as the
Customizing section below describes. Add custom styling only when explicitly instructed, or when no
component, prop, or token can produce the result.

## Decision framework

Before writing any styling or markup, work down this list and stop at the first step that applies:

1. **Is there a component for this?** Use it rather than assembling the same thing from
   `Box` + CSS (page structure, cards, toolbars, dialogs, alerts, buttons, …).
2. **Is there a prop for this?** Props apply the correct theme values with no CSS — `elevation`
   on `Paper`, `variant` on `Button`, `spacing` on `Stack`.
3. **Is there a theme value for this?** Read spacing, colors, and shadows from the theme
   instead of hard-coding pixels, hex colors, or shadow strings.
4. **Is there a helper for this?** In a project with `react-intl`, user-facing text, numbers, and
   dates use the i18n helpers rather than hard-coded values.
5. **Only then, custom-style** — with `styled()`, as Styling and theme describes below.

## Styling and theme

### Custom styling: `styled()`, not `sx` or inline `style`

When you do need custom styling, write it with `styled()` from `@mui/material/styles` and give the
result a name that says what it is. Styling in `sx` props or inline `style` mixes the look into the
markup. You then read layout, styling, and logic in the same lines, and the diff is harder to
follow.

```tsx
// Avoid — sx and inline style mixed into the markup
<Box sx={{ padding: 2, backgroundColor: "#fff", borderRadius: 1 }} style={{ marginTop: 16 }}>
    {children}
</Box>;

// Prefer — a named styled component, styling separated from markup
const Panel = styled("div")`
    padding: ${({ theme }) => theme.spacing(2)};
    background-color: ${({ theme }) => theme.palette.background.paper};
`;

<Panel>{children}</Panel>;
```

### Spacing and color: theme tokens, not hard-coded values

Read spacing and color from the theme instead of typing pixels and hex codes, so a theme change
reaches every screen at once. Dextinity's spacing base is `5px` — `theme.spacing(1)` is `5px`,
`theme.spacing(2)` is `10px` — and it takes up to four arguments for top, right, bottom, and left.

```tsx
// Avoid — hard-coded pixels and colors
const Header = styled("header")`
    padding: 16px 24px;
    color: #1a1a1a;
    border-bottom: 1px solid #e0e0e0;
`;

// Prefer — spacing and palette tokens from the theme
const Header = styled("header")`
    padding: ${({ theme }) => theme.spacing(2, 3)};
    color: ${({ theme }) => theme.palette.text.primary};
    border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;
```

Use the palette tokens — `primary`, `secondary`, `error`, `warning`, `info`, `success`,
`grey[50…900]`, `divider`, `text`, `background`, `action` — rather than naming raw colors.

### Elevation and shape: `elevation` and `square`, not manual CSS

Shadows and corner radius come from props on `Paper` and `Card`, not hand-written CSS. Dextinity defines
four shadow elevations (1–4); higher values are `none`. The `elevation` prop selects one, and the
`square` prop toggles the rounded corner. Read `theme.shadows[n]` directly only inside a `styled()`
component that cannot be a `Paper` or `Card`.

```tsx
// Avoid — manual shadow and radius on a plain element
<div style={{ boxShadow: "0 0 8px rgba(0,0,0,0.1)", borderRadius: 4 }}>{children}</div>

// Prefer — a Paper carrying the theme's elevation and shape
<Paper elevation={2}>{children}</Paper>
```

### Typography: `<Typography variant>`, not manual font CSS

Render text through `<Typography>` with a `variant` rather than setting font size, weight, and line
height by hand. The variant carries the type scale and its responsive steps, so headings and body
text stay in proportion across breakpoints. Available variants: `h1`–`h6`, `body1`, `body2`,
`subtitle1`, `subtitle2`, `caption`, `overline`, `list`, `listItem`, `button`.

```tsx
// Avoid — font properties set by hand
const Title = styled("h2")`
    font-size: 20px;
    font-weight: 600;
    line-height: 26px;
`;

// Prefer — a Typography variant from the type scale
<Typography variant="h4">{title}</Typography>;
```

## Organizing styled components

By default, define a component's styled parts at the bottom of its own file, below the component
that uses them. A reader then meets what the component renders before how it looks:

```
imports → types → component → styled components
```

When a file grows hard to read, refactor the component itself first. Split it into smaller
components and compose them, and let each keep its own styled parts at the bottom. Move styles to a
separate `*.sc.ts` sibling only when someone asks you to, or when the styles grow but you cannot
split the component logically. A `*.sc.ts` file is private to its equally-named component
(`FooButton.sc.ts` belongs to `FooButton.tsx`). Do not import one component's `*.sc.ts` from
another: that couples them through styling neither owns.

When several components use the same styled component, it is no longer a styled part of any one of
them. Promote it to its own reusable component: one export per file, named exactly as that
export so it is easy to find, e.g. `SpecialButton.ts` exporting
`export const SpecialButton = styled(Button)`. Group several small related ones into a single
generically-named file only when explicitly instructed.

## Internationalization

Dextinity recommends `react-intl` (the default). When a project uses it, its user-facing text,
numbers, and dates use the `react-intl` helpers instead of hard-coded values.

### Text: `<FormattedMessage>` and `useIntl`, not literals

Use `<FormattedMessage>` wherever a `ReactNode` fits. String attributes (`alt`, `placeholder`,
`title`, `aria-*`) take a string, not a `ReactNode`, so translate those with
`useIntl().formatMessage()`.

```tsx
// Avoid — hard-coded user-facing text
<Button>Save</Button>;
<img src={src} alt="Preview" />;

// Prefer — translate through react-intl (formatMessage for string attributes)
import { FormattedMessage, useIntl } from "react-intl";

<Button>
    <FormattedMessage id="product.save" defaultMessage="Save" />
</Button>;

const intl = useIntl();
<img src={src} alt={intl.formatMessage({ id: "product.previewAlt", defaultMessage: "Preview" })} />;
```

Interpolate runtime values with `values` rather than concatenating strings, and pluralize with ICU
syntax rather than by hand:

```tsx
<FormattedMessage id="product.greeting" defaultMessage="Welcome, {name}" values={{ name }} />;

// # is the formatted count
<FormattedMessage id="product.cartCount" defaultMessage="{count, plural, one {# item in cart} other {# items in cart}}" values={{ count }} />;
```

### Numbers: `<FormattedNumber>` / `intl.formatNumber()`

Format plain numbers, currency, and percentages through `react-intl` so grouping, decimals, and
symbols follow the active locale rather than a hand-written format.

```tsx
// Avoid — raw or hand-formatted numbers (no locale grouping, decimals, or symbol)
<span>{count}</span>;
<span>{`${price.toFixed(2)} €`}</span>;
<span>{`${Math.round(ratio * 100)}%`}</span>;

// Prefer — locale-aware grouping and decimals, currency, and percent
<FormattedNumber value={count} />;
<FormattedNumber value={price} style="currency" currency="EUR" />;
<FormattedNumber value={ratio} style="percent" />;
```

### Dates and times: `<FormattedDate>` / `<FormattedTime>`

Render dates and times through `react-intl` so they follow the active locale rather than a
hand-built format.

```tsx
// Avoid — hand-built date and time strings
<span>{date.toLocaleDateString("en-US")}</span>;
<span>{date.toLocaleTimeString("en-US")}</span>;

// Prefer — locale-aware formatting
<FormattedDate value={date} year="numeric" month="long" day="numeric" />;
<FormattedTime value={date} />;
```

## Layout

### Arranging elements: `Stack` and `Grid`, not `Box` with margins

To arrange children and the space between them, use `Stack` or `Grid` from `@mui/material`. `Stack`
gives one-dimensional flow with a `spacing` prop; `Grid` gives responsive columns with `spacing` and
`size`. Both apply spacing from the theme through props, so you never hand-write the gaps. Use `Box`
with manual `margin` only when neither fits.

Layout of this kind is fine inline through these props and needs no `styled()`. Anything beyond it
(padding inside an element, background, borders, and other visual styling) uses the theme and
`styled()`, as in the styling section above.

```tsx
// Avoid — Box with hand-written margins between children
<Box>
    <Widget />
    <Box sx={{ marginTop: 16 }}>
        <Widget />
    </Box>
    <Box sx={{ marginTop: 16 }}>
        <Widget />
    </Box>
</Box>;

// Prefer — Stack with spacing from the theme
<Stack spacing={4}>
    <Widget />
    <Widget />
    <Widget />
</Stack>;
```

```tsx
// Avoid — manual flex and width math for a responsive two-column layout
<Box sx={{ display: "flex", flexWrap: "wrap" }}>
    <Box sx={{ width: "50%" }}>
        <Widget />
    </Box>
    <Box sx={{ width: "50%" }}>
        <Widget />
    </Box>
</Box>;

// Prefer — Grid with responsive size and spacing from the theme
<Grid container spacing={4}>
    <Grid size={{ xs: 12, md: 6 }}>
        <Widget />
    </Grid>
    <Grid size={{ xs: 12, md: 6 }}>
        <Widget />
    </Grid>
</Grid>;
```

For responsive behavior, pass a per-breakpoint object to these props (`size` on `Grid`,
`direction` on `Stack`). Inside a `styled()` component, use `theme.breakpoints` for media
queries.

Do not use `Grid` or `Stack` to lay out form fields. Dextinity stacks them vertically at full width,
grouped with `FieldSet` or `FormSection`, described under Components below.

`sx` is fine here for the occasional layout property that no `Stack` or `Grid` prop covers, such as
`flexGrow`. On your own markup it is not for visual styling, which goes through `styled()`.

### Page structure: `MainContent`, `Toolbar`, and their parts

Wrap a page's body in `MainContent` rather than a hand-padded `Box` — it applies the standard
page padding and can fill the height with `fullHeight`. Build the action bar from `Toolbar` and
its parts instead of assembling one from a flex row:

- `ToolbarTitleItem` holds the page title, `ToolbarActions` the action buttons; `ToolbarItem` is
  the generic slot for anything else.
- `FillSpace` is a flexbox spacer that fills the free space, moving the elements after it to the
  end.

```tsx
// Avoid — hand-built toolbar and padded container
<Box sx={{ display: "flex", padding: 16 }}>
    <Typography variant="h4">{title}</Typography>
    <Box sx={{ marginLeft: "auto" }}>
        <Button>{addLabel}</Button>
    </Box>
</Box>;

// Prefer — Toolbar parts and MainContent
<Toolbar>
    <ToolbarTitleItem>{title}</ToolbarTitleItem>
    <FillSpace />
    <ToolbarActions>
        <Button>{addLabel}</Button>
    </ToolbarActions>
</Toolbar>;
<MainContent>{children}</MainContent>;
```

When a page renders inside a Dextinity navigation `Stack` (nested master–detail views), use the
`StackMainContent` and `StackToolbar` variants instead: they render only for the active stack
level, so nested pages do not show duplicate toolbars.

### Full-height content: `fullHeight` and `FullHeightContent`

Content that should fill the viewport and scroll inside itself — most often a `DataGrid` — needs a
height-bounded parent. Without one it grows the whole page instead of scrolling. Set that height
through the page structure, not a hand-written `height` that has to track the header and toolbar
offset:

- When the grid is the page's direct content, add `fullHeight` to `MainContent` or
  `StackMainContent`.
- When the grid sits inside `RouterTabs` or other content instead of directly in `MainContent`,
  wrap it in `FullHeightContent`, which bounds the height at that level.
- When the grid holds few rows, give the `DataGrid` the `autoHeight` prop instead and skip
  `fullHeight`.

```tsx
// Avoid — a hand-set height that has to track the header and toolbar offset
<MainContent>
    <Box sx={{ height: "calc(100vh - 200px)" }}>
        <DataGrid />
    </Box>
</MainContent>;

// Prefer — fullHeight for a grid that is the page's direct content
<StackMainContent fullHeight>
    <DataGrid />
</StackMainContent>;

// Prefer — FullHeightContent for a grid nested inside tabs
<MainContent>
    <RouterTabs>
        <RouterTab path="" label={label}>
            <FullHeightContent>
                <DataGrid />
            </FullHeightContent>
        </RouterTab>
    </RouterTabs>
</MainContent>;
```

## Components

### Containers and widgets: `FieldSet`, `FormSection`, and themed `Card`, not `Box`

To group related content, use a container component instead of a `Box` with hand-set padding,
borders, and a title. `FieldSet` (from `@dextinity/admin`) is a collapsible titled panel — wrap a page
form's fields in it. Inside a dialog or sidebar, group fields with `FormSection` instead, a lighter
titled section with a divider. For a dashboard widget, use `DashboardWidgetRoot` when the project
has `@dextinity/cms-admin`, rather than building a container by hand. When you compose one yourself,
build it from `Card` (with `CardHeader` and `CardContent`) or `Paper`, with `Typography` for text
and `Grid` for layout. Dextinity themes `Card`, `Paper`, and `Typography`, so they carry the right
elevation, radius, and type scale without custom CSS. `Grid` takes its spacing from the theme.
`Card`, `CardHeader`, `CardContent`, `Paper`, `Typography`, and `Grid`
come from `@mui/material`; `FieldSet` and `FormSection` from `@dextinity/admin`.

```tsx
// Avoid — a Box hand-styled into a titled, bordered panel
<Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, padding: 2 }}>
    <Typography variant="h4">{title}</Typography>
    {children}
</Box>;

// Prefer — FieldSet groups content under a title (collapsible by default)
<FieldSet title={title} supportText={supportText}>
    {children}
</FieldSet>;

// Prefer — a dashboard widget from @dextinity/cms-admin's ready-made container
<DashboardWidgetRoot header={title}>{children}</DashboardWidgetRoot>;
```

### Buttons: `Button` variants and action buttons, not hand-styled buttons

Give `Button` a `variant` rather than styling a button by hand. The variant controls the button's
color, which is why `Button` deprecates MUI's `color` prop. The variants are `primary`, `secondary`,
`outlined`, `destructive`, `success`, `textLight`, and `textDark`. For common actions, prefer the
specialized buttons: `SaveButton`, `CancelButton`, `DeleteButton`, and `OkayButton` each carry a
suitable variant, an icon, and a translated label. `SaveButton` is a `FeedbackButton`, so it already
shows loading, success, and error feedback. Use `FeedbackButton` for other asynchronous actions, and
`CopyToClipboardButton` to copy text with a confirmation.

```tsx
// Avoid — a hand-styled button, and a Save button rebuilt from a plain Button
<button style={{ background: "#c00", color: "#fff" }} onClick={onDelete}>
    Delete
</button>;
<Button variant="primary" startIcon={<Save />}>
    Save
</Button>;

// Prefer — specialized buttons carry variant, icon, and label (SaveButton adds save feedback)
<DeleteButton onClick={onDelete} />;
<SaveButton onClick={onSave} />;
```

### Date and time: pickers from `@dextinity/admin`, not raw inputs

Use the picker components rather than a plain text input or an MUI picker configured by hand.
`@dextinity/admin` exports `DatePicker`, `DateTimePicker`, and `TimePicker` (with `DateRangePicker`
and `DateTimeRangePicker` for ranges), plus `DatePickerField` and siblings for use as Final Form
fields. Each picker manages its own value format, so you never parse or format a date by hand.
`DatePicker`, for example, reads and writes an ISO `YYYY-MM-DD` string.

```tsx
// Avoid — a plain text input used as a date field
<input type="text" value={value} onChange={(event) => onChange(event.target.value)} />;

// Prefer — a DatePicker working with ISO date strings
<DatePicker value={value} onChange={onChange} />;

// The pickers need a LocalizationProvider at the app root, set up once
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
    {children}
</LocalizationProvider>;
```

### Feedback and overlays: `Alert`, `Loading`, `Dialog`, `Tooltip`, not hand-built ones

Show status, loading, dialogs, and tooltips through the components rather than assembling them from
`div`s and state. `Alert` takes a `severity` (`info`, `warning`, `error`, `success`), a `title`, an
`action`, and an `onClose`. `Loading` renders the standard spinner. Its `behavior` prop (`auto`,
`fillParent`, `fillParentAbsolute`, `fillPageHeight`) sets whether it renders inline, fills its
parent, or fills the page. Use `Dialog` and `Tooltip` from `@dextinity/admin` — Dextinity's own
wrappers, not MUI's directly. For a confirmation that disappears on its own, call `showSnackbar()`
from
`useSnackbarApi()` with a snackbar element: Dextinity's `UndoSnackbar`, or a MUI `Snackbar` wrapping
an `Alert`. Mount `SnackbarProvider` near the app root.

```tsx
// Avoid — a hand-built alert box and a hand-built spinner
<div style={{ background: "#fdecea", padding: 12 }}>{errorMessage}</div>;
{
    loading && <div className="spinner" />;
}

// Prefer — Alert shows severity; Loading renders the standard spinner
<Alert severity="error">{errorMessage}</Alert>;
{
    loading && <Loading />;
}
```

### Icons: `@dextinity/admin-icons`, not ad-hoc SVGs

Take icons from `@dextinity/admin-icons` rather than importing SVG files or an arbitrary
icon from another set, so they match the design system and stay consistent. Each icon is a named
export built on MUI's `SvgIcon`. Size it with the `fontSize` prop (`small`, `medium`, `large`) and
color it with the `color` prop, because the icons use `currentColor`.

```tsx
// Avoid — an imported SVG file, or an arbitrary icon from another set
import deleteIcon from "./delete.svg";

<img src={deleteIcon} width={16} alt="" />;

// Prefer — a named icon from the Dextinity set, sized and colored through props
import { Delete } from "@dextinity/admin-icons";

<Delete fontSize="small" color="error" />;
```

## Customizing an existing Dextinity Admin component

When a Dextinity Admin component needs to look or behave differently than its defaults, customize it
through the mechanisms it already supports. These are the component's own props, a per-slot
`slotProps` prop, and theme-level `styleOverrides` and `defaultProps`. A _slot_ is a named inner element of a
component. Only `root` is universal, and a component lists its own slot names on its props type.
Which mechanism you pick depends on whether you change behavior or appearance.

### Behavior

Start with the component's own props. To reach an inner element, use `slotProps`: it forwards props
to a named slot, letting you override that slot's props. This configures the component rather than
restyling it.

```tsx
// Override an inner slot's props — here, disable the button behind the content
<ContentOverflow slotProps={{ clickableContent: { disabled: true } }}>{children}</ContentOverflow>
```

### Appearance

To change how a Dextinity component looks, configure the theme rather than the component itself.
`createDextinityTheme`'s `components` map takes a `DextinityAdmin*` key, and MUI components use
their `Mui*` key. `styleOverrides` restyles a component's slots, and `defaultProps` sets default
prop values, such as swapping an icon through `iconMapping`. Both apply to every instance, so one
entry carries the difference across the project.

Styling a single instance directly is the rare exception — for a change specific to that one
instance, or when someone explicitly tells you to. Use `sx` for small layout and `styled()` for other
custom styling, with `slotProps.<slot>.sx` to reach a slot. A difference that recurs belongs in the
theme, not repeated on each instance.

```tsx
// Avoid — a styled() wrapper for a design difference that belongs in the theme
const HighlightedContentOverflow = styled(ContentOverflow)`
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

// Prefer — configure the theme, applied to every instance
const theme = createDextinityTheme({
    components: {
        DextinityAdminContentOverflow: {
            styleOverrides: {
                root: ({ theme }) => ({ backgroundColor: theme.palette.grey[50] }),
            },
        },
    },
});
```
