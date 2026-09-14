---
title: Packages/Tools
sidebar_position: 4
---

### Dextinity Package Overview

A Dextinity application, at a minimum, consists of the following packages:

- **Admin:** The user interface for managing the data and content of your application
- **API:** Stores the data of your application and provides APIs for Admin, Site, and potentially others
- **Site:** The frontend that renders the content of your application as a website

---

## API {#apiPackage}

### @dextinity/cms-api

Used to integrate Dextinity into a NestJS application.

## Admin {#adminPackage}

The Admin's user interface is built using [MUI](https://mui.com/), [react-final-form](https://final-form.org/react), [react-router](https://reactrouter.com/), and the `@dextinity/admin` library, which provides commonly used components and tools for creating forms, UI, and data visualization.

### @dextinity/admin

:::note

Documentation and usage examples of the individual components and tools from `@dextinity/admin` and its accompanying packages can be found in our Storybook: [Storybook](https://cms-storybook.dextinity.com/)

:::

This is the core package that is used to build your Admin. Together with its accompanying packages `@dextinity/admin-*`, it provides components and tools for creating and managing the Admin's UI, routing, forms, and more.

Components for use in forms generally have an accompanying component, optimized for use with [react-final-form](https://final-form.org/react), indicated by the component's name being prefixed with "FinalForm".

Navigation and routing are managed by [react-router](https://reactrouter.com/).

Using the `createDextinityTheme` function, you can create a theme that contains all the default styling for your admin. Custom options and styles can be added the same way as with MUI's [createTheme](https://mui.com/material-ui/customization/theming/#api) function. The resulting theme can simply be used with MUI's [ThemeProvider](https://mui.com/material-ui/customization/theming/#theme-provider).

#### @dextinity/admin-icons

Provides a set of icon components, based on MUI's [SvgIcon](https://mui.com/material-ui/icons/#svgicon) component.
A complete list of the admin-icons can be found here: [Storybook](https://cms-storybook.dextinity.com/?path=/story/docs-icons-list--page)

<!--TODO: The link will change to “https://cms-storybook.dextinity.com/?path=/story/docs-icons-all-icons--page“ when merged: -->

#### @dextinity/admin-rte

Provides a customizable rich-text-editor component to allow advanced formatting of text.

#### @dextinity/admin-date-time

Provides components for selecting date and time or a range or combination of date and time.

#### @dextinity/admin-color-picker

Provides a component for selecting colors in forms, built with react-final-form.

## Site {#sitePackage}

### @dextinity/site-nextjs

Used to integrate Dextinity into a Next.js application.
