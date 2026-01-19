# End Session

Implementation is complete. Wrap up the session.

## 1. Run Tests

Verify all tests pass (once test suite is set up):
```bash
# Run tests here when available
```

If tests fail, fix them before proceeding.

## 2. Update Documentation

**docs/ROADMAP.md**
- Mark completed task as done (move to Done section with date)
- Adjust Now/Next if priorities changed
- Add any new blockers discovered

**docs/SESSION_LOG.md**
Prepend a new entry:

```markdown
## Session: [TODAY'S DATE]

**Role**: [backend/frontend/qa/architecture]
**Task**: [Task from ROADMAP]
**Branch**: type/[branch-name]

### Summary
- [What was accomplished]

### Files Changed
- [List of files modified]

### Decisions
- [Any design decisions made]

### Blockers
- [Issues encountered, or "None"]

### Next
- [Suggested focus for next session]

---
```

### Update If Changed:
- `docs/OVERVIEW.md` - if architecture or system description changed
- `docs/ADR.md` - if significant technical decision was made (append new entry)

## 3. Final Commit

Ensure all changes are committed:
```bash
git status
git add .
git commit -m "type: description"
```

Commit types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

## 4. Merge to Main

```bash
git checkout main
git pull origin main
git merge [branch-name]
git push origin main
git branch -d [branch-name]
```

## 5. Session Summary

Provide a brief summary:
- What was accomplished this session
- Any issues encountered and how they were resolved
- Suggestions for next session (if applicable)
