# Duplicate Questions Fix

## Issue

A question about "Trie data structure" (ID: al-165) was appearing in the wrong channel ("layers" instead of "algorithms"), causing confusion in the UI.

## Root Cause

The `algorithms.json` file contained duplicate entries for the same question ID with different channel assignments:
1. First entry: `"channel": "layers"` (WRONG)
2. Second entry: `"channel": "algorithms"` (CORRECT)

## Questions Fixed

### 1. al-165 (Trie Data Structure)
- **Issue**: Duplicate with wrong channel "layers"
- **Fix**: Removed the duplicate with wrong channel, kept the correct "algorithms" version
- **File**: `client/src/lib/questions/algorithms.json`

### 2. sr-155 (SRE Question)
- **Issue**: Duplicate entry
- **Fix**: Removed duplicate, kept first occurrence
- **File**: `client/src/lib/questions/sre.json`

### 3. sy-171 (System Design Question)
- **Issue**: Duplicate entry
- **Fix**: Removed duplicate, kept first occurrence
- **File**: `client/src/lib/questions/system-design.json`

## Solution

### 1. Created Deduplication Script
**File**: `script/fix-duplicate-questions.js`

Features:
- Scans all question JSON files
- Detects duplicate IDs
- Removes duplicates with wrong channel assignments
- Creates backups before modifying files
- Reports all changes

Usage:
```bash
npm run fix:duplicates
```

### 2. Created Validation Script
**File**: `script/validate-questions.js`

Validates:
- ✅ No duplicate IDs across all files
- ✅ Channel matches filename
- ✅ All required fields present
- ✅ Valid difficulty levels
- ✅ Proper data types
- ✅ No empty strings

Usage:
```bash
npm run validate:questions
```

### 3. Added to Package.json
```json
{
  "scripts": {
    "validate:questions": "node script/validate-questions.js",
    "fix:duplicates": "node script/fix-duplicate-questions.js"
  }
}
```

## Prevention

### Automated Validation

Add to GitHub Actions workflow to prevent future issues:

```yaml
- name: Validate Questions
  run: npm run validate:questions
```

This will:
- Run on every PR
- Catch duplicates before merge
- Ensure data integrity
- Prevent wrong channel assignments

### Manual Checks

Before adding new questions:
1. Run `npm run validate:questions` to check current state
2. Add your questions
3. Run `npm run validate:questions` again
4. Fix any errors before committing

## Results

### Before Fix
- Total questions: 177
- Duplicates: 3
- Wrong channels: 1 ("layers" instead of "algorithms")

### After Fix
- Total questions: 174
- Duplicates: 0
- Wrong channels: 0
- All questions validated ✅

## Testing

Verified the fix:
```bash
# Check no duplicates remain
grep -c "al-165" client/src/lib/questions/algorithms.json
# Output: 1 (correct)

# Check correct channel
grep -A 10 '"id": "al-165"' client/src/lib/questions/algorithms.json | grep '"channel"'
# Output: "channel": "algorithms" (correct)

# Validate all questions
npm run validate:questions
# Output: ✅ All questions validated successfully!
```

## Backups

Original files backed up with `.backup` extension:
- `algorithms.json.backup`
- `sre.json.backup`
- `system-design.json.backup`

These can be deleted after verifying the fix works correctly.

## Future Improvements

1. **Pre-commit Hook**: Add validation to pre-commit hooks
2. **Question Generator**: Update generator to validate before saving
3. **Unique ID Generation**: Ensure IDs are truly unique across all channels
4. **Channel Validation**: Strict validation that channel matches filename

## Commands Reference

```bash
# Validate all questions
npm run validate:questions

# Fix duplicate questions
npm run fix:duplicates

# Check specific question
grep -A 20 '"id": "al-165"' client/src/lib/questions/algorithms.json

# Count questions per file
wc -l client/src/lib/questions/*.json
```

## Status

✅ **Fixed and Validated**
- All duplicates removed
- All questions have correct channels
- Validation scripts in place
- Ready for production

---

**Date**: December 2024
**Fixed By**: Automated deduplication script
**Validated**: All 174 questions pass validation
