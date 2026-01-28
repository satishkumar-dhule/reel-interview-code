# Mobile Display Fixes - iPhone 13

## Issues Identified

### 1. Stats Page - Content Clipping
- Activity heatmap grid overflows on mobile
- Grid uses `grid-cols-13` which is too wide for mobile screens
- Text and content getting cut off on right side
- Menu items need better spacing

### 2. Home Page - Layout Breaking
- Content overflowing container
- Cards not properly responsive
- Text clipping on smaller screens

### 3. Navigation Menu - Display Issues
- Menu items cut off at bottom
- Content clipping when menu is open
- Need better safe area handling

## Fixes to Apply

### Stats Page (`client/src/pages/StatsGenZ.tsx`)

1. **Fix Activity Heatmap for Mobile**
   - Reduce grid columns on mobile (13 → 7 weeks)
   - Make grid responsive
   - Add horizontal scroll for full view
   - Fix grid layout to prevent overflow

2. **Fix Top Stats Cards**
   - Ensure proper padding on mobile
   - Prevent text overflow
   - Add responsive font sizes

3. **Fix Channel Progress Cards**
   - Better mobile spacing
   - Prevent text clipping
   - Responsive grid

### Home Page (`client/src/components/home/GenZHomePage.tsx`)

1. **Fix Container Overflow**
   - Add proper max-width constraints
   - Fix padding on mobile
   - Prevent horizontal scroll

2. **Fix Card Layouts**
   - Responsive grid columns
   - Better mobile spacing
   - Prevent content overflow

### Navigation (`client/src/components/layout/UnifiedNav.tsx`)

1. **Fix Menu Popup**
   - Already has pb-24 but may need more
   - Add safe area support
   - Better max-height handling

## Implementation

Let me fix these issues now.
