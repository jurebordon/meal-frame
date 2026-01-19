# Start Session

The session plan has been approved. Begin implementation.

## 1. Verify Environment

Run baseline checks if tests are available:
```bash
# Once test suite is set up, run tests here
```

Check for uncommitted changes:
```bash
git status
```

If tests fail or uncommitted changes exist, resolve before proceeding.

## 2. Create Feature Branch

```bash
git checkout main && git pull origin main
git checkout -b type/description
```

Branch naming: `type/description`
Examples: `feat/user-auth`, `fix/login-bug`, `refactor/api-cleanup`, `docs/update-readme`

## 3. Determine Role

Based on the task, read the appropriate agent guide:
- Backend work → `.ai/agents/backend.md`
- Frontend work → `.ai/agents/frontend.md`

## 4. Begin Implementation

- Mark the task as in_progress in your tracking
- Follow the session plan step by step
- Commit frequently with clear messages
- Note any decisions or blockers as you encounter them

**Commit convention**: Conventional commits
- feat: New feature
- fix: Bug fix
- refactor: Code refactoring
- docs: Documentation changes
- test: Test additions/changes
- chore: Build/tooling changes

## Guidelines

- Stay within scope - one task, one session
- Commit after each logical chunk of work
- If blocked, document it and consider ending session early
- Don't create backup files - git is your safety net
