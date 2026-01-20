# Curated Learning Paths - Content Pipeline

## Overview
Automated system to generate curated learning paths based on available content. Runs as part of daily batch pipeline.

## Pipeline Script
**Location**: `script/generate-curated-paths.js`

### Features
- ✅ Analyzes available channels and certifications
- ✅ Generates paths from predefined templates
- ✅ Validates content availability before creating paths
- ✅ Saves to database and generates JSON for frontend
- ✅ Tracks question counts per channel
- ✅ Filters optional content based on availability

### Path Templates Included
1. **Full-Stack Developer (Beginner)** - 12 weeks
2. **Cloud Engineer Path** - 16 weeks
3. **Data Structures & Algorithms Master** - 20 weeks
4. **Frontend Specialist** - 14 weeks
5. **Backend Engineer** - 16 weeks
6. **DevOps Specialist** - 18 weeks
7. **Security Engineer** - 20 weeks
8. **Mobile Developer** - 14 weeks
9. **AI/ML Engineer** - 24 weeks
10. **Interview Preparation Bootcamp** - 12 weeks

## Integration with Daily Batch

### Add to package.json
```json
{
  "scripts": {
    "generate-paths": "node script/generate-curated-paths.js",
    "daily-batch": "npm run generate-paths && npm run other-tasks"
  }
}
```

### GitHub Actions Workflow
```yaml
name: Daily Content Pipeline
on:
  schedule:
    - cron: '0 2 * * *'  # Run at 2 AM daily
  workflow_dispatch:

jobs:
  generate-content:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Generate curated paths
        run: npm run generate-paths
      
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add client/public/data/curated-paths.json
          git diff --quiet && git diff --staged --quiet || git commit -m "chore: update curated learning paths"
          git push
```

## Database Schema
```sql
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  level TEXT,
  channels TEXT,              -- JSON array
  optional_channels TEXT,     -- JSON array
  certifications TEXT,        -- JSON array
  estimated_weeks INTEGER,
  total_questions INTEGER,
  created_at TEXT,
  type TEXT DEFAULT 'curated'
);
```

## Output Files
1. **Database**: `questions.db` → `learning_paths` table
2. **JSON**: `client/public/data/curated-paths.json`

## Frontend Integration
The MyPathGenZ page already loads curated paths from localStorage. Update to fetch from JSON:

```typescript
// Load curated paths from JSON
useEffect(() => {
  fetch('/data/curated-paths.json')
    .then(res => res.json())
    .then(paths => setCuratedPaths(paths))
    .catch(err => console.error('Failed to load curated paths:', err));
}, []);
```

## Usage
```bash
# Manual run
node script/generate-curated-paths.js

# As part of build
npm run generate-paths
```

## Adding New Path Templates
Edit `PATH_TEMPLATES` array in `script/generate-curated-paths.js`:

```javascript
{
  id: 'unique-id',
  name: 'Path Name',
  description: 'Path description',
  icon: '🚀',
  level: 'beginner|intermediate|advanced',
  requiredChannels: ['channel-id-1', 'channel-id-2'],
  optionalChannels: ['optional-channel-1'],
  requiredCerts: ['cert-id'],
  estimatedWeeks: 12
}
```

## Validation Rules
- ✅ All required channels must exist
- ✅ All required channels must have questions (count > 0)
- ✅ All required certifications must exist
- ✅ Optional channels are filtered based on availability
- ✅ Paths without required content are skipped

## Monitoring
Script outputs:
- Number of channels found
- Number of certifications found
- List of generated paths with question counts
- List of skipped paths with reasons

## Next Steps
1. ✅ Script created
2. ⏳ Add to daily batch workflow
3. ⏳ Update frontend to load from JSON
4. ⏳ Add monitoring/alerts for failed runs
5. ⏳ Create admin UI for managing templates
