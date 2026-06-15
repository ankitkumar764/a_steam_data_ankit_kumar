# Pull Request 8: Dashboard Layout

## Branch Name
`feature/dashboard-layout`

## Commit Message
`feat: create sidebar, navbar and dashboard shell layouts`

## Summary
* Developed the Sidebar component `Sidebar.jsx` comprising brand headers, navigation links with active state indicator styling, and a dispatch logout button.
* Developed the Navbar component `Navbar.jsx` containing search field templates, profile info/role listings, notifications, and settings controls.
* Constructed the layout shell `MainLayout.jsx` combining Sidebar and Navbar and rendering sub-routes in a central scrolling workspace via `<Outlet />`.
* Nested all protected views inside the `MainLayout` shell inside `AppRoutes.jsx`.

## Testing
* Application builds successfully (`npm run build`).
* ESLint checks pass (`npm run lint`).
* Page wrapping, navigation changes, and layout styling verified.
