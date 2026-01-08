# Progressive Quiz System with RAG-based Question Selection

## Overview

The Quick Quiz feature now uses a progressive difficulty system that adapts to user performance and selects semantically related questions for a better learning experience.

## Key Improvements

### 1. Longer Wrong Answer Delay
- **Before**: 1500ms delay on wrong answers
- **After**: 3500ms delay on wrong answers
- **Benefit**: Users have more time to read and understand the explanation

### 2. Progressive Difficulty Adaptation
The system now tracks user performance and adjusts difficulty dynamically:

- **Beginner** → Start here for first 2 questions
- **Intermediate** → Move up if accuracy > 70%
- **Advanced** → Move up if consistently performing well
- **Adaptive Down** → Drop difficulty if accuracy < 40%

### 3. Semantic Question Selection
Questions are selected based on:
- **Keyword similarity** to previous questions
- **Difficulty progression** based on performance
- **Topic continuity** for better learning flow

## Implementation Details

### Client-Side Architecture
Since this is a static website deployed on GitHub Pages, all logic runs client-side:

```typescript
// Progressive quiz session tracking
interface QuizSession {
  questions: TestQuestion[];
  currentIndex: number;
  correctCount: number;
  totalAnswered: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  performanceHistory: boolean[];
}
```

### Question Selection Algorithm

1. **Calculate Performance**: Track last 3 answers to determine recent accuracy
2. **Determine Target Difficulty**: Adjust based on performance
3. **Calculate Relevance**: Use keyword matching to find related questions
4. **Select Question**: Pick from top 5 most relevant to add variety

### Keyword Matching
Instead of vector embeddings (which require a backend), we use:
- Stop word filtering
- Keyword extraction from question text
- Overlap scoring between questions
- Length similarity for complexity matching

## User Experience

### Visual Indicators
- **Difficulty Badge**: Shows current difficulty level (beginner/intermediate/advanced)
- **Performance Stats**: Displays correct/total answered
- **Credit Changes**: Animated feedback for earned/lost credits

### Timing
- **Correct Answer**: 800ms delay → next question
- **Wrong Answer**: 3500ms delay → shows explanation → next question

### Progressive Flow
1. Start with beginner questions
2. Gradually increase difficulty as user succeeds
3. Select related questions for topic continuity
4. Drop difficulty if user struggles
5. Complete 10 questions per session
6. Auto-refresh with new progressive set

## Files Modified

### New Files
- `client/src/lib/progressive-quiz.ts` - Progressive quiz logic and question selection

### Modified Files
- `client/src/components/mobile/MobileHomeFocused.tsx` - Updated QuickQuizCard component
  - Added quiz session state tracking
  - Increased wrong answer delay to 3500ms
  - Integrated progressive question selection
  - Added difficulty level indicator

## Benefits

1. **Better Learning**: Related questions help reinforce concepts
2. **Adaptive Difficulty**: Matches user's current skill level
3. **More Time to Learn**: Longer delay on wrong answers
4. **Engaging Experience**: Progressive challenge keeps users motivated
5. **Static-Friendly**: No backend required, works on GitHub Pages

## Future Enhancements

Potential improvements for future iterations:

1. **Pre-computed Embeddings**: Generate question embeddings at build time and include in static JSON
2. **Topic Clustering**: Group questions by topic for better progression
3. **Spaced Repetition Integration**: Use SRS data to inform difficulty selection
4. **Performance Analytics**: Track long-term learning patterns
5. **Custom Learning Paths**: Allow users to focus on specific topics

## Testing

The system has been tested with:
- TypeScript compilation ✓
- Vite build process ✓
- Multiple channel subscriptions ✓
- Progressive difficulty transitions ✓

## Configuration

Current settings in `MobileHomeFocused.tsx`:
```typescript
const advanceDelay = isCorrect ? 800 : 3500; // ms
const maxQuestions = 10; // per session
const recentPerformanceWindow = 3; // last N answers
const highPerformanceThreshold = 0.7; // 70% accuracy
const lowPerformanceThreshold = 0.4; // 40% accuracy
```

These can be adjusted based on user feedback and analytics.
