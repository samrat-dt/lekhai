# Branching Strategy

This document outlines the Git branching strategy for the Lekhai project.

## Overview

We use a three-tier branching strategy to manage development, testing, and production releases:

```
dev → qa → prod
```

## Branches

### `dev` (Development)
- **Purpose**: Active development branch
- **Protection**: Not protected
- **Who can push**: All developers
- **Merge strategy**: Direct commits or feature branches
- **Testing**: Unit tests and integration tests run on PR
- **Deployment**: Not deployed to any environment automatically

### `qa` (Quality Assurance)
- **Purpose**: Testing and staging environment
- **Protection**: Require pull request reviews before merging
- **Who can push**: Dev team through pull requests
- **Source**: Merge from `dev` after code review
- **Testing**: Full test suite runs automatically
- **Deployment**: Deployed to staging environment for QA testing
- **Approval**: Product/QA team confirmation before promotion to prod

### `prod` (Production)
- **Purpose**: Production-ready code
- **Protection**: Require pull request reviews + require status checks
- **Who can push**: Tech lead/maintainer through pull requests only
- **Source**: Merge from `qa` only
- **Testing**: All checks must pass
- **Deployment**: Deployed automatically to production after merge
- **Approval**: Project lead/owner confirmation before merge

## Development Workflow

### 1. Feature Development
```bash
# Start on dev branch
git checkout dev
git pull origin dev

# Create feature branch (optional but recommended for larger features)
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push to dev or create PR for review
git push origin dev
# OR if using feature branch
git push origin feature/feature-name
git pull request on GitHub
```

### 2. Promote to QA
When features in `dev` are ready for testing:

```bash
# On local machine
git checkout qa
git pull origin qa

# Merge dev into qa
git merge dev

# Push to qa
git push origin qa

# Create a PR for documentation and team visibility
# Go to GitHub and create PR from dev → qa
```

### 3. Promote to Production
After QA testing is complete and user confirms:

```bash
# On local machine
git checkout prod
git pull origin prod

# Merge qa into prod
git merge qa

# Push to prod
git push origin prod

# Create a PR for final review
# Go to GitHub and create PR from qa → prod
```

## Commit Message Convention

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `perf`: Performance improvements
- `test`: Test additions or modifications
- `chore`: Build, dependency, or tool changes
- `security`: Security patches or improvements

**Examples:**
```
feat(auth): add password reset functionality
fix(dashboard): resolve team member display bug
docs: update deployment guide for Razorpay
security: implement rate limiting on auth endpoints
```

## Protected Branch Rules

### `prod` Branch
- ✅ Require pull request reviews (minimum 1 approval)
- ✅ Require status checks to pass
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require code review from code owners
- ✅ Require branches to be up to date before merging

### `qa` Branch
- ✅ Require pull request reviews (minimum 1 approval)
- ⚠️ Allow force pushes (if needed for hotfixes)

### `dev` Branch
- No protection (allows direct commits)
- Should still use PRs for code review when possible

## Hotfixes

For critical production bugs:

```bash
# Create hotfix branch from prod
git checkout prod
git pull origin prod
git checkout -b hotfix/bug-description

# Fix the bug
git add .
git commit -m "fix(scope): critical bug description"

# Create PR to prod and qa
git push origin hotfix/bug-description

# After merge to prod, also merge to qa and dev
```

## Release Process

1. Ensure all features in `dev` are tested
2. Create PR: `dev` → `qa` with release notes
3. QA team tests and confirms readiness
4. Project owner reviews and approves
5. Create PR: `qa` → `prod`
6. After merge, prod is automatically deployed
7. Backport any critical changes to `dev` if needed

## Branch Naming Convention

For feature/hotfix branches:

- `feature/user-auth` - New features
- `fix/login-error` - Bug fixes
- `hotfix/critical-security` - Critical production fixes
- `refactor/dashboard-ui` - Code refactoring
- `docs/api-guide` - Documentation updates

## FAQ

**Q: Can I commit directly to prod?**
A: No, all changes to prod must go through a pull request with approvals.

**Q: What if I need to revert a change from prod?**
A: Create a new hotfix branch from prod, revert the commit, and follow the hotfix process.

**Q: Should I always use feature branches?**
A: Recommended for features, not necessary for quick fixes on dev.

**Q: How often should we promote to QA?**
A: Whenever dev has stable features ready for testing (daily, weekly, or as needed).
