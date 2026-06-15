# Pull Request 3: Redux Foundation

## Branch Name
`feature/redux-foundation`

## Commit Message
`feat: setup redux foundation`

## Summary
* Installed `@reduxjs/toolkit` and `react-redux` in the frontend client.
* Configured the centralized Redux store in `src/store/index.js` using `configureStore`.
* Created a dummy verification slice `dummySlice.js` with simple counter actions (`increment` and `decrement`).
* Wrapped the App component inside Redux `Provider` in `main.jsx` and injected the store.

## Testing
* Application builds successfully (`npm run build`).
* ESLint checks pass (`npm run lint`).
* Provider integration validated.
