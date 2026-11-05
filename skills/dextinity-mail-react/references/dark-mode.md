# Dark Mode

What mail clients change in dark mode, and the techniques tested against them. After each fix, test the mail again in every client in the table below: a fix for one client can break another.

## Client Behavior

| Client                    | Changes in dark mode                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Gmail iOS                 | Background and text colors; leaves background images                                                                  |
| Outlook on the web        | Background and text colors; dark backgrounds get lighter; leaves background images                                    |
| Outlook iOS               | Background and text colors; dark backgrounds get lighter; leaves background images                                    |
| Outlook Mac               | Background colors; leaves background images                                                                           |
| Yahoo Mail on the web     | Light background colors; leaves background images                                                                     |
| Gmail Android             | Light background colors on some phones; inverts images with few colors that it shows at about `64px` or less per side |
| Classic Outlook (Windows) | Inverts background and text colors, dark backgrounds included; ignores CSS background images; leaves VML fills        |

## Keep a Background Color

Set the color twice: as `background-color`, and as a `background-image` of a solid PNG in that color. Then the color stays in Gmail iOS, Outlook on the web, Outlook Mac, Outlook iOS and Yahoo Mail on the web. It does not stay in classic Outlook, or on some Gmail Android phones.

- Use a `100×100` px PNG. Gmail Android inverts a solid background image whose file is `8px` or less on one side, such as a `1×1` px PNG.
- Set both properties on every element that paints the background, such as the inner `<table>` of a section too. Otherwise Gmail iOS, Outlook iOS and Outlook on the web paint the dark color of that element over the image.
- On an MJML section, set `background-color` and `background-image` with `!important` in an inlined style. Otherwise the `background` shorthand that MJML writes comes after the image and removes it.
- Gmail Android also inverts the background image, whatever its file size, of a box that it shows at about `64px` or less per side. For a small box, put the color into the content image instead (see [Keep a Logo Readable](#keep-a-logo-readable)).
- Use this technique behind images only, not behind text. Outlook iOS turns dark text on a light background light, and Gmail iOS and Outlook on the web turn light text on a dark background dark. In both cases the text disappears.
- Name the PNG after its color, such as `001e50-100x100.png` for `#001e50`. When the theme color changes, replace the image too.

## Keep All Colors

`<meta name="color-scheme" content="light only">` stops Gmail iOS and Apple Mail (iOS and macOS) from changing the colors of the mail in dark mode. Gmail Android ignores it. React 19 removes a `<meta>` element that is rendered in the head, so add it as raw HTML, with an `MjmlRaw` in the `head` of `MjmlMailRoot`.

## Keep a Logo Readable

- Put the light background of a dark logo into the image file. When the logo and its background are separate, some Gmail Android phones invert only one of them, even with the solid PNG from [Keep a Background Color](#keep-a-background-color). These phones may also invert the whole image. Then the logo and its background change together, so they keep their contrast.
- On a dark section, put a background image in the section color behind the logo only, not behind the whole section. Gmail iOS and Outlook on the web lighten the section and darken its text, so a background image behind the whole section leaves dark text on a dark background.
- Gmail Android still inverts a logo with few colors that it shows at about `64px` or less per side. Widening the logo image avoids this, but it also widens a background image behind the logo whose size comes from the logo. No solution for both is known.

## Keep a Line Visible

In dark mode, several clients make a light content background dark, but leave a dark line dark, making the line difficult to see. This happens to a line drawn as a background color, as `MjmlDivider` and `HtmlDivider` do. Draw the line as a border instead:

```html
<table role="presentation" width="100%" style="border-collapse: separate">
    <tr>
        <td
            class="line"
            style="height: 0; font-size: 0; line-height: 0; border-top: 1px solid #001e50; color: #001e50; background-color: #cccccc"
        ></td>
    </tr>
</table>
```

- Give the cell a light `background-color`. Only then does Gmail Android make the border light enough to see. The border lies over this background, so the background is not visible. Set `border-collapse: separate` on the table: MJML sets `border-collapse: collapse` on all tables, and with it, Gmail Android ignores the background.
- A line can need the same color as a text, such as the underline of a text button drawn as a border for a larger gap than `text-decoration: underline` gives. In dark mode, Outlook Mac makes the text light, but leaves the border dark. Set `color` of the line cell to the color of the text, and add this rule, which gives the border that color:

    ```css
    [data-ogsb] .line,
    [data-ogsc] .line {
        border-top-color: currentColor !important;
    }
    ```

## Classic Outlook

Classic Outlook for Windows ignores CSS background images, so the background-image techniques above fail there. The `background-url` attribute of an MJML section draws a VML background, but that VML moves the content of the section. Draw the background behind the logo as a VML shape with `fillcolor` (a `v:roundrect` for rounded corners), and declare the shape `1px` smaller in width and height than the size it must have (see "No CSS `border-radius` in Outlook" in `SKILL.md`). Put the image in a `v:textbox`, wrap the shape in one `<!--[if mso]>…<![endif]-->` comment, and hide the HTML version with `<!--[if !mso]><!-->…<!--<![endif]-->`. Classic Outlook does not change VML fills in dark mode. Do not set `line-height: 0` on the element that holds the image in the `v:textbox`: classic Outlook then cuts off the top of the image.
