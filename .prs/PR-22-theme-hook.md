# Pull Request 22: Theme Selection Context & Custom Hook

## Branch Name
`feature/pr-22-theme-hook`

## Commit Message
`feat: create custom theme toggle hook`

## Summary
* Created ThemeContext and `useTheme` custom hook to handle global UI theme switching (dark/light modes).
* Integrated theme provider in the main wrapper root component.
* Synchronized theme changes with document attributes to apply CSS variable mappings globally.
* Saved theme preferences in browser localStorage.

## Testing
* Verified mode changes update CSS styles dynamically without screen refreshes.
* Confirmed user theme preferences persist across sessions.
