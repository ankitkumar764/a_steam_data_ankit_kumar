# Pull Request 4: Axios API Layer

## Branch Name
`feature/api-layer`

## Commit Message
`feat: setup axios api layer`

## Summary
* Installed `axios` in the frontend client.
* Created the centralized API service wrapper in `src/services/api.js` pointing to the backend API base URL.
* Implemented Request Interceptor to automatically retrieve JWT token from local storage and append it to `Authorization` headers.
* Implemented Response Interceptor to intercept token expiration/invalid errors (`401 Unauthorized`) and automatically clear storage and trigger appropriate redirect handlers. Standardized all server error formatting.

## Testing
* Application builds successfully (`npm run build`).
* ESLint checks pass (`npm run lint`).
* API configuration and interceptor logic validated.
