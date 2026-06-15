# Pull Request 7: Protected Routes

## Branch Name
`feature/protected-routes`

## Commit Message
`feat: implement auth protected route guards`

## Summary
* Developed `ProtectedRoute.jsx` route guard validating client-side user sessions (checking Redux active JWT `token`).
* Wrapped private dashboard Views (Dashboard, Users, Profile, Settings, Analytics) inside the `ProtectedRoute` guard wrapper within `AppRoutes.jsx`.
* Wired a global listener in `App.jsx` responding to `auth-unauthorized` events (from Axios response interceptors) to dispatch forced logouts, clear cached credentials, and redirect to the Login view automatically on token expiration.

## Testing
* Application builds successfully (`npm run build`).
* ESLint checks pass (`npm run lint`).
* Session expiry cleanups and unauthorized route redirects verified.
