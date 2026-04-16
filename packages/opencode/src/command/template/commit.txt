---
description: git commit
---

generate git commit message and do git commit aciton

MAKE SURE it includes a prefix like

```
feat: New features
build: Used to modify the project build system, such as changing dependencies, external interfaces, or upgrading the Node version;
chore: Used to make non-business code changes, such as adjusting the build process or tool configurations;
ci: Used to modify the continuous integration workflow, such as adjusting configurations for Travis, Jenkins, and other CI pipelines;
docs: Used to update documentation, such as revising README files, API documentation, etc.;
style: Used to adjust code formatting, such as modifying indentation, spaces, blank lines, etc.;
refactor: Used for code refactoring, such as restructuring code, renaming variables or functions without changing functional logic;
perf: Used for performance optimization, such as improving code efficiency, reducing memory usage, etc.;
test: Used to modify test cases, such as adding, removing, or updating test cases for the code.
```

prefer to explain WHY something was done from an end user perspective instead of
WHAT was done.

do not do generic messages like "improved agent experience" be very specific
about what user facing changes were made

if there are conflicts DO NOT FIX THEM. notify me and I will fix them

After generating the Git commit message, wait for user confirmation. 
Display the generated Git commit message in the confirmation prompt, and execute the git commit command once confirmed by the user.

## GIT DIFF

!`git diff`

## GIT DIFF --cached

!`git diff --cached`

## GIT STATUS --short

!`git status --short`
