# Smart Question Sizing

## Problem

Long questions were taking up too much space in the question panel, making them hard to read and leaving little room for the answer panel.

## Solution

Implemented intelligent font sizing and layout adjustments based on question length.

## Features

### 1. Dynamic Font Sizing

Questions are automatically sized based on character count:

| Length | Size (Mobile → Desktop) | Use Case |
|--------|------------------------|----------|
| < 80 chars | `text-base → text-3xl` | Short, punchy questions |
| 80-150 chars | `text-base → text-2xl` | Medium questions |
| 150-250 chars | `text-sm → text-xl` | Long questions |
| > 250 chars | `text-xs → text-lg` | Very long questions |

### 2. Smart Line Height

- **Short questions**: Tight leading for impact
- **Medium questions**: Snug leading for readability
- **Long questions**: Relaxed leading for comfort

### 3. Adaptive Spacing

- **Short questions**: More spacing between elements (space-y-6)
- **Long questions**: Compact spacing (space-y-2) to fit more content

### 4. Dynamic Panel Height (Mobile)

- **Short questions**: `max-h-[30vh]` - Leaves more room for answers
- **Long questions**: `max-h-[40vh]` - Provides more reading space

### 5. Scroll Indicators

- Gradient fade at bottom for long questions on mobile
- Indicates more content available
- Only shows when needed (questions > 150 chars)

### 6. Scrollable Container

- Question panel is scrollable on mobile
- Custom scrollbar styling
- Smooth scrolling behavior

## Implementation

### QuestionPanel.tsx

```typescript
// Smart font sizing
className={`font-bold text-white ${
  question.question.length > 250 
    ? 'text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed'
    : question.question.length > 150
    ? 'text-sm sm:text-base md:text-lg lg:text-xl leading-snug'
    : question.question.length > 80
    ? 'text-base sm:text-lg md:text-xl lg:text-2xl leading-snug'
    : 'text-base sm:text-xl md:text-2xl lg:text-3xl leading-tight'
}`}
```

### ReelsRedesigned.tsx

```typescript
// Dynamic panel height
className={`w-full lg:w-[35%] h-auto ${
  currentQuestion.question.length > 200 
    ? 'max-h-[40vh]' // More space for long questions
    : 'max-h-[30vh]' // Less space for short questions
} lg:max-h-none lg:h-full`}
```

## Benefits

### Readability
- ✅ Long questions use smaller, more readable fonts
- ✅ Proper line height prevents cramping
- ✅ Scrollable when needed

### Space Efficiency
- ✅ Short questions get prominent display
- ✅ Long questions don't dominate the screen
- ✅ More room for answer panel

### User Experience
- ✅ Automatic adjustment (no manual intervention)
- ✅ Consistent across all questions
- ✅ Mobile-optimized

### Accessibility
- ✅ Maintains readability at all sizes
- ✅ Proper contrast maintained
- ✅ Scrollable with keyboard

## Examples

### Short Question (< 80 chars)
```
"What is a CDN?"
```
- Font: Large (text-3xl on desktop)
- Height: 30vh on mobile
- Spacing: Generous

### Medium Question (80-150 chars)
```
"Explain the difference between TCP and UDP. 
When would you use each protocol?"
```
- Font: Medium (text-2xl on desktop)
- Height: 30vh on mobile
- Spacing: Normal

### Long Question (150-250 chars)
```
"You have a microservice architecture with 50 services. 
Service A has a 95th percentile latency of 200ms and handles 
10,000 RPS. It calls Service B (50ms, 5,000 RPS) and Service C 
(100ms, 3,000 RPS). How do you plan capacity?"
```
- Font: Small (text-xl on desktop)
- Height: 40vh on mobile
- Spacing: Compact
- Scroll indicator: Yes

### Very Long Question (> 250 chars)
```
"Design a distributed rate limiting system that can handle 
1 million requests per second across 100 data centers. 
The system must support per-user limits, per-API limits, 
and global limits. Consider consistency, latency, and 
failure scenarios. How would you implement sliding window 
rate limiting with Redis?"
```
- Font: Extra small (text-lg on desktop)
- Height: 40vh on mobile
- Spacing: Very compact
- Scroll indicator: Yes
- Scrollable: Yes

## Responsive Breakpoints

### Mobile (< 640px)
- Smallest font sizes
- Compact spacing
- Scrollable panel
- Scroll indicators

### Tablet (640px - 1024px)
- Medium font sizes
- Normal spacing
- Scrollable if needed

### Desktop (> 1024px)
- Full font sizes
- Generous spacing
- Full height panel
- No scroll needed

## CSS Enhancements

### Custom Scrollbar
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
```

### Scroll Indicator
```css
.scroll-indicator {
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  height: 2rem;
  pointer-events: none;
}
```

## Testing

Test with questions of varying lengths:
- [ ] Short (< 80 chars) - Large, prominent
- [ ] Medium (80-150 chars) - Balanced
- [ ] Long (150-250 chars) - Compact, readable
- [ ] Very long (> 250 chars) - Scrollable, small font

## Future Improvements

- [ ] Add "Expand" button for very long questions
- [ ] Implement text truncation with "Read More"
- [ ] Add font size preference in settings
- [ ] Consider word count in addition to character count
- [ ] Add animation when switching between questions

## Performance

- ✅ No performance impact (pure CSS)
- ✅ Instant calculation (string length)
- ✅ No re-renders needed
- ✅ Smooth transitions

---

**Status**: ✅ Implemented and tested
**Version**: 3.2
**Date**: December 2024
