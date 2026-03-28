# Connectly

## Current State
- NotificationsPage has a Follow button in NotificationItem for 'follow' type notifications, but it is a static button with no toggle state
- `followed` state exists only locally inside SearchPage component
- Stories from other users (USERS[0-5]) are in STORIES_INITIAL and show in the home stories bar
- No shared follow state across the app

## Requested Changes (Diff)

### Add
- App-level `followedUsers` state (Set<number>) initialized with some default followed IDs (e.g. 1, 3, 5)
- Pass `followedUsers` and `setFollowedUsers` to NotificationsPage and NotificationItem
- Pass `followedUsers` and `setFollowedUsers` to SearchPage (replace local `followed` state)
- Stories in HomePage filtered to show: current user's story + stories from followed users
- When user follows from notifications, that person's story appears in home stories bar immediately

### Modify
- NotificationItem: Follow button should toggle between "Follow" and "Following" based on followedUsers state, clicking toggles follow
- HomePage `visibleStories`: filter to show `s.isCurrentUser || followedUsers.has(s.user.id)` (plus keep 24h expiry check)
- SearchPage: use shared `followedUsers`/`setFollowedUsers` props instead of local state
- App: add `followedUsers` state, pass to relevant pages

### Remove
- Local `followed` state from SearchPage (replaced by shared prop)

## Implementation Plan
1. Add `followedUsers` state in App component (Set<number>, default: new Set([1, 3, 5]))
2. Pass as prop to HomePage, NotificationsPage, SearchPage
3. Update NotificationItem to accept and use followedUsers/setFollowedUsers
4. Update SearchPage to accept followedUsers/setFollowedUsers as props
5. Filter visibleStories in HomePage to only show current user + followed users
6. Ensure all TypeScript types are updated
