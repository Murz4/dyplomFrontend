### `npm run dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

Your app is ready to be deployed!

See the section about [CLI](https://vitejs.dev/guide/#command-line-interface) for more information.

# Folder structure:

## src/common

There is everything that can be used in several modules. If some functionality is used within several modules, it or you ends up in a module above or in a common module.

## src/common/components

This folder is used to store common components that can be used on different pages or in different parts of the project.

## src/common/hooks

Serves to store custom hooks, which can contain logic and state that are used in different parts of the application.

## src/common/types

Used to store custom data types

## src/common/utils

Designed to store utilitarian functions and auxiliary tools. These functions typically perform repetitive tasks such as data processing, validation, formatting, and other operations, and they can be reused across different components

## src/modules

Folder where we group all files related to the same feature (here, the authentication as "auth"), instead of splitting the "auth" code everywhere, it is now centralized into a single folder. Modules can be nested.

## /src/modules/auth

Everything related to the authentication and authorization.

## /src/modules/auth/api

Serves to store files related to the interaction between the client side and the server when working with authentication and authorization.

## /src/modules/auth/components

Designed to store components related to authentication and authorization functionality in the application. Components such as login forms, registration forms, password recovery forms, as well as interface elements related to user profile and access control are located here.

## src/pages

The folder is used only for pages, at least for UI components that are used only on this page.

## /src/stylesheets

Used to store styles that apply to the entire application, also for global CSS variables, styles for UI libraries, mixins
