# LinkedIn Post Generator Guide

Automatically convert technical interview questions into engaging LinkedIn posts with diagrams and previews.

## 🚀 Quick Start

### Generate Posts

```bash
# Generate LinkedIn posts for recent questions
node script/linkedin-post-generator.js
```

This will:
1. Load the 5 most recent questions
2. Convert mermaid diagrams to SVG
3. Create HTML previews
4. Generate copy-ready text posts
5. Save everything to `linkedin-posts/` directory

### Manage Posts

```bash
# List all generated posts
node script/linkedin-post-manager.js list

# View a specific post
node script/linkedin-post-manager.js view sd-42

# Copy post to clipboard (ready to paste on LinkedIn)
node script/linkedin-post-manager.js copy sd-42

# Show preview file path (open in browser)
node script/linkedin-post-manager.js preview sd-42
```

## 📁 Post Structure

Each post is organized in its own directory:

```
linkedin-posts/
├── sd-42/
│   ├── post.txt          # Copy-paste ready text
│   ├── preview.html      # Visual preview
│   ├── diagram.svg       # Rendered diagram
│   └── metadata.json     # Post metadata
├── al-15/
│   ├── post.txt
│   ├── preview.html
│   ├── diagram.svg
│   └── metadata.json
└── ...
```

## 📝 Post Format

Each LinkedIn post includes:

1. **Hook** - "🎯 Technical Interview Question"
2. **Question** - The actual interview question
3. **Difficulty Badge** - 🟢 Beginner, 🟡 Intermediate, 🔴 Advanced
4. **Category** - Channel and sub-channel
5. **Quick Answer** - Concise answer (50-150 chars)
6. **Key Points** - First 2-3 points from explanation
7. **Tags** - Relevant hashtags
8. **CTA** - Call to action for engagement
9. **Link** - Link to Code Reels platform

### Example Post

```
🎯 Technical Interview Question

❓ What are Cloud Migration Strategies?

🟡 INTERMEDIATE

📚 devops / aws

💡 Quick Answer:
Lift-and-shift, re-platforming, refactoring, and repurchasing are the main strategies.

📖 Key Points:
- Lift-and-shift: Move applications as-is to cloud
- Re-platforming: Optimize for cloud while migrating
- Refactoring: Redesign application for cloud-native

#aws #cloud #devops #migration #infrastructure

💬 Have you encountered this in interviews? Share your approach in the comments!

🔗 Practice more questions on Code Reels: [link]
```

## 🎨 HTML Preview

Open `preview.html` in your browser to see:
- LinkedIn-style post layout
- Rendered diagram (if available)
- Proper formatting and styling
- Engagement buttons
- Post metadata

## 🔄 Automated Generation

Posts are automatically generated daily at **18:00 UTC** via GitHub Actions.

### Workflow Details

- **Trigger:** Daily at 18:00 UTC
- **Runs after:** All other bots (question generation, improvement, deduplication)
- **Generates:** 5 most recent questions
- **Artifacts:** Stored in `linkedin-posts/` and available as GitHub artifacts
- **Commits:** Changes are automatically committed to the repository

### Manual Trigger

```bash
# Trigger workflow manually
gh workflow run linkedin-posts.yml
```

## 💡 Tips for LinkedIn Sharing

1. **Copy the text** - Use `linkedin-post-manager.js copy <id>`
2. **Add the diagram** - Download the SVG and upload as image
3. **Customize if needed** - Add personal insights or experiences
4. **Use hashtags** - Already included in the post
5. **Engage** - Respond to comments and build community

## 🛠️ Customization

### Modify Post Format

Edit `script/linkedin-post-generator.js` function `generateLinkedInPost()` to customize:
- Emojis and formatting
- Section order
- Hashtags
- Call-to-action

### Change Diagram Rendering

The script uses `mermaid-cli` to render diagrams. To customize:
- Install: `npm install -g @mermaid-js/mermaid-cli`
- Modify theme in `renderMermaidToSvg()` function
- Change output format (currently SVG)

### Adjust Post Count

In `script/linkedin-post-generator.js`, change:
```javascript
const recentQuestions = allQuestions.slice(-5);  // Change 5 to desired count
```

## 📊 Post Analytics

Track post performance:
- View metadata in `metadata.json` for each post
- Monitor engagement on LinkedIn
- Collect feedback from comments
- Use insights to improve future questions

## 🐛 Troubleshooting

### Diagram not rendering

- Ensure `mermaid-cli` is installed: `npm install -g @mermaid-js/mermaid-cli`
- Check mermaid syntax in question diagram
- Posts will still generate without diagrams

### Posts not generating

- Check that questions exist: `node script/linkedin-post-manager.js list`
- Verify `linkedin-posts/` directory permissions
- Check Node.js version (18+)

### Preview not opening

- Manually open the HTML file in your browser
- Check file path from `linkedin-post-manager.js preview <id>`

## 📚 Related Documentation

- [README.md](README.md) - Main project documentation
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
