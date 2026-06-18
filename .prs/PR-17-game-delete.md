# Pull Request 17: Game Deletion & Archiving Actions

## Branch Name
`feature/pr-17-game-delete`

## Commit Message
`feat: add permanent deletion and soft delete buttons`

## Summary
* Implemented deletion dialog interface supporting permanent delete and soft-delete/archive functions.
* Restricted these actions to administrator role accounts (`isAdmin`).
* Added UI visual indicators for deleted/archived states in the dashboard.
* Connected actions to backend delete and archive API endpoints.

## Testing
* Verified soft-deleted entries are marked as archived.
* Confirmed permanent deletion successfully removes entries from the catalog.
* Checked responsive dialog styles.
