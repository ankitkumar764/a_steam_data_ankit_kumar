# Pull Request 5: Authentication Pages UI

## Branch Name
`feature/auth-ui`

## Commit Message
`feat: create login and register views`

## Summary
* Installed `formik` and `yup` for form validation.
* Developed Login page layout in `src/pages/Login.jsx` using Material UI text fields and customized Tailwind classes. Implemented validation checking matching backend email format requirements.
* Developed Register page layout in `src/pages/Register.jsx` using matching styles. Implemented validation checking ensuring minimum password length and matching passwords.
* Structured routing links between Login and Register views.

## Testing
* Application builds successfully (`npm run build`).
* ESLint checks pass (`npm run lint`).
* Dynamic validation messaging and show/hide password helpers function correctly.
