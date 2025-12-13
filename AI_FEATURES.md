# AI-Powered Features - Learn Reels

## Overview
AI-powered learning assistant integrated into the question interface using free OpenRouter models (no API key required).

## Features

### 1. **AI Tutor Mode** 🎓
Ask follow-up questions about the current interview question.

**Use Cases:**
- "Can you explain this in simpler terms?"
- "What are real-world applications of this?"
- "How does this relate to [other concept]?"
- "Can you give me an example?"

### 2. **Mock Interviewer Mode** 💼
Practice answering and get feedback on your responses.

**Use Cases:**
- Type your answer to the question
- Get constructive feedback
- Learn what interviewers look for
- Improve your communication

### 3. **Code Reviewer Mode** 👨‍💻
Get feedback on your solution approach.

**Use Cases:**
- Paste your code solution
- Get feedback on correctness
- Learn about efficiency improvements
- Discover best practices

### 4. **Quick Actions** ⚡

#### Progressive Hints (3 levels)
- **Level 1**: Subtle nudge in the right direction
- **Level 2**: More specific guidance
- **Level 3**: Detailed hint without spoiling

#### Concept Explainer
- Breaks down complex topics
- Uses analogies and examples
- Simplifies technical jargon

#### Related Questions
- Discover similar interview questions
- Practice related concepts
- Build comprehensive understanding

## How to Use

### Opening AI Chat
1. Click the **Sparkles icon** (✨) in the top navigation bar
2. AI chat panel slides in from the right
3. Choose your mode (Tutor, Interviewer, or Reviewer)

### Modes

#### Tutor Mode (Default)
- Best for understanding concepts
- Ask any follow-up questions
- Get detailed explanations

#### Interviewer Mode
- Practice your answers
- Get feedback like a real interview
- Improve communication skills

#### Reviewer Mode
- Submit code for review
- Get feedback on approach
- Learn optimization techniques

### Quick Actions

**Hint Button**: Click multiple times for progressive hints (1/3 → 2/3 → 3/3)

**Explain Button**: Get a simplified explanation of key concepts

**Related Button**: Discover similar questions to practice

## Technical Details

### AI Models Used (3-Tier Fallback System)

1. **OpenRouter - Mixtral 8x7B** (Primary)
   - Best quality responses
   - Free model with cookie authentication
   - See [OPENROUTER_SETUP.md](./OPENROUTER_SETUP.md) for setup

2. **HuggingFace - Zephyr 7B** (Secondary)
   - Good quality responses
   - Free, no authentication needed
   - Automatic fallback if OpenRouter unavailable

3. **Smart Mock Responses** (Tertiary)
   - Pattern-based intelligent responses
   - Always works, no API needed
   - Great for testing and demos

**Setup Required**: To use OpenRouter (best quality), follow the [OpenRouter Setup Guide](./OPENROUTER_SETUP.md).

**No Setup**: HuggingFace and Smart Fallback work out of the box!

### Features
- **Streaming responses** - See AI typing in real-time
- **Context-aware** - AI knows the current question
- **Mode-specific prompts** - Optimized for each use case
- **No data storage** - Conversations are ephemeral

## Privacy & Data

- ✅ No API key required
- ✅ No user data stored
- ✅ Conversations not saved
- ✅ Requests go through HuggingFace (or fallback to local)
- ✅ Open source implementation

## Tips for Best Results

### 1. Be Specific
❌ "Explain this"
✅ "Can you explain how consistent hashing minimizes data movement?"

### 2. Use the Right Mode
- **Tutor**: Understanding concepts
- **Interviewer**: Practicing answers
- **Reviewer**: Code feedback

### 3. Progressive Learning
1. Try to answer yourself first
2. Use hints if stuck
3. Ask tutor for clarification
4. Practice with interviewer mode

### 4. Explore Related Questions
After mastering one question, use "Related" to find similar ones

## Examples

### Tutor Mode
```
You: "What's the difference between Layer 4 and Layer 7 load balancing?"
AI: "Great question! Think of it like mail delivery..."
```

### Interviewer Mode
```
You: "Load balancing distributes traffic across servers..."
AI: "Good start! Your answer covers the basics. To make it stronger..."
```

### Reviewer Mode
```
You: [paste code]
AI: "Let's review your solution:
1. Correctness: ✓ Logic is sound
2. Efficiency: Consider using a hash map instead of array..."
```

## Keyboard Shortcuts

- **Enter** - Send message
- **Esc** - Close AI chat
- **Click Sparkles** - Toggle AI chat

## Limitations

- Responses limited to ~1000 tokens
- Free tier may have rate limits
- Requires internet connection
- AI may occasionally make mistakes (always verify!)

## Future Enhancements

Potential additions:
- [ ] Voice input/output
- [ ] Save favorite conversations
- [ ] Multi-turn context memory
- [ ] Custom AI personalities
- [ ] Diagram generation
- [ ] Code execution
- [ ] Spaced repetition integration
- [ ] Study group chat

## Troubleshooting

### AI Not Responding
- Check internet connection
- Try refreshing the page
- Rate limit may be hit (wait a minute)

### Slow Responses
- Free models may be slower during peak times
- Streaming shows progress in real-time

### Unexpected Answers
- AI is not perfect - use as a learning aid
- Cross-reference with official documentation
- Ask for clarification if needed

## Contributing

Want to improve AI features?
1. Add new prompt templates in `client/src/lib/ai.ts`
2. Enhance UI in `client/src/components/AIChat.tsx`
3. Test with different questions
4. Submit PR!

## Credits

- **HuggingFace** - Free AI model access
- **Mixtral/Mistral** - AI models
- **Meta Llama** - Alternative models

---

**Status**: ✅ Live and Ready

**Version**: 1.0

**Last Updated**: December 2024

**Powered by**: Free AI models via HuggingFace + Smart Fallbacks
