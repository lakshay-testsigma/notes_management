# Merge and rebase on the same fork

Commits C1 and C2 sit on main. The branch feature adds C3 and main adds C4, both with the parent C2. On main, git merge feature records a merge commit C5 with the two parents C4 and C3. On feature, git rebase main replays C3 on top of C4 as a new commit C3', so history is a straight line. Both give the same final files, so rebase only commits that exist only in your repository.

**00:00 Commits, branches and HEAD.** Each commit stores a snapshot and a link to its parent. A branch is a movable pointer, and HEAD names your current branch.

**00:10 One history forks into two.** Now the history forks into two lines. Feature adds C3, main adds C4, and both commits have the parent C2.

**00:19 git merge feature, on main.** On main, git merge feature combines C4, C3 and their common ancestor C2. Git records C5, a merge commit with two parents.

**00:29 git rebase main, on feature.** On feature, git rebase main replays the change of C3 on top of C4 as a new commit, C3'. History becomes a straight line.

**00:39 Same files, different history.** Both commands give the same final files, but rebase rewrites commits. Never rebase commits that exist outside your repository.

Sources:

- Pro Git — https://git-scm.com/book/en/v2
