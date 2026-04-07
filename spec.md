# Connectly

## Current State
Fully featured social media app (Version 63) with posts, reels, stories, chat, AI Studio, profile, notifications, settings with account centre, landing page, dummy ads, referral system. Material-style UI with existing color palette.

## Requested Changes (Diff)

### Add
- $5/month subscription plan with benefits: ad-free, AI Studio full access, verified badge, exclusive themes, priority support
- Subscription paywall UI: upgrade prompt for free users trying to access premium features

### Modify
- Account Centre: move from separate section into Settings as a dedicated subsection (not separate page)
- UI color palette: change to Vibrant & Youthful — primary purple (#7C3AED), coral/orange accent (#F97316), mint green (#10B981), warm white background, bold gradients
- Typography: rounder, more energetic font weights
- Cards: more vibrant gradient borders, bolder shadows
- Buttons: gradient purple-to-coral primary buttons
- Bottom nav: gradient active indicator
- Free users: ads visible, AI Studio limited (3 uses/day), no verified badge
- Premium users ($5/month): ad-free, full AI Studio, verified badge, exclusive color themes

### Remove
- Account Centre as a standalone separate menu item (integrate into Settings)
- Free subscription option (replace with $5/month paid plan)

## Implementation Plan
1. Update CSS design tokens: purple/coral/mint OKLCH palette, gradient variables
2. Redesign all major UI components with new color scheme: nav, cards, buttons, headers
3. Move Account Centre into Settings page as expandable section
4. Add subscription state (free vs premium $5/month mock)
5. Add upgrade modal/prompt for premium features
6. Show verified badge for premium users on profile
7. Limit AI Studio to 3 uses/day for free users with upgrade prompt
8. Hide ads for premium users
