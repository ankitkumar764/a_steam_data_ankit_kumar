# Pull Request 9: Game Catalog, CRUD, & Details Views

## Branch Name
`feature/game-catalog-crud-details`

## Commit Message
`feat: implement interactive game catalog, details, reviews, and crud`

## Summary
* Created the frontend service helper `gameService.js` to wrap Axios requests for games, reviews, system requirements, screenshots, trailers, and similar recommendations.
* Implemented a rich dashboard catalog grid in `Dashboard.jsx` supporting:
  * Advanced search and filters (genre dropdown, price range slider, developer queries).
  * Multiple sorting criteria (price ascending/descending, release date, popularity, alphabetical).
  * Custom styled pagination with page range displays.
* Added role-based user checks using `isAdmin` from the Redux store/local storage profile:
  * Admin accounts can create new game entries using an Add Modal, edit metadata through an Edit Modal, and delete listings via a Confirmation Dialog.
  * Non-admin users can inspect game detail views, media files, and reviews.
* Built a comprehensive Game Details modal utilizing sub-tabs for:
  * **Overview**: Basic credentials, tags, categories, and audit tracking logs.
  * **Media**: Gameplay screenshot attachments and playable trailer videos.
  * **Specs**: Minimum and recommended processor, memory, OS, storage, and graphics specifications.
  * **Reviews**: Interactive section displaying user reviews with rating indicators, and forms to submit, update, or delete comments.
  * **Achievements**: List of achievements with XP rewards and titles.
  * **Similar Games**: Clickable recommendations list that hot-swaps active game details.

## Testing
* Application builds successfully (`npm run build`).
* ESLint checks pass (`npm run lint`).
* Handled React linter synchronous set-state guard warnings by deferring details loading via timeouts.
