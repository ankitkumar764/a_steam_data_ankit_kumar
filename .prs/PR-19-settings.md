# Pull Request 19: Settings and Connection Verification

## Branch Name
`feature/pr-19-settings`

## Commit Message
`feat: create system settings and api connection tester`

## Summary
* Developed System Settings interface for custom configurations (e.g., API url, pagination limits).
* Built a live API connection tester that pings the backend engine and returns visual status indicators.
* Provided connection latency reports on the screen.
* Saved custom settings options persistently using browser local storage.

## Testing
* Tested API connection check with both valid and invalid base URLs.
* Confirmed settings preferences persist across browser reloads.
* Linter checks passed successfully.
