# Pull Request 6: Authentication Redux Integration

## Branch Name
`feature/auth-redux`

## Commit Message
`feat: integrate login and register API with redux`

## Summary
* Implemented `authSlice.js` containing asynchronous thunks `loginUser`, `registerUser`, and `logoutUser` leveraging Axios API calls.
* Wired state persistence of `token` and `user` profile data to local storage on successful login.
* Registered the `auth` reducer in the global Redux store (`store/index.js`).
* Refactored `Login.jsx` and `Register.jsx` to dispatch login/register thunks and redirect on successful operations.
* Bound loading indicators to form submit buttons, and rendered dynamic server error alert bars.

## Testing
* Application builds successfully (`npm run build`).
* ESLint checks pass (`npm run lint`).
* Interceptors, state updates, and loading behaviors verified.
