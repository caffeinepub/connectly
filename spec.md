# Connectly

## Current State
App has a ProfilePage with follower/following counts shown as numbers. Stories bar shows stories from followed users only, with like/comment/share in StoryViewer. Stories from other users exist in STORIES_INITIAL but only followed users' stories are shown.

## Requested Changes (Diff)

### Add
- **Followers/Following List Modal on Profile Page:** Tapping "Followers" or "Following" count opens a modal/sheet listing those users with avatar, name, username, and a Follow/Unfollow button.
- **Other person's story visible:** In the Stories bar on Home, show ALL non-expired stories (not just followed users) — but visually distinguish followed vs non-followed (e.g., grey ring for non-followed). When tapping any story, the StoryViewer opens with like, comment, share options (already implemented in StoryViewer).

### Modify
- ProfilePage: Make Followers and Following counts clickable buttons that open a modal listing mock users.
- StoriesBar: Remove the `followedUsers` filter so all other users' stories show. Keep followed users with colored gradient ring, non-followed with grey ring.

### Remove
- Nothing removed.

## Implementation Plan
1. In ProfilePage, wrap Followers and Following stats in clickable buttons.
2. Add a Dialog/Sheet showing a list of mock users (from USERS array) for followers and following.
3. Each user in the list has avatar, name, username, and Follow/Unfollow button (using followedUsers state).
4. In StoriesBar (around line 1873), remove the `followedUsers.has(s.user.id)` filter so all users' stories are visible.
5. In the story avatar ring, use gradient for followed users and grey for non-followed.
