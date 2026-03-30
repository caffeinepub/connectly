# Connectly

## Current State
Chat page has a basic conversation list and message view with: conversation search, online status, quick emoji bar, typing animation, auto-reply, message reactions (hover to react), read receipts, WhatsApp-style gradient bubbles.

Message type currently has: id, text, sent, time, reactions[], read.

The ChatPage function is at line ~4973 in App.tsx and ends around line 5520.

## Requested Changes (Diff)

### Add
- **Block user** in chat header (⋯ more options menu)
- **Reply to message** — long press or swipe/button on message to reply, shows quoted message above input
- **Forward message** — option on message context menu to forward to another conversation
- **Delete for you** — removes message from local state
- **Unsend** — removes sent message (mark as unsent)
- **Save message** — bookmark/star a message
- **Pin message** — pin a message shown at top of chat
- **Add sticker** — sticker panel with basic emoji stickers
- **Effects** — message effect options (hearts, confetti, etc.) with small visual indicator
- **Camera** — camera icon in input bar opens a mock camera capture UI
- **Voice recorder** — microphone icon, hold to record, shows waveform animation, sends voice message bubble
- **Gallery/Photo** — image icon in input bar to select/send a gallery image (mock)
- **Remix** — remix button on received messages (like react with remix icon)
- **Post send & receive** — ability to send a "post card" in chat and receive post cards (shown as mini post card bubble)
- **Notes** feature — dedicated Notes button in chat header or input area that opens a Notes modal with 3 sub-options:
  - 🎵 **Song** — search/pick a song to share as a note
  - 📝 **Note** — write a text note to share
  - 📍 **Location** — share a location pin as a note

### Modify
- Message type: add optional fields: replyTo (quoted msg), pinned, saved, unsent, effect, type (text/voice/image/post/sticker/note)
- Message context menu: long press or hover → shows Reply, Forward, Delete for you, Unsend (own), Save, Pin, Copy options
- Chat header: add ⋯ button with Block, Mute, Search in chat options
- Input bar: replace single input row with richer toolbar — Camera, Gallery, Voice, Sticker, Effects icons + text input + Send

### Remove
- Nothing removed

## Implementation Plan
1. Extend Message type and Conversation type with new fields
2. Rewrite ChatPage input bar with full toolbar (Camera, Gallery, Voice Recorder, Stickers, Effects)
3. Add message context menu (long press / right click) with Reply, Forward, Delete, Unsend, Save, Pin, Copy
4. Add Reply UI — quoted message bar above input when replying
5. Add Pinned message banner at top of chat
6. Add Notes modal with Song, Note, Location sub-options
7. Add Block option in chat header ⋯ menu
8. Add Post card bubble type for sending/receiving posts
9. Add sticker panel with emoji stickers
10. Add voice message bubble with waveform animation UI
11. Add camera capture mock UI modal
